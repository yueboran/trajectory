import React, { useState, useRef } from "react";
import TiptapEditor, { TiptapEditorRef } from "./TiptapEditor";
import { Sparkles } from "lucide-react";
import { Project } from "../types";
import { getSelectableTags } from "../data/treeData";
import CategoryCascader from "./CategoryCascader";
import ConfirmModal from "./ConfirmModal";

interface SubmitFormProps {
  onSuccess: (data: any, isRecord: boolean) => void;
  onCancel?: () => void;
  initialTag?: string | null;
  isLocked?: boolean;
  targetProjectId?: string | null;
  ratingFields?: string[];
}

export default function SubmitForm({ onSuccess, onCancel, initialTag, isLocked, targetProjectId, ratingFields }: SubmitFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const selectableTags = getSelectableTags();
  // 设置默认的三级路径
  const [selectedTag, setSelectedTag] = useState(initialTag || selectableTags[0]?.value || "1. 健康与精力 / 身体健康 / 运动记录");
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const editorRef = useRef<TiptapEditorRef>(null);

  React.useEffect(() => {
    if (initialTag) {
      setSelectedTag(initialTag);
    }
  }, [initialTag]);

  // 全局暴露脏状态供跨 Tab 切换拦截
  React.useEffect(() => {
    const interval = setInterval(() => {
      const text = editorRef.current?.getText() || "";
      (window as any).isSubmitFormDirty = text.trim().length > 0;
    }, 1000);
    return () => {
      clearInterval(interval);
      (window as any).isSubmitFormDirty = false;
    };
  }, []);

  const handleCancelClick = () => {
    const text = editorRef.current?.getText() || "";
    if (text.trim().length > 0) {
      setShowCancelModal(true);
    } else {
      if (onCancel) onCancel();
    }
  };

  const handleSubmit = () => {
    if (!editorRef.current) return;
    
    const html = editorRef.current.getHTML();
    const text = editorRef.current.getText();

    if (editorRef.current.isEmpty()) {
      setErrorMessage("写点什么吧...");
      return;
    }
    setErrorMessage("");

    const title = text.trim().slice(0, 20) || "生活点滴";
    const plainDescription = text.replace(/\n+/g, " ");

    const parsedRatings: Record<string, number> = {};
    Object.entries(ratings).forEach(([key, val]) => {
      if (val.trim() !== "" && !isNaN(Number(val))) {
        parsedRatings[key] = Number(val);
      }
    });

    if (targetProjectId) {
      const newComment = {
        id: "comment-" + Date.now(),
        author: "Me",
        timeAgo: "刚刚",
        title: title,
        content: html,
        ratings: parsedRatings
      };
      onSuccess(newComment, true);
    } else {
      const newProject: Project = {
        id: "proj-" + Date.now(),
        name: title,
        icon: "rocket_launch", 
        intro: plainDescription.slice(0, 100) + (plainDescription.length > 100 ? "..." : ""),
        description: html,
        auroraScore: 10 + Math.random() * 20,
        radar: {
          concept: Math.round(50 + Math.random() * 40),
          research: Math.round(30 + Math.random() * 30),
          planning: Math.round(20 + Math.random() * 30),
          extension: Math.round(10 + Math.random() * 20),
          evaluation: Math.round(10 + Math.random() * 20),
        },
        tags: [selectedTag],
        commentsCount: 0,
        timeAgo: "刚刚",
        comments: [],
        hotness: "0k",
        likes: 0,
      };
      onSuccess(newProject, false);
    }
  };

  return (
    <div className="pb-32 px-4 select-none max-w-2xl mx-auto w-full animate-fade-in mt-4">
      <ConfirmModal
        isOpen={showCancelModal}
        title="保存草稿"
        message="是否将当前内容保存为草稿？"
        onConfirm={() => {
          setShowCancelModal(false);
          if (onCancel) onCancel();
        }}
        onCancel={() => {
          setShowCancelModal(false);
          if (onCancel) onCancel();
        }}
      />
      <div className="space-y-4">
        {/* 选项区：档案库选择（三级联动） */}
        <div className="relative z-20 p-5 bg-[#1a1b1e]/50 backdrop-blur-sm border border-white/5 rounded-2xl shadow-inner transition-all hover:border-white/10">
          <label className="block text-[13px] font-bold text-[#cbc3d7] mb-3 tracking-wide pl-1">选择档案库分类</label>
          <CategoryCascader 
            value={selectedTag} 
            onChange={setSelectedTag} 
            disabledLevels={isLocked ? [true, true, true] : [false, false, false]}
          />
        </div>

        {/* 动态模板输入区 */}
        {ratingFields && ratingFields.length > 0 && (
          <div className="relative z-10 p-5 bg-[#1a1b1e]/50 backdrop-blur-sm border border-amber-500/10 rounded-2xl shadow-inner transition-all hover:border-amber-500/20">
            <label className="block text-[13px] font-bold text-amber-500/80 mb-3 tracking-wide pl-1">档案库模板：补充评分</label>
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

        {/* Tiptap 富文本编辑器 */}
        <div className="mt-4 relative group bg-[#1a1b1e]/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 focus-within:border-amber-500/30 focus-within:bg-[#1a1b1e]/80 transition-all duration-300 min-h-[300px] flex flex-col shadow-inner">
          <TiptapEditor ref={editorRef} />
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
