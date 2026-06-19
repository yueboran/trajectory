/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 灵感投资组合 — 资产化认知仪表盘
 * 将用户的个人主页设计为"基金经理的投资组合"视图
 */

import React, { useState, MouseEvent, useMemo, useRef } from "react";
import {
  User, Mail, TrendingUp, TrendingDown, Flame, Zap,
  Briefcase, Heart, Bookmark, Star, ChevronRight,
  BarChart3, Award, Target, Cpu, Globe, DollarSign,
  Sparkles, Crown, Eye, ArrowUpRight, ArrowDownRight,
  Calendar, Activity, HelpCircle, MessageSquare, MoreHorizontal, Edit2, Trash2, X
} from "lucide-react";
import { Project, PortfolioHolding, PortfolioStats, DraftRecord } from "../types";
import ProjectCard from "./ProjectCard";
import ArchiveDetailView from "./ArchiveDetailView";
import CategoryCascader from "./CategoryCascader";
import ConfirmModal from "./ConfirmModal";

// ========== 组件接口定义 ==========
interface ProfileViewProps {
  currentUser?: any;
  onNavigateToAuth?: () => void;
  onLogout?: () => void;
  onAvatarUpload?: (file: File) => void;
  bookmarkedProjects: Project[];
  likedProjects: string[];
  submittedCount: number;
  allProjects: Project[];          // 全部项目列表（用于计算组合）
  onSelectProject: (id: string) => void;
  onLikeToggle?: (id: string, e: MouseEvent) => void;
  onBookmarkToggle?: (id: string, e: MouseEvent) => void;
  onSyncProjects?: (syncedList: Project[]) => void;
  onToggleRecordBookmark?: (projectId: string, recordId: string) => void;
  onNavigateToSubmit?: (projectId: string, tag: string, ratingFields?: string[], customInputs?: {name: string, type: 'singleLine'|'multiLine'}[]) => void;
  draftRecords?: DraftRecord[];
  onEditDraft?: (draft: DraftRecord) => void;
  onUpdateProject?: (id: string, updates: Partial<Project>) => void;
  onDeleteProject?: (id: string) => void;
}

// ========== 角色标签配置 ==========
const ROLE_CONFIG: Record<string, any> = {
  creator: {
    label: "创建",
    color: "text-[#d0bcff]",
    bgColor: "bg-[#d0bcff]/10",
    borderColor: "border-[#d0bcff]/25",
    icon: Crown,
    weight: 3.0,   // 创建者权重最高
  },
  commenter: {
    label: "评论",
    color: "text-[#4cd7f6]",
    bgColor: "bg-[#4cd7f6]/10",
    borderColor: "border-[#4cd7f6]/25",
    icon: MessageSquare,
    weight: 2.0,
  },
  liker: {
    label: "点赞",
    color: "text-[#fbabff]",
    bgColor: "bg-[#fbabff]/10",
    borderColor: "border-[#fbabff]/25",
    icon: Heart,
    weight: 1.0,
  },
  bookmarker: {
    label: "收藏",
    color: "text-[#4ade80]",
    bgColor: "bg-[#4ade80]/10",
    borderColor: "border-[#4ade80]/25",
    icon: Bookmark,
    weight: 1.5,
  },
};

// ========== 影响力等级系统 ==========
function getInfluenceLevel(totalVal: number): { rank: string; title: string; color: string } {
  if (totalVal >= 800) return { rank: "Top 1%", title: "星系领袖", color: "text-amber-300" };
  if (totalVal >= 500) return { rank: "Top 5%", title: "轨道先驱", color: "text-[#d0bcff]" };
  if (totalVal >= 300) return { rank: "Top 15%", title: "引力探索者", color: "text-[#4cd7f6]" };
  if (totalVal >= 100) return { rank: "Top 30%", title: "星尘观察者", color: "text-[#fbabff]" };
  return { rank: "新星", title: "新星起步", color: "text-[#cbc3d7]" };
}

// ========== 迷你走势图组件 ==========
function MiniSparkline({ data, color = "#4cd7f6" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 32;
  const w = 80;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");

  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {/* 终点高亮圆点 */}
      <circle
        cx={step * (data.length - 1)}
        cy={h - ((data[data.length - 1] - min) / range) * (h - 4) - 2}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

// ========== 持仓行项组件 ==========
function HoldingRow({
  holding,
  onSelect,
}: {
  holding: PortfolioHolding;
  onSelect: (id: string) => void;
}) {
  const roleConf = ROLE_CONFIG[holding.role];
  const RoleIcon = roleConf.icon;
  const isUp = holding.valuationChange >= 0;

  return (
    <div
      onClick={() => onSelect(holding.project.id)}
      className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#171f33]/30 border border-white/5 cursor-pointer
                 hover:bg-[#171f33]/55 hover:border-[#d0bcff]/15 transition-all duration-200 group active:scale-[0.99]"
    >
      {/* 项目图标 */}
      <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-[#d0bcff]/20 to-[#4cd7f6]/20 flex items-center justify-center border border-white/5">
        <Flame className="w-4.5 h-4.5 text-[#d0bcff]" />
      </div>

      {/* 项目信息 */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h4 className="font-display text-xs font-semibold text-[#dae2fd] truncate group-hover:text-[#d0bcff] transition-colors">
            {holding.project.name}
          </h4>
          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[7.5px] font-mono font-bold tracking-wider ${roleConf.bgColor} ${roleConf.borderColor} ${roleConf.color} border`}>
            <RoleIcon className="w-2.5 h-2.5" />
            {roleConf.label}
          </span>
        </div>
        <p className="text-[9px] text-[#cbc3d7]/60 font-mono tracking-widest uppercase mt-0.5">
          {(holding.project.tags && holding.project.tags[0]) || "GENERATIVE"} · 权重 {holding.holdingWeight.toFixed(1)}%
        </p>
      </div>

      {/* 估值变动 */}
      <div className="flex flex-col items-end shrink-0">
        <span className="font-display text-sm font-bold text-[#dae2fd]">
          {holding.currentValuation.toFixed(1)}
        </span>
        <span className={`flex items-center gap-0.5 font-mono text-[9px] font-semibold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
          {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {isUp ? "+" : ""}{holding.valuationChange.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

// ========== 主组件 ==========
export default function ProfileView({
  currentUser,
  onNavigateToAuth,
  onLogout,
  onAvatarUpload,
  bookmarkedProjects,
  likedProjects,
  submittedCount,
  allProjects,
  onSelectProject,
  onLikeToggle,
  onBookmarkToggle,
  onSyncProjects,
  onToggleRecordBookmark,
  onNavigateToSubmit,
  draftRecords = [],
  onEditDraft,
  onUpdateProject,
  onDeleteProject,
}: ProfileViewProps) {

  const [activeFilter, setActiveFilter] = useState<"archive_bookmarks" | "record_bookmarks" | "draft_records">("archive_bookmarks");
  const [chartMode, setChartMode] = useState<"activity" | "quantity">("activity");
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{name: string, intro: string, tag: string, ratingFields: string[], customInputs: { name: string; type: 'singleLine' | 'multiLine' }[], requireTitleField: boolean}>({ name: "", intro: "", tag: "", ratingFields: [], customInputs: [], requireTitleField: false });
  const [ratingInput, setRatingInput] = useState("");
  const [customInputName, setCustomInputName] = useState("");
  const [customInputType, setCustomInputType] = useState<'singleLine' | 'multiLine'>('singleLine');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string>("全部档案");
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  const handleOpenForm = (project?: Project) => {
    if (project) {
      setEditingId(project.id);
      setFormData({
        name: project.name,
        intro: project.intro,
        tag: project.tags && project.tags.length > 0 ? project.tags[0] : "",
        ratingFields: project.ratingFields || [],
        customInputs: project.customInputs || [],
        requireTitleField: project.requireTitleField || false
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", intro: "", tag: filterTag && filterTag !== "全部" ? filterTag : "", ratingFields: [], customInputs: [], requireTitleField: false });
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
          tags: formData.tag ? [formData.tag] : [],
          ratingFields: formData.ratingFields,
          customInputs: formData.customInputs,
          requireTitleField: formData.requireTitleField
        });
      }
    }
    handleCloseForm();
  };

  const handleDelete = (id: string) => {
    setActiveMenuId(null);
    setDeleteProjectId(id);
  };

  // ====== 核心：构建投资组合持仓列表 ======
  const { holdings, stats } = useMemo(() => {
    const holdingsMap = new Map<string, PortfolioHolding>();

    // 1. 用户创建的项目（timeAgo === "刚刚" 视为本人创建）
    allProjects.forEach((proj) => {
      if (proj.timeAgo === "刚刚") {
        holdingsMap.set(proj.id, {
          project: proj,
          role: "creator",
          entryValuation: proj.auroraScore * 0.85,
          currentValuation: proj.auroraScore,
          valuationChange: ((proj.auroraScore - proj.auroraScore * 0.85) / (proj.auroraScore * 0.85)) * 100,
          holdingWeight: 0,
          engagementScore: 50 + proj.commentsCount * 5,
          isLiked: likedProjects.includes(proj.id),
          isBookmarked: !!proj.bookmarked,
        });
      }
    });

    // 针对演示：如果此时集合为空，强制塞入前3个作为Mock数据（创建者身份）
    if (holdingsMap.size === 0 && allProjects.length >= 3) {
      allProjects.slice(0, 3).forEach((proj) => {
        holdingsMap.set(proj.id, {
          project: proj,
          role: "creator",
          entryValuation: proj.auroraScore * 0.85,
          currentValuation: proj.auroraScore,
          valuationChange: ((proj.auroraScore - proj.auroraScore * 0.85) / (proj.auroraScore * 0.85)) * 100,
          holdingWeight: 0,
          engagementScore: 50 + proj.commentsCount * 5,
          isLiked: likedProjects.includes(proj.id),
          isBookmarked: !!proj.bookmarked,
        });
      });
    }

    // 2. 收藏的项目 -> bookmarker
    bookmarkedProjects.forEach((proj) => {
      if (!holdingsMap.has(proj.id)) {
        holdingsMap.set(proj.id, {
          project: proj,
          role: "bookmarker",
          entryValuation: proj.auroraScore * 0.92,
          currentValuation: proj.auroraScore,
          valuationChange: ((proj.auroraScore - proj.auroraScore * 0.92) / (proj.auroraScore * 0.92)) * 100,
          holdingWeight: 0,
          engagementScore: 30 + proj.commentsCount * 3,
          isLiked: likedProjects.includes(proj.id),
          isBookmarked: true,
        });
      }
    });

    // 3. 点赞的项目 -> liker
    likedProjects.forEach((pid) => {
      if (!holdingsMap.has(pid)) {
        const proj = allProjects.find((p) => p.id === pid);
        if (proj) {
          holdingsMap.set(pid, {
            project: proj,
            role: "liker",
            entryValuation: proj.auroraScore * 0.95,
            currentValuation: proj.auroraScore,
            valuationChange: ((proj.auroraScore - proj.auroraScore * 0.95) / (proj.auroraScore * 0.95)) * 100,
            holdingWeight: 0,
            engagementScore: 10 + proj.likes * 0.5,
            isLiked: true,
            isBookmarked: !!proj.bookmarked,
          });
        }
      }
    });

    // 4. 评论的项目 -> commenter (Mock logic, finding projects with comments that are not yet tracked)
    allProjects.forEach((proj) => {
      if (proj.commentsCount > 0 && !holdingsMap.has(proj.id)) {
        holdingsMap.set(proj.id, {
          project: proj,
          role: "commenter",
          entryValuation: proj.auroraScore * 0.90,
          currentValuation: proj.auroraScore,
          valuationChange: ((proj.auroraScore - proj.auroraScore * 0.90) / (proj.auroraScore * 0.90)) * 100,
          holdingWeight: 0,
          engagementScore: 20 + proj.commentsCount * 4,
          isLiked: likedProjects.includes(proj.id),
          isBookmarked: !!proj.bookmarked,
        });
      }
    });

    // 计算权重（按角色权重 × 项目分数）
    const allHoldings = Array.from(holdingsMap.values());
    const totalWeight = allHoldings.reduce((sum, h) => sum + ROLE_CONFIG[h.role].weight * h.currentValuation, 0) || 1;
    allHoldings.forEach((h) => {
      h.holdingWeight = (ROLE_CONFIG[h.role].weight * h.currentValuation / totalWeight) * 100;
    });

    // 计算组合统计
    const totalValuation = allHoldings.reduce((sum, h) => sum + h.currentValuation * ROLE_CONFIG[h.role].weight, 0);
    const createdCount = allHoldings.filter((h) => h.role === "creator").length;
    const commenterCount = allHoldings.filter((h) => h.role === "commenter").length;
    const likerCount = allHoldings.filter((h) => h.role === "liker").length;
    const bookmarkerCount = allHoldings.filter((h) => h.role === "bookmarker").length;

    // 模拟近7天活跃度数据（基于当前持仓数生成平滑曲线）
    const base = Math.max(totalValuation * 0.7, 10);
    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const noise = Math.sin(i * 1.2) * base * 0.15 + Math.cos(i * 0.8) * base * 0.1;
      return Math.max(0, base + noise + (i * base * 0.04));
    });

    const prevVal = weeklyActivity[weeklyActivity.length - 2] || totalValuation;
    const change24h = prevVal > 0 ? ((totalValuation - prevVal) / prevVal) * 100 : 0;

    const portfolioStats: PortfolioStats = {
      totalValuation: Math.round(totalValuation * 10) / 10,
      valuationChange24h: Math.round(change24h * 10) / 10,
      totalHoldings: allHoldings.length,
      influenceRank: getInfluenceLevel(totalValuation).rank,
      createdCount,
      commenterCount,
      likerCount,
      bookmarkerCount,
      streakDays: Math.min(Math.max(allHoldings.length * 3, 1), 42),
      weeklyActivity,
    };

    // 按权重降序排列
    allHoldings.sort((a, b) => b.holdingWeight - a.holdingWeight);

    return { holdings: allHoldings, stats: portfolioStats };
  }, [allProjects, bookmarkedProjects, likedProjects]);

  // 档案收藏
  const archiveBookmarks = bookmarkedProjects;
  
  // 真实记录收藏：筛选出所有 bookmarked 为 true 的记录
  const recordBookmarks = allProjects.flatMap(p => 
    p.comments?.filter(c => c.bookmarked).map(c => ({...c, projectId: p.id})) || []
  );

  // 筛选持仓 (保留逻辑)
  const filteredHoldings = holdings.filter((h) => h.role === activeFilter as any);

  const influence = getInfluenceLevel(stats.totalValuation);
  const isValUp = stats.valuationChange24h >= 0;

  // 行业分布计算
  const domainAlloc = useMemo(() => {
    const map = new Map<string, number>();
    holdings.forEach((h) => {
      const key = (h.project.tags && h.project.tags[0]) || "Generative";
      map.set(key, (map.get(key) || 0) + h.holdingWeight);
    });
    const colors = ["#d0bcff", "#4cd7f6", "#fbabff", "#4ade80", "#f59e0b"];
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, pct], i) => ({ key: label, label, percentage: Math.round(pct * 10) / 10, color: colors[i % colors.length] }));
  }, [holdings]);

  const selectedProject = selectedArchiveId ? allProjects.find(p => p.id === selectedArchiveId) : null;
  if (selectedProject) {
    return (
      <ArchiveDetailView
        project={selectedProject}
        initialRecordId={selectedRecordId || undefined}
        onBack={() => {
          setSelectedArchiveId(null);
          setSelectedRecordId(null);
        }}
        onToggleRecordBookmark={onToggleRecordBookmark}
        onAddRecord={(projectId, tag, ratingFields, customInputs) => onNavigateToSubmit?.(projectId, tag, ratingFields, customInputs)}
      />
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-[100dvh] bg-[#18191c] pb-24 animate-fade-in select-none font-sans w-full flex flex-col items-center">
        <div className="w-full max-w-2xl bg-[#232429] md:rounded-lg overflow-hidden shadow-2xl">
          {/* Top Hero Section */}
          <div className="relative w-full h-[130px] md:h-[150px] bg-black group overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 group-hover:scale-105"
              style={{ backgroundImage: 'url(/images/banners/profile_hero.webp)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#232429] via-[#232429]/60 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end px-6 py-5 md:px-8 z-10">
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
              className="px-8 py-3.5 bg-white text-black text-sm font-bold rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              立即登录 / 注册
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#18191c] pb-24 animate-fade-in select-none font-sans w-full flex flex-col items-center">
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

      <div className="w-full max-w-2xl bg-[#232429] md:rounded-lg overflow-hidden shadow-2xl">
        
        {/* Top Hero Section */}
        <div className="relative w-full h-[130px] md:h-[150px] bg-black group overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: 'url(/images/banners/profile_hero.webp)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#232429] via-[#232429]/60 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end px-6 py-5 md:px-8 z-10">
            <div className="flex items-center gap-5 mb-3">
              {/* Avatar */}
              <div 
                className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full bg-gradient-to-tr from-[#d0bcff] to-[#4cd7f6] p-[2px] shadow-[0_0_20px_rgba(208,188,255,0.3)] ${currentUser ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                onClick={() => {
                  if (currentUser && onAvatarUpload) {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e: any) => {
                      if (e.target.files && e.target.files[0]) {
                        onAvatarUpload(e.target.files[0]);
                      }
                    };
                    input.click();
                  }
                }}
              >
                <div className="w-full h-full bg-[#0b1326] rounded-full flex items-center justify-center overflow-hidden bg-cover bg-center">
                  {currentUser && currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.username} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-[#A0A0A0]" />
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  {currentUser ? (
                    <>
                      <h1 className="text-2xl md:text-[28px] font-display font-black tracking-tight text-white drop-shadow-lg">
                        {currentUser.username}
                      </h1>
                      {onLogout && (
                        <button 
                          onClick={onLogout}
                          className="text-xs bg-white/10 hover:bg-[#e50914] px-3 py-1 rounded-full text-white transition-colors"
                        >
                          注销
                        </button>
                      )}
                    </>
                  ) : (
                    <h1 
                      onClick={onNavigateToAuth}
                      className="text-2xl md:text-[28px] font-display font-black tracking-tight text-[#A0A0A0] hover:text-white underline decoration-[#A0A0A0]/50 hover:decoration-white/80 cursor-pointer transition-all drop-shadow-lg"
                    >
                      未登录
                    </h1>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Stats Panel (Glassmorphism over dark bg) */}
        <div className="px-4 md:px-6 py-2 -mt-6 relative z-20">
          
                    <div className="rounded-xl p-5 bg-[#1a1b1f]/90 backdrop-blur-xl border border-white/10 shadow-2xl mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#d0bcff]" />
              <h3 className="text-white font-bold text-sm tracking-wide">档案统计数据</h3>
            </div>
            <div className="w-full overflow-x-auto pb-2">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/10 text-[#cbc3d7] text-xs uppercase tracking-wider font-semibold bg-[#12161a]/50">
                    <th className="p-3 rounded-tl-lg whitespace-nowrap">一级分类</th>
                    <th className="p-3 whitespace-nowrap">二级分类</th>
                    <th className="p-3 whitespace-nowrap">三级分类</th>
                    <th className="p-3 whitespace-nowrap">档案库名称</th>
                    <th className="p-3 text-right rounded-tr-lg whitespace-nowrap">记录数量</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-[#e0e0e0]">
                  {allProjects.map(proj => {
                    const parts = proj.tags && proj.tags[0] ? proj.tags[0].split(" / ") : ["-", "-", "-"];
                    const l1 = parts[0] || "-";
                    const l2 = parts[1] || "-";
                    const l3 = parts[2] || "-";
                    return (
                      <tr key={proj.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-3 text-[#A0A0A0]">{l1}</td>
                        <td className="p-3 text-[#A0A0A0]">{l2}</td>
                        <td className="p-3 text-amber-400/80">{l3}</td>
                        <td className="p-3 font-medium text-[#DCDCDC]">{proj.name}</td>
                        <td className="p-3 text-right text-[#4cd7f6]">{proj.comments ? proj.comments.length : 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Portfolio List */}
          <div className="mb-6">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-[#242428] mb-4 pb-2 overflow-x-auto hide-scrollbar">
              {[
                { key: "archive_bookmarks" as const, label: `档案收藏 (${archiveBookmarks.length})` },
                { key: "record_bookmarks" as const, label: `记录收藏 (${recordBookmarks.length})` },
                { key: "draft_records" as const, label: `待发布记录 (${draftRecords.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`shrink-0 pb-2 text-[13px] font-bold tracking-wider transition-colors relative ${
                    activeFilter === tab.key
                      ? "text-[#F0F0F0]"
                      : "text-[#808080] hover:text-[#A0A0A0]"
                  }`}
                >
                  {tab.label}
                  {activeFilter === tab.key && (
                    <div className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-[#A88840] rounded-t" />
                  )}
                </button>
              ))}
            </div>

            {/* List */}
            <div>
              {activeFilter === "archive_bookmarks" && (
                archiveBookmarks.length === 0 ? (
                  <div className="py-12 text-center text-[#505050] font-medium text-[13px]">暂无档案收藏</div>
                ) : (
                  <div className="flex flex-col">
                    {archiveBookmarks.map(p => {
                      const tagsPath = p.tags && p.tags.length > 0 ? (p.tags[0].includes(" / ") ? p.tags[0].split(" / ") : [p.tags[0]]) : ["未分类"];
                      const lastTag = tagsPath[tagsPath.length - 1];
                      const recordCount = p.comments?.length || 0;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedArchiveId(p.id)}
                          className="bg-[#1A1A1E] rounded-2xl border border-[#242428] hover:border-[#333338] transition-all duration-200 overflow-hidden active:scale-[0.99] mb-4 cursor-pointer p-5 flex flex-col items-center text-center"
                        >
                          {/* 顶部标签行：展开的 tagsPath, 收藏星形, ...菜单 */}
                          <div className="w-full flex items-start justify-between mb-6">
                            <div className="flex flex-col items-start gap-2.5">
                              {/* 分类标签胶囊 */}
                              <div className="px-3 py-1.5 rounded-lg border border-[#A88840]/30 bg-[#282218] flex items-center">
                                {tagsPath.map((tag, i) => (
                                  <React.Fragment key={i}>
                                    <span className="text-[12px] font-medium text-[#E8C870] tracking-wide">{tag}</span>
                                    {i < tagsPath.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-[#808080] mx-1.5" />}
                                  </React.Fragment>
                                ))}
                              </div>
                              {/* 记录数胶囊 */}
                              {recordCount > 0 && (
                                <div className="px-2.5 py-1 rounded-md border border-[#2E4A56] bg-[#1C252A]">
                                  <span className="text-[11px] font-bold text-[#4cd7f6] tracking-wider">{recordCount} 条记录</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              {/* 收藏图标 */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onBookmarkToggle) onBookmarkToggle(p.id, e);
                                }}
                                className="p-1 -mr-1 rounded-md hover:bg-white/5 active:scale-95 transition-all"
                              >
                                <Star className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === p.id ? null : p.id);
                                }}
                                className="p-1 -ml-1 rounded-md hover:bg-white/5 active:scale-95 transition-all relative"
                              >
                                <MoreHorizontal className="w-5 h-5 text-[#808080] hover:text-[#C0C0C0] transition-colors" />
                              </button>
                            </div>
                          </div>
                          
                          {/* 标题和简介 (居中) */}
                          <h3 className="text-[20px] md:text-[22px] font-black text-[#F8F8F8] leading-tight mb-3.5 tracking-wide drop-shadow-md">
                            {p.name}
                          </h3>
                          <p className="text-[14px] text-[#A0A0A0] leading-[1.7] line-clamp-2 max-w-[92%]" style={{ wordBreak: "break-word" }}>
                            {p.intro}
                          </p>

                          {/* 展开的操作菜单 */}
                          {activeMenuId === p.id && (
                            <div
                              className="border-t border-[#242428] flex animate-fade-in w-full mt-5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => { handleOpenForm(p); }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-medium text-[#A0A0A0] hover:bg-white/5 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                                编辑
                              </button>
                              <div className="w-px bg-[#242428]" />
                              <button
                                onClick={() => handleDelete(p.id)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-medium text-[#D05050] hover:bg-red-500/5 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                删除
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              )}
              {activeFilter === "record_bookmarks" && (
                recordBookmarks.length === 0 ? (
                  <div className="py-12 text-center text-[#505050] font-medium text-[13px]">暂无记录收藏</div>
                ) : (
                  <div className="flex flex-col">
                    {recordBookmarks.map(r => {
                      const isLong = r.content && r.content.length > 90;
                      return (
                        <div
                          key={r.id}
                          onClick={() => { if (r.projectId) { setSelectedArchiveId(r.projectId); setSelectedRecordId(r.id); } }}
                          className="bg-[#1A1A1E] rounded-2xl px-5 py-4 cursor-pointer border border-[#242428] hover:border-[#333338] active:scale-[0.99] transition-all duration-200 mb-3"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            {r.title ? (
                              <h3 className="text-[16px] font-bold text-[#E0E0E0] leading-snug line-clamp-2 flex-1">
                                {r.title}
                              </h3>
                            ) : (
                              <div className="flex-1" />
                            )}
                            <div className="flex items-center gap-2 shrink-0 mt-0.5">
                              {r.type === "expansion" && (
                                <span className="text-[10px] text-[#5B9BD5] bg-[#1A2535] px-2 py-0.5 rounded-full font-medium">
                                  拓展
                                </span>
                              )}
                              <span className="text-[12px] text-[#606060] whitespace-nowrap">{r.timeAgo || "刚刚"}</span>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (r.projectId && onToggleRecordBookmark) {
                                    onToggleRecordBookmark(r.projectId, r.id);
                                  }
                                }}
                                className={`ml-1 p-1 rounded-md transition-colors ${
                                  r.bookmarked 
                                    ? "text-amber-400 bg-amber-400/10" 
                                    : "text-[#606060] hover:text-[#A0A0A0] hover:bg-white/5"
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${r.bookmarked ? "fill-amber-400" : ""}`} />
                              </button>
                            </div>
                          </div>
                          <div className="relative">
                            <p
                              className="text-[15px] text-[#C8C8C8] leading-[1.7]"
                              style={{ 
                                wordBreak: "break-word",
                                display: "-webkit-box",
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden"
                              }}
                            >
                              {r.content}
                            </p>
                            {isLong && (
                              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#1A1A1E] to-transparent pointer-events-none" />
                            )}
                          </div>
                          {(() => {
                            const images = r.images?.length ? r.images : (r.imageUrl ? [r.imageUrl] : []);
                            if (images.length === 0) return null;
                            return (
                              <div className="mt-3 relative w-full h-36 rounded-xl bg-[#242428] overflow-hidden border border-[#2A2A2E]">
                                <img src={images[0]} alt="缩略图" className="w-full h-full object-cover opacity-80" />
                                {images.length > 1 && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                    <div className="px-4 py-2 bg-black/60 rounded-full border border-white/10 text-white/95 text-[13px] font-medium tracking-wider shadow-lg">
                                      共 {images.length} 张图片 · 点击查看
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                )
              )}
              {activeFilter === "draft_records" && (
                draftRecords.length === 0 ? (
                  <div className="py-12 text-center text-[#505050] font-medium text-[13px]">暂无待发布记录</div>
                ) : (
                  <div className="flex flex-col">
                    {draftRecords.map(r => {
                      const isLong = r.content && r.content.length > 90;
                      return (
                        <div
                          key={r.id}
                          onClick={() => { if (onEditDraft) onEditDraft(r); }}
                          className="bg-[#1A1A1E] rounded-2xl px-5 py-4 cursor-pointer border border-[#242428] hover:border-[#333338] active:scale-[0.99] transition-all duration-200 mb-3"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            {r.title ? (
                              <h3 className="text-[16px] font-bold text-[#E0E0E0] leading-snug line-clamp-2 flex-1">
                                {r.title}
                              </h3>
                            ) : (
                              <div className="flex-1" />
                            )}
                            <div className="flex items-center gap-2 shrink-0 mt-0.5">
                              {r.type === "expansion" && (
                                <span className="text-[10px] text-[#5B9BD5] bg-[#1A2535] px-2 py-0.5 rounded-full font-medium">
                                  拓展
                                </span>
                              )}
                              <span className="text-[12px] text-[#606060] whitespace-nowrap">{r.timeAgo || "刚刚"}</span>
                            </div>
                          </div>
                          <div className="relative">
                            <p
                              className="text-[15px] text-[#C8C8C8] leading-[1.7]"
                              style={{ 
                                wordBreak: "break-word",
                                display: "-webkit-box",
                                WebkitLineClamp: 4,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden"
                              }}
                            >
                              {r.content?.replace(/<[^>]+>/g, '') || ""}
                            </p>
                            {isLong && (
                              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#1A1A1E] to-transparent pointer-events-none" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </div>
          

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

    </div>
  );
}
