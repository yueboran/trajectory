/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 灵感投资组合 — 资产化认知仪表盘
 * 将用户的个人主页设计为"基金经理的投资组合"视图
 */

import { useState, MouseEvent, useMemo } from "react";
import {
  User, Mail, TrendingUp, TrendingDown, Flame, Zap,
  Briefcase, Heart, Bookmark, Star, ChevronRight,
  BarChart3, Award, Target, Cpu, Globe, DollarSign,
  Sparkles, Crown, Eye, ArrowUpRight, ArrowDownRight,
  Calendar, Activity, HelpCircle, MessageSquare
} from "lucide-react";
import { Project, PortfolioHolding, PortfolioStats } from "../types";
import ProjectCard from "./ProjectCard";
import ArchiveDetailView from "./ArchiveDetailView";

// ========== 组件接口定义 ==========
interface ProfileViewProps {
  userEmail?: string;
  bookmarkedProjects: Project[];
  likedProjects: string[];
  submittedCount: number;
  allProjects: Project[];          // 全部项目列表（用于计算组合）
  onSelectProject: (id: string) => void;
  onLikeToggle?: (id: string, e: MouseEvent) => void;
  onBookmarkToggle?: (id: string, e: MouseEvent) => void;
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

// ========== 档案可视化图表组件 ==========
function VisualizationChart({ mode }: { mode: "activity" | "quantity" }) {
  // 模拟操作记录数据（创建、修改、删除）
  const activity = [
    { label: "06/08", c: 2, u: 5, d: 0 },
    { label: "06/09", c: 1, u: 3, d: 1 },
    { label: "06/10", c: 4, u: 8, d: 0 },
    { label: "06/11", c: 0, u: 2, d: 0 },
    { label: "06/12", c: 3, u: 6, d: 2 },
    { label: "06/13", c: 1, u: 4, d: 0 },
    { label: "06/14", c: 2, u: 7, d: 1 },
  ];
  // 模拟记录数量数据
  const quantity = [
    { label: "06/08", val: 120 },
    { label: "06/09", val: 125 },
    { label: "06/10", val: 133 },
    { label: "06/11", val: 135 },
    { label: "06/12", val: 141 },
    { label: "06/13", val: 146 },
    { label: "06/14", val: 154 },
  ];

  const h = 140;
  const w = 300; 
  const step = w / (activity.length - 1);

  if (mode === "activity") {
    const max = 10;
    const getPts = (key: 'c'|'u'|'d') => activity.map((d, i) => `${i * step},${h - (d[key] / max) * h}`).join(" ");
    return (
      <div className="w-full">
         <svg viewBox={`-10 -10 ${w+20} ${h+20}`} className="w-full h-[140px] overflow-visible">
            {/* 网格线 */}
            <line x1="0" y1={h/2} x2={w} y2={h/2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1="0" x2={w} y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="0" y1={h} x2={w} y2={h} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />

            <polyline points={getPts('u')} fill="none" stroke="#fbabff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={getPts('c')} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={getPts('d')} fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            
            {activity.map((d, i) => (
              <g key={i}>
                <circle cx={i*step} cy={h - (d.u/max)*h} r="3" fill="#18191c" stroke="#fbabff" strokeWidth="2" />
                <circle cx={i*step} cy={h - (d.c/max)*h} r="3" fill="#18191c" stroke="#4ade80" strokeWidth="2" />
                <circle cx={i*step} cy={h - (d.d/max)*h} r="3" fill="#18191c" stroke="#f87171" strokeWidth="2" />
              </g>
            ))}
         </svg>
         <div className="flex justify-between mt-4">
           {activity.map(d => <span key={d.label} className="text-[10px] text-gray-500 font-mono">{d.label}</span>)}
         </div>
         <div className="flex justify-center gap-5 mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#4ade80]"></div><span className="text-xs text-gray-400 font-bold tracking-wider">创建</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#fbabff]"></div><span className="text-xs text-gray-400 font-bold tracking-wider">修改</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#f87171]"></div><span className="text-xs text-gray-400 font-bold tracking-wider">删除</span></div>
         </div>
      </div>
    );
  }

  const minV = 100;
  const maxV = 160;
  const range = maxV - minV;
  const pts = quantity.map((d, i) => `${i * step},${h - ((d.val - minV)/range) * h}`).join(" ");
  const areaPts = `0,${h} ${pts} ${w},${h}`;
  
  return (
    <div className="w-full">
      <svg viewBox={`-10 -10 ${w+20} ${h+20}`} className="w-full h-[140px] overflow-visible">
        <defs>
          <linearGradient id="quantGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4cd7f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1={h/2} x2={w} y2={h/2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="0" y1="0" x2={w} y2="0" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="0" y1={h} x2={w} y2={h} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />

        <polygon points={areaPts} fill="url(#quantGrad)" />
        <polyline points={pts} fill="none" stroke="#4cd7f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {quantity.map((d, i) => (
          <circle key={i} cx={i*step} cy={h - ((d.val - minV)/range) * h} r="4" fill="#18191c" stroke="#4cd7f6" strokeWidth="2" />
        ))}
      </svg>
      <div className="flex justify-between mt-4">
        {quantity.map(d => <span key={d.label} className="text-[10px] text-gray-500 font-mono">{d.label}</span>)}
      </div>
      <div className="flex justify-center mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-[#4cd7f6]"></div>
          <span className="text-xs text-gray-400 font-bold tracking-wider">总记录数量</span>
        </div>
      </div>
    </div>
  );
}

// ========== 主组件 ==========
export default function ProfileView({
  userEmail = "yueboran666@gmail.com",
  bookmarkedProjects,
  likedProjects,
  submittedCount,
  allProjects,
  onSelectProject,
  onLikeToggle,
  onBookmarkToggle,
}: ProfileViewProps) {

  const [activeFilter, setActiveFilter] = useState<"archive_bookmarks" | "record_bookmarks" | "draft_records">("archive_bookmarks");
  const [chartMode, setChartMode] = useState<"activity" | "quantity">("activity");
  const [selectedArchiveId, setSelectedArchiveId] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

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
  
  // 记录收藏 (mock)
  const recordBookmarks = allProjects.flatMap(p => p.comments?.map(c => ({...c, projectId: p.id})) || []).slice(0, 3);
  
  // 待发布记录 (mock)
  const draftRecords = [
    {
      id: "mock-draft-1",
      content: "关于商业模式图谱的补充：需要考虑边缘计算的成本结构。目前的定价模型可能会导致高并发下的利润率下降...",
      timeAgo: "刚刚",
      projectId: allProjects[0]?.id
    },
    {
      id: "mock-draft-2",
      title: "新的架构思路：微前端集成",
      content: "考虑将各个业务模块拆分成微前端应用，这样可以独立部署，降低发布风险。建议先在后台管理系统试点。",
      timeAgo: "2小时前",
      type: "expansion",
      projectId: allProjects[0]?.id
    }
  ];

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
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#18191c] pb-24 animate-fade-in select-none font-sans w-full flex flex-col items-center">
      


      <div className="w-full max-w-2xl bg-[#232429] md:rounded-lg overflow-hidden shadow-2xl">
        
        {/* Top Hero Section */}
        <div className="relative w-full h-[200px] md:h-[240px] bg-black group overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 group-hover:scale-105"
            style={{ backgroundImage: 'url(/images/banners/profile_hero.png)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#232429] via-[#232429]/60 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 z-10 pb-8">
            <div className="flex items-center gap-5 mb-3">
              {/* Avatar */}
              <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full bg-gradient-to-tr from-[#d0bcff] to-[#4cd7f6] p-[2px] shadow-[0_0_20px_rgba(208,188,255,0.3)]">
                <div 
                  className="w-full h-full bg-[#0b1326] rounded-full flex items-center justify-center overflow-hidden bg-cover bg-center"
                  style={{ backgroundImage: 'url(/images/banners/profile_hero.png)' }}
                />
              </div>

              {/* Username */}
              <h2 className="text-white font-display font-black text-2xl md:text-3xl tracking-tight drop-shadow-lg leading-tight">
                {userEmail.split("@")[0]}
              </h2>
            </div>
            
          </div>
        </div>

        {/* Stats Panel (Glassmorphism over dark bg) */}
        <div className="px-4 md:px-6 py-2 -mt-6 relative z-20">
          <div className="rounded-xl p-5 bg-[#1a1b1f]/90 backdrop-blur-xl border border-white/10 shadow-2xl mb-6">
            
            {/* Chart Area */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#d0bcff]" />
                <h3 className="text-white font-bold text-sm tracking-wide">档案可视化分析</h3>
              </div>
              <div className="flex bg-black/50 rounded-lg p-1 border border-white/5">
                <button 
                  onClick={() => setChartMode('activity')} 
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wider transition-all ${chartMode === 'activity' ? 'bg-[#d0bcff]/20 text-[#d0bcff]' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  操作记录
                </button>
                <button 
                  onClick={() => setChartMode('quantity')} 
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wider transition-all ${chartMode === 'quantity' ? 'bg-[#4cd7f6]/20 text-[#4cd7f6]' : 'text-gray-400 hover:text-gray-200'}`}
                >
                  记录数量
                </button>
              </div>
            </div>

            <VisualizationChart mode={chartMode} />

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
                          className="bg-[#1A1A1E] rounded-2xl border border-[#242428] hover:border-[#333338] transition-all duration-200 overflow-hidden active:scale-[0.99] mb-3 cursor-pointer"
                        >
                          <div className="px-5 py-4">
                            {/* 顶部行：标签 */}
                            <div className="flex items-center justify-between mb-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-medium text-amber-400/80 uppercase tracking-wide">
                                  {lastTag}
                                </span>
                                {recordCount > 0 && (
                                  <>
                                    <span className="text-[#383838]">·</span>
                                    <span className="text-[11px] text-[#505050]">{recordCount} 条记录</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <h3 className="text-[15px] font-semibold text-[#DCDCDC] leading-[1.4] mb-1.5">
                              {p.name}
                            </h3>
                            <p className="text-[13px] text-[#808080] leading-[1.65] line-clamp-2" style={{ wordBreak: "break-word" }}>
                              {p.intro}
                            </p>
                          </div>
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
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </div>
          
          {/* Endowment Effect Guide */}
          {stats.totalHoldings > 0 && (
            <div className="py-6 pt-4">
              <button className="w-full bg-transparent border border-gray-600 hover:border-gray-400 text-white font-bold py-3.5 rounded transition-colors text-xs tracking-wider">
                发现更多项目 (EXPLORE)
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
