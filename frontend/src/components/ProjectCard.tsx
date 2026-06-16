/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MessageSquare, Heart, Bookmark, Flame, Cpu, Award, Zap, Bell } from "lucide-react";
import { Project, RADAR_DIMS, RadarDimensions, getRadarAverage } from "../types";
import { MouseEvent } from "react";

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
  onLikeToggle?: (id: string, e: MouseEvent) => void;
  onBookmarkToggle?: (id: string, e: MouseEvent) => void;
  onPainPointToggle?: (id: string, e: MouseEvent) => void;
  isLiked?: boolean;
  isTracked?: boolean;
  hasPainPoint?: boolean;
}

// ========== 迷你雷达图（卡片内嵌） ==========
function MiniRadar({ radar, size = 80 }: { radar: RadarDimensions; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const dims = RADAR_DIMS;
  const angleStep = (Math.PI * 2) / dims.length;
  const startAngle = -Math.PI / 2;

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / 100) * radius;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // 外框
  const outerPts = dims.map((_, i) => getPoint(i, 100));
  const outerPath = outerPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // 数据多边形
  const dataPts = dims.map((d, i) => getPoint(i, radar[d.key]));
  const dataPath = dataPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <defs>
        <linearGradient id="miniRadarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d0bcff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#4cd7f6" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* 外框 */}
      <path d={outerPath} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
      {/* 轴线 */}
      {dims.map((_, i) => {
        const ep = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={ep.x} y2={ep.y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />;
      })}
      {/* 数据 */}
      <path d={dataPath} fill="url(#miniRadarFill)" stroke="url(#radarStroke)" strokeWidth="1.5" strokeLinejoin="round" />
      {dataPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill={dims[i].color} />
      ))}
    </svg>
  );
}

export default function ProjectCard({
  project,
  onSelect,
  onLikeToggle,
  onBookmarkToggle,
  onPainPointToggle,
  isLiked,
  isTracked,
  hasPainPoint,
}: ProjectCardProps) {
  // 选择图标
  const renderIcon = () => {
    switch (project.icon) {
      case "neurology":
        return <Cpu className="w-5 h-5 text-purple-200" />;
      case "account_balance":
        return <Award className="w-5 h-5 text-cyan-200" />;
      default:
        return <Flame className="w-5 h-5 text-[#d0bcff]" />;
    }
  };

  // 默认渐变色
  const getGradient = () => {
    return "from-[#d0bcff] to-[#4cd7f6] shadow-[0_0_15px_rgba(208,188,255,0.25)]";
  };

  const painCount = project.painPointCount ?? 0;
  const radarAvg = getRadarAverage(project.radar);

  return (
    <article
      onClick={() => onSelect(project.id)}
      className="bg-[#171f33]/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 relative md:hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
      {/* 悬浮光晕 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#d0bcff]/5 via-[#4cd7f6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

      {/* 追踪状态角标 */}
      {isTracked && (
        <div className="absolute top-3 right-3 z-20">
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[7px] font-mono font-bold text-emerald-400 tracking-wider">
            <Bell className="w-2.5 h-2.5 fill-emerald-400" />
            追踪中
          </span>
        </div>
      )}

      {/* 顶部：项目名+热度 */}
      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getGradient()} flex items-center justify-center`}>
            {renderIcon()}
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-base text-[#dae2fd] group-hover:text-[#d0bcff] transition-colors truncate max-w-[150px] sm:max-w-[180px]">
              {project.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#171f33] px-2.5 py-1 rounded-full border border-white/5">
          <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-500" />
          <span className="font-mono text-[10px] text-rose-200 font-semibold">{project.hotness}</span>
        </div>
      </div>

      {/* 简介 */}
      <p className="font-sans text-sm text-[#cbc3d7] line-clamp-2 leading-relaxed relative z-10">
        {project.intro}
      </p>

      {/* 迷你雷达图 + 综合分 */}
      <div className="relative z-10 bg-[#0b1326]/50 rounded-xl p-3 border border-white/5 flex items-center gap-4">
        <MiniRadar radar={project.radar} size={80} />
        <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {RADAR_DIMS.map((dim) => (
            <div key={dim.key} className="flex items-center justify-between">
              <span className="font-mono text-[8px] tracking-wider" style={{ color: dim.color }}>{dim.label}</span>
              <span className="font-mono text-[10px] font-bold text-[#dae2fd]/80">{project.radar[dim.key]}</span>
            </div>
          ))}
          <div className="col-span-2 flex items-center justify-between pt-1.5 border-t border-white/5 mt-1">
            <span className="font-mono text-[9px] text-[#cbc3d7]/60">综合完成度</span>
            <span className="font-display text-sm font-bold bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] bg-clip-text text-transparent">{radarAvg}</span>
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="flex justify-between items-center pt-3 border-t border-white/5 relative z-10" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-1.5 items-center">
          {/* 痛点共鸣按钮 */}
          <button
            onClick={(e) => onPainPointToggle?.(project.id, e)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[9px] font-mono font-semibold border transition-all cursor-pointer ${
              hasPainPoint
                ? "border-amber-400/30 bg-amber-400/15 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.15)]"
                : "border-white/10 bg-[#171f33]/40 text-[#cbc3d7]/60 hover:text-amber-300 hover:border-amber-400/20 hover:bg-amber-400/5"
            }`}
          >
            <Zap className={`w-3 h-3 ${hasPainPoint ? "fill-amber-400" : ""}`} />
            <span>痛点共鸣</span>
            {(painCount > 0 || hasPainPoint) && (
              <span className="ml-0.5 font-bold">{painCount + (hasPainPoint ? 1 : 0)}</span>
            )}
          </button>

          {/* 标签 */}
          {project.tags.slice(0, 1).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded text-[9px] font-mono border border-white/10 text-[#cbc3d7] bg-[#171f33]/40 whitespace-nowrap hidden sm:inline"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2.5 text-[#cbc3d7]/60">
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{project.commentsCount}</span>
          </div>

          <button
            onClick={(e) => onLikeToggle?.(project.id, e)}
            className={`p-1 rounded-full transition-colors ${
              isLiked ? "text-rose-400 scale-110" : "text-[#cbc3d7]/50 hover:text-rose-400 hover:bg-white/5"
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
          </button>

          <button
            onClick={(e) => onBookmarkToggle?.(project.id, e)}
            className={`p-1 rounded-full transition-colors ${
              project.bookmarked ? "text-amber-400" : "text-[#cbc3d7]/50 hover:text-amber-400 hover:bg-white/5"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${project.bookmarked ? "fill-amber-400" : ""}`} />
          </button>
        </div>
      </div>
    </article>
  );
}
