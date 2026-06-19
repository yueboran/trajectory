import React, { useState, useRef } from "react";
import TiptapEditor, { TiptapEditorRef } from "./TiptapEditor";
import { Sparkles } from "lucide-react";
import { Project, Comment, DraftRecord } from "../types";
import { getSelectableTags } from "../data/treeData";
import CategoryCascader from "./CategoryCascader";
import ConfirmModal from "./ConfirmModal";

interface SubmitFormProps {
  onSuccess: (data: any, isRecord: boolean) => void;
  onCancel?: () => void;
  initialTag?: string | null;
  isLocked?: boolean;
  targetProjectId?: string | null;
  targetProject?: Project | null;
  ratingFields?: string[];
  customInputs?: { name: string; type: 'singleLine' | 'multiLine' }[];
  initialRecord?: Comment | null;
  initialDraft?: DraftRecord | null;
  onSaveDraft?: (draft: DraftRecord) => void;
  onDiscardDraft?: (draftId: string) => void;
}

export default function SubmitForm({ onSuccess, onCancel, initialTag, isLocked, targetProjectId, targetProject, ratingFields, customInputs, initialRecord, initialDraft, onSaveDraft, onDiscardDraft }: SubmitFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const selectableTags = getSelectableTags();
  // 设置默认的三级路径
  const [selectedTag, setSelectedTag] = useState(initialTag || initialRecord?.category || initialDraft?.tag || selectableTags[0]?.value || "1. 健康与精力 / 身体健康 / 运动记录");
  const [ratings, setRatings] = useState<Record<string, string>>(initialRecord?.ratings ? Object.fromEntries(Object.entries(initialRecord.ratings).map(([k, v]) => [k, v.toString()])) : (initialDraft?.ratings || {}));
  const [customData, setCustomData] = useState<Record<string, string>>(initialRecord?.customData || initialDraft?.customData || {});
  const [titleInput, setTitleInput] = useState(initialRecord?.title || initialDraft?.title || "");
  const editorRef = useRef<TiptapEditorRef>(null);

  React.useEffect(() => {
    if (initialTag) {
      setSelectedTag(initialTag);
    }
  }, [initialTag]);

  // 全局暴露脏状态供跨 Tab 切换拦截，并暴露草稿保存方法
  React.useEffect(() => {
    const interval = setInterval(() => {
      const empty = editorRef.current?.isEmpty();
      (window as any).isSubmitFormDirty = empty === false;
    }, 1000);

    (window as any).saveCurrentDraft = () => {
      const empty = editorRef.current?.isEmpty();
      if (empty !== false) return null;
      const html = editorRef.current?.getHTML() || "";
      const text = editorRef.current?.getText() || "";
      const title = targetProject?.requireTitleField ? titleInput : (text.trim().slice(0, 20) || "草稿记录");
      const draft: DraftRecord = {
        id: initialDraft?.id || "draft-" + Date.now(),
        title,
        content: html,
        targetProjectId: targetProjectId || null,
        tag: selectedTag,
        ratings,
        customData,
        timeAgo: new Date().toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      };
      return draft;
    };

    return () => {
      clearInterval(interval);
      (window as any).isSubmitFormDirty = false;
      delete (window as any).saveCurrentDraft;
    };
  }, [initialDraft, targetProjectId, selectedTag, ratings, customData]);

  const handleCancelClick = () => {
    const empty = editorRef.current?.isEmpty();
    if (empty === false) {
      setShowCancelModal(true);
    } else {
      if (onCancel) onCancel();
    }
  };

  const handleSubmit = async () => {
    if (!editorRef.current) return;
    
    const html = editorRef.current.getHTML();
    const text = editorRef.current.getText();

    setErrorMessage("");

    const title = targetProject?.requireTitleField ? titleInput : (text.trim().slice(0, 20) || "生活点滴");
    const plainDescription = text.replace(/\n+/g, " ");

    const parsedRatings: Record<string, number> = {};
    Object.entries(ratings).forEach(([key, val]) => {
      if (val.trim() !== "" && !isNaN(Number(val))) {
        parsedRatings[key] = Number(val);
      }
    });

    if (targetProjectId) {
      const payload = {
        author: "月伯然",
        title: title,
        content: html,
        ratings: parsedRatings,
        customData: customData,
        type: initialRecord ? initialRecord.type : undefined,
        category: selectedTag,
      };
      
      try {
        const isEdit = !!initialRecord;
        const url = isEdit
          ? `/api/projects/${targetProjectId}/comments/${initialRecord.id}`
          : `/api/projects/${targetProjectId}/comments`;
          
        const response = await fetch(url, {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("stars:token")}`
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          const data = await response.json();
          // API 返回的是 ApiResponse，数据在 data 字段中。如果是我们自己封装的，我们提取 data.data 或 data 本身
          // 这里 main.py 返回 make_response(schema)，也就是 {"status": "success", "data": ...}
          const commentData = data.data || data;
          onSuccess(commentData, true);
        } else {
          setErrorMessage("提交失败，请重试");
        }
      } catch (err) {
        setErrorMessage("网络错误");
      }
    }
  };

  if (!targetProjectId) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6 animate-fade-in">
        <div className="w-20 h-20 mb-6 rounded-full bg-[#1A1B1E] border border-white/5 flex items-center justify-center shadow-inner">
          <Sparkles className="w-8 h-8 text-[#A0A0A0]/50" />
        </div>
        <h2 className="text-[22px] font-black tracking-wide text-white mb-4">草稿箱为空</h2>
        <div className="text-[#808080] text-[14px] leading-relaxed max-w-sm">
          <p className="mb-2">请按照以下流程操作：</p>
          <p className="flex items-center justify-center gap-2">
            <span className="px-2 py-1 bg-white/5 rounded-md text-[12px]">选择列表或主页</span> 
            <span>→</span>
            <span className="px-2 py-1 bg-white/5 rounded-md text-[12px]">选择档案库</span>
            <span>→</span>
            <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md text-[12px]">创建/编辑记录</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 select-none max-w-2xl mx-auto w-full animate-fade-in mt-4">
      <ConfirmModal
        isOpen={showCancelModal}
        title="保存草稿"
        message="是否将当前内容保存为草稿？"
        onConfirm={() => {
          setShowCancelModal(false);
          if (onSaveDraft && (window as any).saveCurrentDraft) {
            const draft = (window as any).saveCurrentDraft();
            if (draft) {
              onSaveDraft(draft);
            }
          }
          if (onCancel) onCancel();
        }}
        onCancel={() => {
          setShowCancelModal(false);
          if (initialDraft && onDiscardDraft) {
            onDiscardDraft(initialDraft.id);
          }
          if (onCancel) onCancel();
        }}
      />
      <div className="space-y-4">
        {/* 选项区：档案库选择（三级联动）/ 或者展示来源档案库卡片 */}
        {isLocked && targetProject ? (
          <div className="relative z-20 p-6 bg-[#1a1b1e]/50 backdrop-blur-sm border border-white/5 rounded-3xl shadow-inner transition-all overflow-hidden group">
            {/* 动态渐变背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-50 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col">
              {/* 标签路径 */}
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                {targetProject.tags?.[0]?.split(' / ').map((part, i, arr) => (
                  <React.Fragment key={i}>
                    <span className="text-[12px] font-semibold text-amber-400 tracking-wide">
                      {part}
                    </span>
                    {i < arr.length - 1 && (
                      <span className="text-[#606060] text-[10px] mx-0.5">❯</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              {/* 标题 */}
              <h2 className="text-[22px] md:text-[26px] font-black text-[#F0F0F0] leading-tight mb-2.5 tracking-tight drop-shadow-sm">
                {targetProject.name}
              </h2>
              
              {/* 简介 */}
              <p className="text-[13px] text-[#808080] leading-[1.6] max-w-[90%]">
                {targetProject.intro}
              </p>
            </div>
          </div>
        ) : (
          <div className="relative z-20 p-5 bg-[#1a1b1e]/50 backdrop-blur-sm border border-white/5 rounded-2xl shadow-inner transition-all hover:border-white/10">
            <label className="block text-[13px] font-bold text-[#cbc3d7] mb-3 tracking-wide pl-1">档案库归属</label>
            {isLocked ? (
              <div className="w-full bg-[#1a1b1e]/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3.5 text-[14px] text-[#A0A0A0] transition-colors flex justify-start items-center opacity-70 cursor-not-allowed select-none">
                <span className="truncate">{selectedTag}</span>
              </div>
            ) : (
              <CategoryCascader 
                value={selectedTag} 
                onChange={setSelectedTag} 
                disabledLevels={[false, false, false]}
              />
            )}
          </div>
        )}

        {/* 动态模板输入区 */}
        {ratingFields && ratingFields.length > 0 && (
          <div className="relative z-10 p-5 bg-[#1a1b1e]/50 backdrop-blur-sm border border-amber-500/10 rounded-2xl shadow-inner transition-all hover:border-amber-500/20">
            <label className="block text-[13px] font-bold text-amber-500/80 mb-3 tracking-wide pl-1">补充评分</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ratingFields.map(field => (
                <div key={field} className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-[#A0A0A0] ml-1">{field}</label>
                  <input
                    type="number"
                    value={ratings[field] || ""}
                    onChange={(e) => setRatings({...ratings, [field]: e.target.value})}
                    placeholder="输入评分"
                    className="w-full bg-[#141416] border border-[#2A2A2E] rounded-xl px-3 py-2 text-[13px] text-[#E0E0E0] placeholder-[#404040] focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 自定义输入字段渲染区 */}
        {customInputs && customInputs.length > 0 && (
          <div className="relative z-10 p-5 bg-[#1a1b1e]/50 backdrop-blur-sm border border-[#4cd7f6]/10 rounded-2xl shadow-inner transition-all hover:border-[#4cd7f6]/20">
            <label className="block text-[13px] font-bold text-[#4cd7f6]/80 mb-3 tracking-wide pl-1">扩展信息</label>
            <div className="flex flex-col gap-4">
              {customInputs.map(field => (
                <div key={field.name} className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[#A0A0A0] ml-1">{field.name}</label>
                  {field.type === 'singleLine' ? (
                    <input
                      type="text"
                      value={customData[field.name] || ""}
                      onChange={(e) => setCustomData({...customData, [field.name]: e.target.value})}
                      placeholder={`输入 ${field.name}...`}
                      className="w-full bg-[#141416] border border-[#2A2A2E] rounded-xl px-4 py-3 text-[14px] text-[#E0E0E0] placeholder-[#404040] focus:outline-none focus:border-[#4cd7f6]/50 transition-colors"
                    />
                  ) : (
                    <textarea
                      value={customData[field.name] || ""}
                      onChange={(e) => setCustomData({...customData, [field.name]: e.target.value})}
                      placeholder={`输入 ${field.name}...`}
                      className="w-full bg-[#141416] border border-[#2A2A2E] rounded-xl px-4 py-3 text-[14px] text-[#E0E0E0] placeholder-[#404040] focus:outline-none focus:border-[#4cd7f6]/50 transition-colors min-h-[100px] resize-none leading-[1.7]"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 可选标题输入区 */}
        {targetProject?.requireTitleField && (
          <div className="relative z-10 p-5 bg-[#1a1b1e]/50 backdrop-blur-sm border border-amber-500/10 rounded-2xl shadow-inner transition-all hover:border-amber-500/20 mt-4">
            <label className="block text-[13px] font-bold text-[#E0E0E0] mb-3 tracking-wide pl-1">标题</label>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="请输入标题..."
              className="w-full bg-[#141416] border border-[#2A2A2E] rounded-xl px-4 py-3 text-[15px] font-semibold text-[#E0E0E0] placeholder-[#404040] focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
        )}

        {/* Tiptap 富文本编辑器 */}
        <div className="mt-4 relative group bg-[#1a1b1e]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 focus-within:border-amber-500/30 focus-within:bg-[#1a1b1e]/80 transition-all duration-300 min-h-[300px] flex flex-col shadow-inner">
          <TiptapEditor ref={editorRef} initialContent={initialRecord?.content || initialDraft?.content || ""} />
          <div className="absolute top-4 right-4 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity duration-500">
             <Sparkles className="w-5 h-5 text-amber-400/30" />
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs text-center font-bold">
            {errorMessage}
          </div>
        )}

        {/* 底部操作区 */}
        <div className="flex gap-4 pt-8">
          <button 
            onClick={handleCancelClick}
            className="flex-1 py-4 bg-[#1a1b1e]/60 hover:bg-[#232429] border border-white/5 rounded-xl text-[#cbc3d7] font-sans text-sm font-bold tracking-widest transition-all duration-300 shadow-sm"
          >
            取消
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-[2] py-4 rounded-xl font-sans text-sm font-bold tracking-widest transition-all duration-500 shadow-lg relative overflow-hidden group bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-amber-400/50"
          >
            <span className="relative z-10">发布</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
          </button>
        </div>
      </div>
    </div>
  );
}
