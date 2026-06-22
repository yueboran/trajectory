import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import CategoryCascader from "./CategoryCascader";

export interface ArchiveFormData {
  name: string;
  intro: string;
  tag: string;
  ratingFields: string[];
  customInputs: { name: string; type: 'singleLine' | 'multiLine' }[];
  requireTitleField: boolean;
}

interface ArchiveFormModalProps {
  isOpen: boolean;
  editingId: string | null;
  initialData: ArchiveFormData;
  filterTag?: string; // 用于 disabledLevels 逻辑
  onClose: () => void;
  onSubmit: (data: ArchiveFormData) => void;
}

export default function ArchiveFormModal({
  isOpen,
  editingId,
  initialData,
  filterTag,
  onClose,
  onSubmit
}: ArchiveFormModalProps) {
  const [formData, setFormData] = useState<ArchiveFormData>(initialData);
  const [ratingInput, setRatingInput] = useState("");
  const [customInputName, setCustomInputName] = useState("");
  const [customInputType, setCustomInputType] = useState<'singleLine' | 'multiLine'>('singleLine');

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setRatingInput("");
      setCustomInputName("");
      setCustomInputType("singleLine");
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.intro.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[101] w-full md:max-w-md mx-auto bg-[#1A1A1E] border-t md:border border-[#2A2A2E] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl rounded-t-3xl md:rounded-2xl animate-fade-in flex flex-col max-h-[85vh] md:max-h-[90vh]">
        
        {/* Header 区域 - 始终固定在顶部 */}
        <div className="shrink-0 p-6 pb-2 relative border-b border-transparent">
          {/* 手机端拖拽指示条 */}
          <div className="md:hidden w-10 h-1.5 bg-[#383838] rounded-full mx-auto mb-5" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#606060] hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>

          <h3 className="text-[18px] font-bold text-[#E0E0E0] mb-2">
            {editingId ? "编辑档案库" : "新建档案库"}
          </h3>
        </div>

        {/* Form 内容区域 - 可滚动 */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 名称 */}
            <div>
              <label className="block text-[12px] font-medium text-[#707070] mb-1.5 tracking-wide">名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-[#141416] border border-[#2A2A2E] rounded-xl px-4 py-3 text-[15px] text-[#E0E0E0] placeholder-[#404040] focus:outline-none focus:border-[#505058] transition-colors"
                placeholder="例如：智能财报翻译官"
                required
              />
            </div>

            {/* 标签 */}
            <div>
              <label className="block text-[12px] font-medium text-[#707070] mb-1.5 tracking-wide">绑定分类标签</label>
              <CategoryCascader
                value={formData.tag}
                onChange={tag => setFormData({...formData, tag})}
                disabledLevels={
                  !editingId && filterTag && filterTag !== "全部" && filterTag !== "全部档案" 
                    ? [true, filterTag.split(' / ').length >= 2, filterTag.split(' / ').length >= 3] 
                    : [false, false, false]
                }
              />
            </div>

            {/* 简介 */}
            <div>
              <label className="block text-[12px] font-medium text-[#707070] mb-1.5 tracking-wide">简介</label>
              <textarea
                value={formData.intro}
                onChange={e => setFormData({...formData, intro: e.target.value})}
                className="w-full bg-[#141416] border border-[#2A2A2E] rounded-xl px-4 py-3 text-[15px] text-[#E0E0E0] placeholder-[#404040] focus:outline-none focus:border-[#505058] transition-colors min-h-[100px] resize-none leading-[1.7]"
                placeholder="一句话描述这个项目的核心痛点和方案..."
                required
              />
            </div>

            {/* 自定义评分模板 */}
            <div>
              <label className="block text-[12px] font-medium text-[#707070] mb-1.5 tracking-wide">自定义评分维度（如：豆瓣、IMDB）</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ratingInput}
                  onChange={(e) => setRatingInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (ratingInput.trim() && !formData.ratingFields.includes(ratingInput.trim())) {
                        setFormData({ ...formData, ratingFields: [...formData.ratingFields, ratingInput.trim()] });
                        setRatingInput("");
                      }
                    }
                  }}
                  className="flex-1 bg-[#141416] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[13px] text-[#E0E0E0] placeholder-[#404040] focus:outline-none focus:border-[#505058] transition-colors"
                  placeholder="输入维度名称后回车或点击添加..."
                />
                <button
                  type="button"
                  onClick={() => {
                    if (ratingInput.trim() && !formData.ratingFields.includes(ratingInput.trim())) {
                      setFormData({ ...formData, ratingFields: [...formData.ratingFields, ratingInput.trim()] });
                      setRatingInput("");
                    }
                  }}
                  className="px-3 py-2 bg-[#2A2A2E] text-[#A0A0A0] hover:text-white rounded-lg text-[12px] font-medium transition-colors"
                >
                  添加
                </button>
              </div>
              {formData.ratingFields.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.ratingFields.map(field => (
                    <div key={field} className="flex items-center gap-1.5 px-2 py-1 bg-[#1A1F2A] border border-[#4A90D9]/30 rounded-md text-[11px] text-[#7EB8E0]">
                      <span>{field}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, ratingFields: formData.ratingFields.filter(f => f !== field) })}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 自定义输入字段配置 */}
            <div>
              <label className="block text-[12px] font-medium text-[#707070] mb-1.5 tracking-wide">自定义输入字段（如：项目链接、核心技术）</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={customInputName}
                  onChange={(e) => setCustomInputName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (customInputName.trim() && !formData.customInputs.some(f => f.name === customInputName.trim())) {
                        setFormData({ ...formData, customInputs: [...formData.customInputs, { name: customInputName.trim(), type: customInputType }] });
                        setCustomInputName("");
                      }
                    }
                  }}
                  className="flex-[2] bg-[#141416] border border-[#2A2A2E] rounded-lg px-3 py-2 text-[13px] text-[#E0E0E0] placeholder-[#404040] focus:outline-none focus:border-[#505058] transition-colors"
                  placeholder="字段名称..."
                />
                <select
                  value={customInputType}
                  onChange={(e) => setCustomInputType(e.target.value as 'singleLine' | 'multiLine')}
                  className="flex-1 bg-[#141416] border border-[#2A2A2E] rounded-lg px-2 py-2 text-[13px] text-[#A0A0A0] focus:outline-none focus:border-[#505058] transition-colors cursor-pointer appearance-none"
                >
                  <option value="singleLine">单行</option>
                  <option value="multiLine">长文本</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (customInputName.trim() && !formData.customInputs.some(f => f.name === customInputName.trim())) {
                      setFormData({ ...formData, customInputs: [...formData.customInputs, { name: customInputName.trim(), type: customInputType }] });
                      setCustomInputName("");
                    }
                  }}
                  className="px-3 py-2 bg-[#2A2A2E] text-[#A0A0A0] hover:text-white rounded-lg text-[12px] font-medium transition-colors"
                >
                  添加
                </button>
              </div>
              {formData.customInputs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.customInputs.map(field => (
                    <div key={field.name} className="flex items-center gap-1.5 px-2 py-1 bg-[#231F1A] border border-[#D9A04A]/30 rounded-md text-[11px] text-[#E0B87E]">
                      <span>{field.name} ({field.type === 'singleLine' ? '单行' : '长文本'})</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, customInputs: formData.customInputs.filter(f => f.name !== field.name) })}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 记录标题开关 */}
            <div className="flex items-center justify-between pt-2 pb-1">
              <div className="flex flex-col">
                <label className="text-[13px] font-medium text-[#E0E0E0]">启用记录标题输入</label>
                <span className="text-[11px] text-[#707070] mt-0.5">在添加记录时，是否提供专门的标题输入框</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.requireTitleField}
                  onChange={(e) => setFormData({...formData, requireTitleField: e.target.checked})}
                />
                <div className="w-11 h-6 bg-[#2A2A2E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#A0A0A0] peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F0F0F0]"></div>
              </label>
            </div>

            {/* 操作按钮 */}
            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-[13px] font-semibold border border-[#2A2A2E] text-[#808080] hover:bg-white/5 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl text-[13px] font-semibold bg-[#F0F0F0] text-[#141416] hover:bg-white transition-colors"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
