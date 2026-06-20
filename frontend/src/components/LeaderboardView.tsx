import React, { useState } from "react";
import { ChevronRight, Edit2, Trash2, Plus, X, MoreHorizontal, Star, User, Filter } from "lucide-react";
import { Project } from "../types";
import { getSelectableTags, treeData } from "../data/treeData";
import ArchiveDetailView from "./ArchiveDetailView";
import CategoryCascader from "./CategoryCascader";
import ConfirmModal from "./ConfirmModal";
interface LeaderboardViewProps {
  projects?: Project[];
  initialFilter?: string;
  onSelectProject?: (id: string) => void;
  onAddProject?: (p: Project) => void;
  onUpdateProject?: (id: string, p: Partial<Project>) => void;
  onDeleteProject?: (id: string) => void;
  onBookmarkToggle?: (id: string, e: React.MouseEvent) => void;
  onToggleRecordBookmark?: (projectId: string, recordId: string) => void;
  onNavigateToSubmit?: (projectId: string, tag: string, ratingFields?: string[], customInputs?: {name: string, type: 'singleLine'|'multiLine'}[]) => void;
  currentUser?: any;
  onNavigateToAuth?: () => void;
}

/**
 * 档案馆列表页 — 沉浸式设计
 *
 * 设计原则：
 * 1. 底色 #141416（暖黑），卡片 #1A1A1E（微亮突出）
 * 2. 标题 15px semibold，简介 13px regular，行高 1.6
 * 3. 卡片式布局（Flomo 风格），圆角 + 微边框
 * 4. 操作按钮收敛进 ··· 菜单，保持界面克制
 * 5. Hero 区域柔和渐变，减少视觉压迫
 */
export default function LeaderboardView({ projects, initialFilter = "全部", onSelectProject, onAddProject, onUpdateProject, onDeleteProject, onBookmarkToggle, onToggleRecordBookmark, onNavigateToSubmit, currentUser, onNavigateToAuth }: LeaderboardViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{name: string, intro: string, tag: string, ratingFields: string[], customInputs: { name: string; type: 'singleLine' | 'multiLine' }[], requireTitleField: boolean}>({ name: "", intro: "", tag: "", ratingFields: [], customInputs: [], requireTitleField: false });
  const [ratingInput, setRatingInput] = useState("");
  const [customInputName, setCustomInputName] = useState("");
  const [customInputType, setCustomInputType] = useState<'singleLine' | 'multiLine'>('singleLine');
  // 档案库内部导航状态
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);
  // 展开的操作菜单
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string>(initialFilter);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  // 抽屉与过滤内部状态
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const activeLevel1 = filterTag === "全部" ? "全部" : filterTag.split(' / ')[0];
  const activeLevel2 = filterTag === "全部" ? "" : (filterTag.split(' / ')[1] || "");
  const activeLevel3 = filterTag === "全部" ? "" : (filterTag.split(' / ')[2] || "");

  const handleL1Click = (l1Label: string) => {
    if (l1Label === "全部") {
      setFilterTag("全部");
    } else {
      setFilterTag(l1Label);
    }
  };

  const currentL1Node = treeData.find(n => n.label.split('(')[0].trim() === activeLevel1);

  // 查找当前节点以获取背景图
  let currentBgImage = '/images/banners/hero_carousel_banner.webp';
  if (currentL1Node) {
    currentBgImage = currentL1Node.image || currentBgImage;
    if (activeLevel2 && currentL1Node.children) {
      const l2Node = currentL1Node.children.find(n => n.label.trim() === activeLevel2);
      if (l2Node) {
        currentBgImage = l2Node.image || currentBgImage;
        if (activeLevel3 && l2Node.children) {
          const l3Node = l2Node.children.find(n => n.label.trim() === activeLevel3);
          if (l3Node) {
            currentBgImage = l3Node.image || currentBgImage;
          }
        }
      }
    }
  }
  
  React.useEffect(() => {
    setFilterTag(initialFilter);
  }, [initialFilter]);

  // 获取所有可选标签
  const selectableTags = getSelectableTags();

  // 如果没有 projects 则默认为空数组
  const allProjects = projects || [];
  const displayProjects = allProjects.filter((p) => {
    if (filterTag === "全部") return true;
    const projectPath = p.tags && p.tags[0] ? p.tags[0] : "";
    return projectPath.startsWith(filterTag);
  });

  const handleOpenForm = (project?: Project) => {
    if (project) {
      setEditingId(project.id);
      setFormData({
        name: project.name,
        intro: project.intro,
        tag: project.tags && project.tags.length > 0 ? project.tags[0] : selectableTags[0]?.value || "",
        ratingFields: project.ratingFields || [],
        customInputs: project.customInputs || [],
        requireTitleField: project.requireTitleField || false
      });
    } else {
      setEditingId(null);
      let initialTag = selectableTags[0]?.value || "";
      if (filterTag && filterTag !== "全部" && filterTag !== "全部档案") {
        const matchedTag = selectableTags.find(t => t.value.startsWith(filterTag));
        if (matchedTag) {
          initialTag = matchedTag.value;
        }
      }
      setFormData({ name: "", intro: "", tag: initialTag, ratingFields: [], customInputs: [], requireTitleField: false });
    }
    setActiveMenuId(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.intro.trim()) return;

    if (editingId) {
      if (onUpdateProject) {
        onUpdateProject(editingId, {
          name: formData.name,
          intro: formData.intro,
          tags: [formData.tag],
          ratingFields: formData.ratingFields,
          customInputs: formData.customInputs,
          requireTitleField: formData.requireTitleField
        });
      }
    } else {
      if (onAddProject) {
        const newProject: Project = {
          id: `proj-${Date.now()}`,
          name: formData.name,
          intro: formData.intro,
          description: formData.intro,
          tags: [formData.tag],
          ratingFields: formData.ratingFields,
          customInputs: formData.customInputs,
          requireTitleField: formData.requireTitleField,
          icon: "folder",
          auroraScore: 80,
          radar: { concept: 80, research: 80, planning: 80, extension: 80, evaluation: 80 },
          commentsCount: 0,
          timeAgo: "刚刚",
          comments: [],
          hotness: "0k",
          likes: 0
        };
        onAddProject(newProject);
      }
    }
    handleCloseForm();
  };

  const handleDelete = (id: string) => {
    setActiveMenuId(null);
    setDeleteProjectId(id);
  };

  // 将标签拆分为路径
  const getCategoryPath = (tags?: string[]) => {
    if (!tags || tags.length === 0) return ["未分类"];
    if (tags[0].includes(" / ")) return tags[0].split(" / ");
    return [tags[0]];
  };

  // 获取末级标签名（简短展示）
  const getLastTag = (tags?: string[]) => {
    const path = getCategoryPath(tags);
    return path[path.length - 1];
  };

  // 未登录状态
  if (!currentUser) {
    return (
      <div className="min-h-[100dvh] bg-[#18191c] pb-24 animate-fade-in select-none font-sans w-full flex flex-col items-center">
        <div className="w-full max-w-2xl bg-[#232429] md:rounded-lg overflow-hidden shadow-2xl">
          {/* Top Hero Section */}
          <div className="relative w-full h-[200px] md:h-[240px] bg-black group overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 group-hover:scale-105"
              style={{ backgroundImage: 'url(/images/banners/profile_hero.webp)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#232429] via-[#232429]/60 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-10 pb-8">
              <div className="flex items-center gap-5 mb-3">
                <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full bg-gradient-to-tr from-[#d0bcff] to-[#4cd7f6] p-[2px] shadow-[0_0_20px_rgba(208,188,255,0.3)]">
                  <div className="w-full h-full bg-[#0b1326] rounded-full flex items-center justify-center overflow-hidden bg-cover bg-center">
                    <User className="w-8 h-8 text-[#A0A0A0]" />
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <h1 
                      onClick={onNavigateToAuth}
                      className="text-2xl md:text-[28px] font-display font-black tracking-tight text-[#A0A0A0] hover:text-white underline decoration-[#A0A0A0]/50 hover:decoration-white/80 cursor-pointer transition-all drop-shadow-lg"
                    >
                      未登录
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-4 md:px-6 py-2 -mt-6 relative z-20 flex flex-col items-center justify-center pt-24 pb-32">
            <div className="w-16 h-16 mb-5 rounded-full bg-[#1A1B1E] border border-white/5 flex items-center justify-center shadow-inner">
              <User className="w-6 h-6 text-[#A0A0A0]/50" />
            </div>
            <h2 className="text-[18px] font-black tracking-wide text-white mb-3">您的个人档案室暂未开放</h2>
            <p className="text-[#808080] text-[13px] leading-relaxed max-w-sm mb-8 text-center">
              登录后即可在此管理您的专属档案收藏、查阅详细的统计分析报告，并追踪您的所有待发布记录。
            </p>
            <button 
              onClick={onNavigateToAuth}
              className="px-8 py-3 bg-[#d0bcff] text-black text-[14px] font-bold rounded-full hover:bg-[#bba0f8] transition-colors shadow-[0_4px_20px_rgba(208,188,255,0.3)]"
            >
              立即登录 / 注册
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 如果选中了某个档案库，渲染详情页
  const selectedProject = selectedArchiveId ? displayProjects.find(p => p.id === selectedArchiveId) : null;
  if (selectedProject) {
    return (
      <ArchiveDetailView
        project={selectedProject}
        onBack={() => setSelectedArchiveId(null)}
        onToggleRecordBookmark={onToggleRecordBookmark}
        onAddRecord={(projectId, tag, ratingFields, customInputs) => onNavigateToSubmit?.(projectId, tag, ratingFields, customInputs)}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#141416] pb-24 animate-fade-in select-none font-sans w-full">
      <ConfirmModal
        isOpen={!!deleteProjectId}
        title="删除档案库"
        message="确定要删除这个档案库吗？包含的记录也将一同被删除，该操作不可恢复。"
        confirmText="确认删除"
        cancelText="取消"
        variant="danger"
        onConfirm={() => {
          if (deleteProjectId && onDeleteProject) {
            onDeleteProject(deleteProjectId);
          }
          setDeleteProjectId(null);
        }}
        onCancel={() => setDeleteProjectId(null)}
      />
      
      {/* Hero 区域 — 柔和、克制、信息明确 */}
      <div className="relative w-full min-h-[160px] pt-14 pb-5 overflow-hidden">
        {/* 背景图 */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url(${currentBgImage})`,
            opacity: 0.35,
            filter: "brightness(0.7) saturate(0.8)",
          }}
        />
        {/* 多层渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/80 to-[#141416]/10" />

        {/* Hero 文字 */}
        <div className="relative z-10 flex flex-col px-5 md:px-8 mt-2 max-w-[640px] mx-auto w-full">
          <h1 className="text-[26px] md:text-[30px] font-bold text-[#F0F0F0] leading-[1.2] mb-4 tracking-tight">
            {activeLevel3 || activeLevel2 || (activeLevel1 !== "全部" ? activeLevel1 : "全部档案")}
          </h1>
          <div className="flex items-center gap-3 self-start mt-2">
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#F0F0F0] hover:bg-white text-[#141416] text-[13px] font-semibold rounded-full active:scale-[0.97] transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              新建档案
            </button>
            <button
              onClick={() => handleL1Click("全部")}
              className={`px-5 py-2.5 text-[13px] font-semibold rounded-full active:scale-[0.97] transition-all duration-200 border ${activeLevel1 === "全部" ? "bg-[#1A1A1E] text-[#D9A04A] border-[#D9A04A]/30 shadow-[0_0_10px_rgba(217,160,74,0.15)]" : "bg-transparent text-[#808080] border-white/10 hover:text-white"}`}
            >
              全部档案
            </button>
            <button 
              onClick={() => setIsFilterDrawerOpen(true)}
              className="p-2.5 rounded-full bg-transparent border border-white/10 text-[#A0A0A0] hover:text-white hover:bg-white/10 transition-colors shadow-inner"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 档案库列表 — Flomo 卡片式 */}
      <div className="px-4 md:px-6 max-w-[640px] mx-auto w-full">

        {/* 列表标题 */}
        <div className="flex items-center justify-between py-4 mb-1">
          <span className="text-[14px] font-semibold text-[#A0A0A0]">全部档案</span>
          <span className="text-[12px] text-[#505050]">{displayProjects.length} 个</span>
        </div>

        <div className="mb-4"></div>

        {/* 卡片列表 */}
        <div className="space-y-3">
          {displayProjects.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[14px] text-[#505050] mb-1">还没有档案库</p>
              <p className="text-[12px] text-[#383838]">点击上方按钮创建你的第一个档案</p>
            </div>
          ) : (
            displayProjects.map((project) => {
              const pathsArray = getCategoryPath(project.tags);
              let displayPath = pathsArray.join(" > ");
              if (activeLevel3) {
                displayPath = pathsArray.slice(-1).join(" > ");
              } else if (activeLevel2) {
                displayPath = pathsArray.slice(-2).join(" > ");
              }
              const recordCount = project.comments?.length || 0;

              return (
                <div
                  key={project.id}
                  className={`relative bg-[#1A1A1E] rounded-2xl transition-all duration-300 overflow-hidden ${
                    activeMenuId === project.id ? "z-20" : "hover:-translate-y-1 hover:bg-[#1C1C20] active:scale-[0.99]"
                  }`}
                  style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}
                >
                  {/* 主体可点击区域 */}
                  <div
                    onClick={() => setSelectedArchiveId(project.id)}
                    className="px-5 py-5 md:px-6 md:py-6 cursor-pointer flex flex-col"
                  >
                    {/* 顶部行：简化的标签 + 操作菜单 */}
                    <div className="flex items-center justify-between mb-2">
                      {/* 左侧动态层级标签 */}
                      <span className="text-[11px] font-medium text-[#707070] tracking-wide">
                        {displayPath}
                      </span>

                      {/* 右侧：创建时间、操作区 */}
                      <div className="flex items-center gap-2">
                        {project.timeAgo && (
                          <span className="text-[10px] text-[#606060] font-medium mr-1">
                            {project.timeAgo}
                          </span>
                        )}
                        <div className="flex items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onBookmarkToggle) onBookmarkToggle(project.id, e);
                            }}
                            className={`p-1.5 rounded-md transition-colors ${
                              project.bookmarked
                                ? "text-amber-400 hover:bg-white/5"
                                : "text-[#606060] hover:text-[#A0A0A0] hover:bg-white/5"
                            }`}
                          >
                            <Star className="w-4 h-4" fill={project.bookmarked ? "currentColor" : "none"} />
                          </button>
                          
                          {/* ··· 操作入口 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === project.id ? null : project.id);
                            }}
                            className="p-1.5 rounded-md text-[#606060] hover:text-[#A0A0A0] hover:bg-white/5 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 中部：左右分栏布局 */}
                    <div className="flex items-start justify-between mt-3 gap-6">
                      {/* 左侧：标题与状态标签 */}
                      <div className="flex flex-col items-start shrink-0 max-w-[50%]">
                        <h3 className="text-[22px] md:text-[24px] font-black text-white leading-tight tracking-wide drop-shadow-sm">
                          {project.name}
                        </h3>
                        {recordCount > 0 && (
                          <div className="mt-3">
                            <span className="px-2.5 py-1 rounded-md bg-[#4cd7f6]/10 text-[10px] md:text-[11px] font-bold text-[#4cd7f6] tracking-wide">
                              {recordCount} 条记录
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 右侧：简介副标题 */}
                      <div className="flex-1 text-right mt-1.5">
                        <p className="text-[13px] md:text-[14px] text-[#A0A0A0] leading-relaxed line-clamp-3" style={{ wordBreak: "break-word" }}>
                          {project.intro}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 展开的操作菜单 */}
                  {activeMenuId === project.id && (
                    <div
                      className="border-t border-[#242428] flex animate-fade-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => { handleOpenForm(project); }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 text-[12px] font-medium text-[#A0A0A0] hover:bg-white/5 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        编辑
                      </button>
                      <div className="w-px bg-[#242428]" />
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 text-[12px] font-medium text-[#D05050] hover:bg-red-500/5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        删除
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 新建/编辑弹窗 — 毛玻璃模态 */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseForm} />
          <div className="relative w-full max-w-md bg-[#1A1A1E] border border-[#2A2A2E] shadow-2xl rounded-t-2xl md:rounded-2xl p-6 animate-fade-in z-10">
            
            {/* 手机端拖拽指示条 */}
            <div className="md:hidden w-10 h-1 bg-[#383838] rounded-full mx-auto mb-5" />
            
            <button
              onClick={handleCloseForm}
              className="absolute top-4 right-4 p-1.5 text-[#606060] hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-[18px] font-bold text-[#E0E0E0] mb-5">
              {editingId ? "编辑档案库" : "新建档案库"}
            </h3>

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
                  onClick={handleCloseForm}
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
      )}

      {/* 点击卡片外区域时关闭菜单 */}
      {activeMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
      )}

      {/* 底部筛选抽屉 */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-[110] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterDrawerOpen(false)} />
          <div className="relative w-full md:max-w-[640px] md:mx-auto bg-[#1A1A1E] rounded-t-3xl border-t border-[#2A2A2E] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pb-8 pt-4 px-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            {/* 拖拽指示条 */}
            <div className="w-12 h-1 bg-[#383838] rounded-full mx-auto mb-6" />
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold text-white tracking-wide">深度筛选</h3>
              <button onClick={() => setIsFilterDrawerOpen(false)} className="p-1.5 text-[#606060] hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* 一级分类 */}
              <div>
                <div className="text-[12px] font-medium text-[#707070] mb-3">一级分类</div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleL1Click("全部")}
                    className={`px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all
                      ${activeLevel1 === "全部" ? "bg-white/15 text-white shadow-inner" : "bg-black/30 text-[#808080] hover:bg-white/5"}`}
                  >
                    全部
                  </button>
                  {treeData.map(node => {
                    const shortName = node.label.split('(')[0].trim();
                    const isActive = activeLevel1 === shortName;
                    return (
                      <button
                        key={node.id}
                        onClick={() => handleL1Click(shortName)}
                        className={`px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all
                          ${isActive ? "bg-white/15 text-white shadow-inner" : "bg-black/30 text-[#808080] hover:bg-white/5"}`}
                        style={isActive && node.color ? { color: node.color } : {}}
                      >
                        {shortName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 二级与三级分类 */}
              {currentL1Node && currentL1Node.children && currentL1Node.children.length > 0 && (
                <>
                  <div>
                    <div className="text-[12px] font-medium text-[#707070] mb-3">二级分类</div>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => setFilterTag(activeLevel1)}
                      className={`px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all
                        ${!activeLevel2 ? "bg-white/15 text-white shadow-inner" : "bg-black/30 text-[#808080] hover:bg-white/5"}`}
                    >
                      不限
                    </button>
                    {currentL1Node.children.map(l2 => {
                      const l2Name = l2.label.trim();
                      const isActive = activeLevel2 === l2Name;
                      return (
                        <button
                          key={l2.id}
                          onClick={() => setFilterTag(`${activeLevel1} / ${l2Name}`)}
                          className={`px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all
                            ${isActive ? "bg-white/15 text-white shadow-inner" : "bg-black/30 text-[#808080] hover:bg-white/5"}`}
                        >
                          {l2Name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 三级分类 */}
                {activeLevel2 && (() => {
                  const currentL2Node = currentL1Node.children.find(n => n.label.trim() === activeLevel2);
                  if (currentL2Node && currentL2Node.children && currentL2Node.children.length > 0) {
                    return (
                      <div>
                        <div className="text-[12px] font-medium text-[#707070] mb-3">三级分类</div>
                        <div className="flex flex-wrap gap-2.5">
                          <button
                            onClick={() => setFilterTag(`${activeLevel1} / ${activeLevel2}`)}
                            className={`px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all
                              ${!activeLevel3 ? "bg-white/15 text-white shadow-inner" : "bg-black/30 text-[#808080] hover:bg-white/5"}`}
                          >
                            不限
                          </button>
                          {currentL2Node.children.map(l3 => {
                            const l3Name = l3.label.trim();
                            const isActive = activeLevel3 === l3Name;
                            return (
                              <button
                                key={l3.id}
                                onClick={() => setFilterTag(`${activeLevel1} / ${activeLevel2} / ${l3Name}`)}
                                className={`px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all
                                  ${isActive ? "bg-[#D9A04A]/20 text-[#D9A04A] shadow-inner" : "bg-black/30 text-[#808080] hover:bg-white/5"}`}
                              >
                                {l3Name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                </>
              )}
            </div>

            <button 
              onClick={() => setIsFilterDrawerOpen(false)}
              className="w-full mt-8 py-3.5 bg-[#F0F0F0] text-black font-bold text-[15px] rounded-xl active:scale-[0.98] transition-transform"
            >
              完成筛选
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
