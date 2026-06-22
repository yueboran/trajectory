import React, { useState } from "react";
import { ChevronRight, Edit2, Trash2, Plus, X, MoreHorizontal, Star, User, Filter } from "lucide-react";
import { Project } from "../types";
import { getSelectableTags, treeData } from "../data/treeData";
import ArchiveDetailView from "./ArchiveDetailView";
import CategoryCascader from "./CategoryCascader";
import ConfirmModal from "./ConfirmModal";
import ArchiveFormModal, { ArchiveFormData } from "./ArchiveFormModal";

interface ArchiveViewProps {
  projects?: Project[];
  initialFilter?: string;
  onSelectProject?: (id: string) => void;
  onAddProject?: (p: any) => void;
  onUpdateProject?: (id: string, p: Partial<Project>) => void;
  onDeleteProject?: (id: string) => void;
  onBookmarkToggle?: (id: string, e: React.MouseEvent) => void;
  onToggleRecordBookmark?: (projectId: string, recordId: string) => void;
  onNavigateToSubmit?: (projectId: string, tag: string, ratingFields?: string[], customInputs?: {name: string, type: 'singleLine'|'multiLine'}[], initialRecord?: any) => void;
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
export default function ArchiveView({ projects, initialFilter = "全部", onSelectProject, onAddProject, onUpdateProject, onDeleteProject, onBookmarkToggle, onToggleRecordBookmark, onNavigateToSubmit, currentUser, onNavigateToAuth }: ArchiveViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalInitialData, setModalInitialData] = useState<ArchiveFormData>({ name: "", intro: "", tag: "", ratingFields: [], customInputs: [], requireTitleField: false });
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
      setModalInitialData({
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
      setModalInitialData({ name: "", intro: "", tag: initialTag, ratingFields: [], customInputs: [], requireTitleField: false });
    }
    setActiveMenuId(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleModalSubmit = (data: ArchiveFormData) => {
    if (editingId) {
      if (onUpdateProject) {
        onUpdateProject(editingId, {
          name: data.name,
          intro: data.intro,
          tags: data.tag ? [data.tag] : [],
          ratingFields: data.ratingFields,
          customInputs: data.customInputs,
          requireTitleField: data.requireTitleField
        });
      }
    } else {
      if (onAddProject) {
        onAddProject({
          name: data.name,
          intro: data.intro,
          tags: data.tag ? [data.tag] : [],
          ratingFields: data.ratingFields,
          customInputs: data.customInputs,
          requireTitleField: data.requireTitleField
        } as any);
      }
    }
    setIsFormOpen(false);
    setEditingId(null);
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

      {/* 独立的新建/编辑弹窗公共组件 */}
      <ArchiveFormModal
        isOpen={isFormOpen}
        editingId={editingId}
        initialData={modalInitialData}
        filterTag={filterTag}
        onClose={handleCloseForm}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
