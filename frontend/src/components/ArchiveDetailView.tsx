import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ArrowLeft, ChevronRight, ChevronDown, Plus, Star, MoreHorizontal, Edit2, Trash2 } from "lucide-react";
import { Project, Comment } from "../types";
import ConfirmModal from "./ConfirmModal";

interface ArchiveDetailViewProps {
  project: Project;
  initialRecordId?: string;
  onBack: () => void;
  onToggleRecordBookmark?: (projectId: string, recordId: string) => void;
  onDeleteRecord?: (projectId: string, recordId: string) => void;
  onAddRecord?: (projectId: string, tag: string, ratingFields?: string[], customInputs?: {name: string, type: 'singleLine'|'multiLine'}[], initialRecord?: Comment) => void;
}

// 辅助函数：将相对时间（如"5小时前"）转换为精准的"YYYY-MM-DD HH:mm"格式
function formatExactDate(timeAgo: string | undefined): string {
  if (!timeAgo) return "未知时间";
  const now = new Date();
  let msToSubtract = 0;

  if (timeAgo.includes("刚刚")) {
    msToSubtract = 0;
  } else if (timeAgo.includes("分钟前")) {
    const min = parseInt(timeAgo) || 0;
    msToSubtract = min * 60 * 1000;
  } else if (timeAgo.includes("小时前")) {
    const hr = parseInt(timeAgo) || 0;
    msToSubtract = hr * 60 * 60 * 1000;
  } else if (timeAgo.includes("天前")) {
    const days = parseInt(timeAgo) || 0;
    msToSubtract = days * 24 * 60 * 60 * 1000;
  } else if (timeAgo.includes("月前")) {
    const months = parseInt(timeAgo) || 0;
    msToSubtract = months * 30 * 24 * 60 * 60 * 1000;
  } else if (timeAgo.includes("年前")) {
    const years = parseInt(timeAgo) || 0;
    msToSubtract = years * 365 * 24 * 60 * 60 * 1000;
  } else {
    return timeAgo;
  }

  const targetDate = new Date(now.getTime() - msToSubtract);
  const yyyy = targetDate.getFullYear();
  const MM = String(targetDate.getMonth() + 1).padStart(2, "0");
  const dd = String(targetDate.getDate()).padStart(2, "0");
  const hh = String(targetDate.getHours()).padStart(2, "0");
  const mm = String(targetDate.getMinutes()).padStart(2, "0");
  
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
}

/**
 * 档案库详情页 — 沉浸式阅读体验
 *
 * 设计原则：
 * 1. 舒适排版：正文 16px，行高 1.75，左右 20px 边距
 * 2. 清晰层级：标题/时间/正文三级字重区分
 * 3. 沉浸交互：下滑隐藏导航栏，上滑恢复
 * 4. 暗黑适配：底色 #141416，文字 #E0E0E0，避免纯黑+纯白
 * 5. 卡片式记录：Flomo 风格，白色卡片突出于微灰底
 */
export default function ArchiveDetailView({ project, initialRecordId, onBack, onToggleRecordBookmark, onDeleteRecord, onAddRecord }: ArchiveDetailViewProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleteRecordId, setDeleteRecordId] = useState<string | null>(null);
  const [viewingRecord, setViewingRecord] = useState<Comment | null>(() => {
    if (initialRecordId && project.comments) {
      return project.comments.find(c => c.id === initialRecordId) || null;
    }
    return null;
  });
  // 导航栏可见性（沉浸式滚动）
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 将标签拆分为路径数组
  const getTagsPath = (tags?: string[]) => {
    if (!tags || tags.length === 0) return ["未分类"];
    if (tags[0].includes(" / ")) return tags[0].split(" / ");
    return [tags[0]];
  };

  const tagsPath = getTagsPath(project.tags);
  const records = project.comments || [];

  // ========== 双端点时间轴状态 ==========
  const L = records.length;
  const [timeRange, setTimeRange] = useState<[number, number]>([0, Math.max(0, L - 1)]);

  // 当 records 数量改变时，重置时间轴范围
  useEffect(() => {
    setTimeRange([0, Math.max(0, L - 1)]);
  }, [L]);

  const showTimeline = L > 1;

  // 根据选中的范围过滤记录
  const filteredRecords = useMemo(() => {
    if (!showTimeline) return records;
    const [startVal, endVal] = timeRange;
    const startIndex = L - 1 - endVal;
    const endIndex = L - 1 - startVal;
    return records.slice(startIndex, endIndex + 1);
  }, [records, timeRange, showTimeline, L]);


  // 沉浸式滚动：下滑隐藏顶栏，上滑显示
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const currentY = container.scrollTop;
    if (currentY > lastScrollY.current && currentY > 80) {
      setNavVisible(false); // 向下滚动 → 隐藏
    } else {
      setNavVisible(true);  // 向上滚动 → 显示
    }
    lastScrollY.current = currentY;
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll, viewingRecord]);

  // 打开全文时重置滚动
  useEffect(() => {
    scrollContainerRef.current?.scrollTo(0, 0);
    setNavVisible(true);
    lastScrollY.current = 0;
  }, [viewingRecord]);

  // ========== 全文查看视图 (Medium 风格沉浸阅读) ==========
  if (viewingRecord) {
    return (
      <div
        key="detail"
        ref={scrollContainerRef}
        className="h-[100dvh] overflow-y-auto bg-[#141416] font-sans"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* 浮动导航栏 — 滚动时自动收起 */}
        <header
          className={`sticky top-0 z-50 flex items-center h-12 px-5 transition-all duration-300 ${
            navVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-full pointer-events-none"
          }`}
          style={{ background: "rgba(20,20,22,0.85)", backdropFilter: "blur(16px)" }}
        >
          <button
            onClick={() => {
              // 如果是直接携带 initialRecordId 进来的，返回上一级(直接回列表)会更顺畅
              // 但为了探索连贯性，这里也可以返回到该档案的完整列表视图
              if (initialRecordId && viewingRecord?.id === initialRecordId) {
                onBack();
              } else {
                setViewingRecord(null);
              }
            }}
            className="p-1.5 -ml-1.5 rounded-lg text-[#A0A0A0] hover:text-white active:scale-95 transition-all"
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>
          <span className="ml-3 text-[13px] text-[#808080] font-medium truncate">
            {project.name}
          </span>
        </header>

        {/* 正文阅读区 — Medium 级排版 */}
        <article className="px-5 md:px-8 pt-6 pb-20 max-w-[640px] mx-auto">
          {/* 标题与时间 */}
          <div className="mb-6 flex flex-col gap-2">
            {project.requireTitleField && (
              <h1 className="text-[24px] md:text-[28px] font-black text-white leading-tight tracking-wide drop-shadow-md">
                {viewingRecord.title || "无"}
              </h1>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <p className="text-[13px] text-[#808080] font-medium tracking-wider">{formatExactDate(viewingRecord.timeAgo)}</p>
                
                {viewingRecord.ratings && Object.keys(viewingRecord.ratings).length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#303030]"></span>
                    {Object.entries(viewingRecord.ratings).map(([key, val]) => (
                      <span key={key} className="text-[12px] font-medium text-amber-400">
                        {key}: {val}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* 全文视图：收藏按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleRecordBookmark?.(project.id, viewingRecord.id);
                  setViewingRecord(prev => prev ? {...prev, bookmarked: !prev.bookmarked} : prev);
                }}
                className={`p-1.5 rounded-md transition-colors ${
                  viewingRecord.bookmarked 
                    ? "text-amber-400 bg-amber-400/10" 
                    : "text-[#808080] hover:text-[#E0E0E0] hover:bg-white/5"
                }`}
              >
                <Star className={`w-4 h-4 ${viewingRecord.bookmarked ? "fill-amber-400" : ""}`} />
              </button>
            </div>

            {/* 自定义数据属性块 */}
            {viewingRecord.customData && Object.keys(viewingRecord.customData).length > 0 && (
              <div className="mt-4 flex flex-col gap-2 p-4 bg-[#1A1A1E] border border-[#2A2A2E] rounded-xl shadow-sm">
                {Object.entries(viewingRecord.customData).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-[#808080] uppercase tracking-wider">{key}</span>
                    <span className="text-[14px] text-[#D0D0D0] break-words whitespace-pre-wrap">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 如果有类型标记 */}
          {viewingRecord.type === "expansion" && (
            <div className="mb-6 flex items-center gap-2 px-3.5 py-2.5 bg-[#1A1F2A] rounded-lg border-l-[3px] border-[#4A90D9]">
              <span className="text-[12px] text-[#7EB8E0] font-medium">🔗 拓展延伸记录</span>
            </div>
          )}

          {/* 正文 — 16px, line-height 1.8, 舒适阅读 */}
          <div
            className="text-[#C8C8C8] leading-[1.8] rich-text-content prose-invert max-w-none"
            style={{ fontSize: "16px", letterSpacing: "0.01em", wordBreak: "break-word" }}
            dangerouslySetInnerHTML={{ __html: viewingRecord.content }}
          />

          {/* 如果有图片 */}
          {(() => {
            const images = viewingRecord.images?.length ? viewingRecord.images : (viewingRecord.imageUrl ? [viewingRecord.imageUrl] : []);
            return images.map((imgUrl, idx) => (
              <div key={idx} className="mt-6 w-full rounded-xl overflow-hidden border border-[#2A2A2E]">
                <img src={imgUrl} alt={`附加图片 ${idx + 1}`} className="w-full h-auto object-cover opacity-90" />
              </div>
            ));
          })()}

          {/* 底部留白 + 分隔 */}
          <div className="mt-12 pt-6 border-t border-[#1E1E22]">
            <p className="text-[12px] text-[#505050] text-center">— 记录结束 —</p>
          </div>
        </article>
      </div>
    );
  }

  // ========== 主视图：Hero + 记录列表 ==========
  return (
    <div
      key="list"
      ref={scrollContainerRef}
      className="h-[100dvh] overflow-y-auto bg-[#141416] font-sans"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* 浮动导航栏 — 沉浸式，滚动时隐藏 */}
      <header
        className={`sticky top-0 z-50 flex items-center h-12 px-5 transition-all duration-300 ${
          navVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
        style={{ background: "rgba(20,20,22,0.85)", backdropFilter: "blur(16px)" }}
      >
        <button
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-lg text-[#A0A0A0] hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-[18px] h-[18px]" />
        </button>
        <span className="ml-3 text-[13px] text-[#808080] font-medium truncate">
          {project.name}
        </span>
      </header>

      {/* Hero 区域 — 紧凑、信息层次清晰 */}
      <div className="relative w-full min-h-[160px] pt-14 pb-5 overflow-hidden">
        {/* 背景图 */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{
            backgroundImage: `url(${project.coverImage || '/api/static/images/mocks/hot_carousel_1.webp'})`,
            opacity: 0.35,
            filter: "brightness(0.8)",
          }}
        />
        {/* 渐变遮罩：确保文字可读性，平滑过渡到列表底色 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/80 to-[#141416]/10" />

        {/* Hero 文字内容 (相对定位，跟随文档流) */}
        <div className="relative z-10 flex flex-col px-5 md:px-8 max-w-[640px] mx-auto w-full">
          {/* 标签路径 */}
          <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
            {tagsPath.map((part, i, arr) => (
              <React.Fragment key={i}>
                <span className="text-[12px] font-semibold text-amber-400 tracking-wide">
                  {part}
                </span>
                {i < arr.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-[#606060] shrink-0 mx-0.5" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* 标题 — 大字，紧凑 */}
          <h1 className="text-[26px] md:text-[32px] font-bold text-[#F0F0F0] leading-[1.2] mb-3 tracking-tight">
            {project.name}
          </h1>

          {/* 简介 — 柔和灰 */}
          <p className="text-[14px] text-[#A0A0A0] leading-[1.65] max-w-[480px] mb-4">
            {project.intro}
          </p>

          <button
            onClick={() => onAddRecord?.(project.id, project.tags?.[0] || "", project.ratingFields, project.customInputs)}
            className="self-start flex items-center gap-2 px-5 py-2.5 bg-[#F0F0F0] hover:bg-white text-[#141416] text-[13px] font-semibold rounded-full active:scale-[0.97] transition-all duration-200 shadow-md"
          >
            <Plus className="w-4 h-4 text-[#141416]" />
            添加记录
          </button>
        </div>
      </div>

      {/* 记录列表区域 */}
      <div className="px-5 md:px-8 max-w-[640px] mx-auto w-full pb-28">

        {/* 区域标题 */}
        <div className="flex items-center justify-between pt-5 pb-3">
          <span className="text-[14px] font-semibold text-[#C0C0C0]">归档记录</span>
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#606060]">
              {filteredRecords.length} 条
            </span>
          </div>
        </div>

        {/* 双端点时间轴筛选 */}
        {showTimeline && (
          <div className="mb-5 px-1 bg-[#1A1A1E] rounded-xl p-3 border border-[#242428]">
            <div className="flex justify-between items-center mb-3 text-[12px] text-[#808080]">
               <span>最早: {formatExactDate(records[L - 1 - timeRange[0]]?.timeAgo)}</span>
               <span>最晚: {formatExactDate(records[L - 1 - timeRange[1]]?.timeAgo)}</span>
            </div>
            
            {/* 滑块容器 */}
            <div className="relative w-full h-5 flex items-center">
              {/* 轨道底色 */}
              <div className="absolute w-full h-[4px] bg-[#2A2A2E] rounded-full" />
              {/* 激活区域 */}
              <div
                className="absolute h-[4px] bg-[#A88840] rounded-full"
                style={{
                  left: `${(timeRange[0] / (L - 1)) * 100}%`,
                  width: `${((timeRange[1] - timeRange[0]) / (L - 1)) * 100}%`
                }}
              />
              {/* 左滑块 */}
              <input
                type="range"
                min={0}
                max={L - 1}
                value={timeRange[0]}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), timeRange[1]);
                  setTimeRange([val, timeRange[1]]);
                }}
                style={{ zIndex: timeRange[0] >= (L - 1) / 2 ? 40 : 20 }}
                className="absolute w-full h-full appearance-none bg-transparent pointer-events-none 
                           [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none 
                           [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                           [&::-webkit-slider-thumb]:bg-[#E8C870] [&::-webkit-slider-thumb]:rounded-full 
                           [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,0,0,0.6)] 
                           [&::-webkit-slider-thumb]:border-[1.5px] [&::-webkit-slider-thumb]:border-[#141416] 
                           [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none 
                           [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                           [&::-moz-range-thumb]:bg-[#E8C870] [&::-moz-range-thumb]:rounded-full 
                           [&::-moz-range-thumb]:border-[1.5px] [&::-moz-range-thumb]:border-[#141416]"
              />
              {/* 右滑块 */}
              <input
                type="range"
                min={0}
                max={L - 1}
                value={timeRange[1]}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), timeRange[0]);
                  setTimeRange([timeRange[0], val]);
                }}
                style={{ zIndex: 30 }}
                className="absolute w-full h-full appearance-none bg-transparent pointer-events-none 
                           [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none 
                           [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                           [&::-webkit-slider-thumb]:bg-[#E8C870] [&::-webkit-slider-thumb]:rounded-full 
                           [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,0,0,0.6)] 
                           [&::-webkit-slider-thumb]:border-[1.5px] [&::-webkit-slider-thumb]:border-[#141416] 
                           [&::-webkit-slider-thumb]:cursor-pointer
                           [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none 
                           [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                           [&::-moz-range-thumb]:bg-[#E8C870] [&::-moz-range-thumb]:rounded-full 
                           [&::-moz-range-thumb]:border-[1.5px] [&::-moz-range-thumb]:border-[#141416]"
              />
            </div>
          </div>
        )}

        {/* 记录卡片 — Flomo 风格，卡片突出于暗底 */}
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[14px] text-[#505050] mb-1">暂无符合范围的记录</p>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const isLong = record.content.length > 90;

              return (
                <div
                  key={record.id}
                  onClick={() => setViewingRecord(record)}
                  className="bg-[#1A1A1E] rounded-2xl px-5 py-4 cursor-pointer border border-[#242428] hover:border-[#333338] active:scale-[0.99] transition-all duration-200"
                >
                  {/* 头部：标题与时间 */}
                  <div className={`flex items-start ${project.requireTitleField ? 'justify-between' : 'justify-end'} gap-3 mb-4`}>
                    {project.requireTitleField && (
                      <h3 className="text-[17px] md:text-[19px] font-black text-white leading-tight line-clamp-2 flex-1 tracking-wide drop-shadow-sm">
                        {record.title || "无"}
                      </h3>
                    )}
                    
                    <div className="flex flex-col items-end gap-2 shrink-0 mt-1">
                      <div className="flex items-center gap-2">
                        {record.type === "expansion" && (
                          <span className="text-[10px] md:text-[11px] text-[#4cd7f6] bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 px-2 py-0.5 rounded-md font-bold tracking-wide">
                            拓展
                          </span>
                        )}
                        <span className="text-[11px] md:text-[12px] text-[#808080] font-medium whitespace-nowrap tracking-wider">{formatExactDate(record.timeAgo)}</span>
                        
                        {/* 卡片视图：收藏按钮 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleRecordBookmark?.(project.id, record.id);
                          }}
                          className={`ml-1 p-1 rounded-md transition-colors ${
                            record.bookmarked 
                              ? "text-amber-400 bg-amber-400/10" 
                              : "text-[#606060] hover:text-[#A0A0A0] hover:bg-white/5"
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${record.bookmarked ? "fill-amber-400" : ""}`} />
                        </button>

                        {/* 更多操作入口 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === record.id ? null : record.id);
                          }}
                          className="p-1 rounded-md text-[#606060] hover:text-[#A0A0A0] hover:bg-white/5 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* 渲染评分 */}
                      {record.ratings && Object.keys(record.ratings).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 justify-end">
                          {Object.entries(record.ratings).map(([key, val]) => (
                            <span key={key} className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] rounded font-medium">
                              {key}: {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 渲染扩展字段（简化版，仅显示字段名和部分值） */}
                  {record.customData && Object.keys(record.customData).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(record.customData).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-1.5 px-2 py-1 bg-[#232328] rounded-md text-[11px] max-w-full overflow-hidden">
                          <span className="text-[#808080] shrink-0">{key}:</span>
                          <span className="text-[#C0C0C0] truncate">{val}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 正文预览 — 4行截断 + 渐变遮罩 */}
                  <div className="relative">
                    <div
                      className="text-[14px] md:text-[15px] text-[#A0A0A0] leading-relaxed rich-text-content prose-invert max-w-none font-light"
                      style={{ 
                        wordBreak: "break-word",
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                      dangerouslySetInnerHTML={{ __html: record.content }}
                    />

                    {/* 渐变遮罩 — 仅长内容显示 */}
                    {isLong && (
                      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#1A1A1E] to-transparent pointer-events-none" />
                    )}
                  </div>

                  {/* 如果有多图或单图，在卡片里显示缩略预览与叠加提示 */}
                  {(() => {
                    const images = record.images?.length ? record.images : (record.imageUrl ? [record.imageUrl] : []);
                    if (images.length === 0) return null;
                    
                    return (
                      <div className="mt-3 relative w-full h-36 rounded-xl bg-[#242428] overflow-hidden border border-[#2A2A2E]">
                        <img src={images[0]} alt="缩略图" className="w-full h-full object-cover opacity-80" />
                        
                        {/* 如果有多张图，显示提示 */}
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

                  {/* 展开提示 */}
                  {isLong && (
                    <div className="mt-3 flex items-center gap-1.5 text-[13px] text-[#5A9BD5] font-medium hover:text-[#7EB8E0] transition-colors">
                      <span>阅读全部</span>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  )}

                  {/* 展开的操作菜单 */}
                  {activeMenuId === record.id && (
                    <div
                      className="mt-4 pt-3 border-t border-[#242428] flex animate-fade-in"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => { 
                          if (onAddRecord) {
                            const fields = record.ratings ? Object.keys(record.ratings) : [];
                            const customInputDefs = record.customData 
                              ? Object.keys(record.customData).map(k => ({ name: k, type: 'singleLine' as const }))
                              : [];
                            onAddRecord(project.id, record.category || project.tags[0], fields, customInputDefs, record);
                          }
                          setActiveMenuId(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-[12px] font-medium text-[#A0A0A0] hover:bg-white/5 transition-colors rounded-lg"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        编辑
                      </button>
                      <div className="w-px bg-[#242428] mx-2" />
                      <button
                        onClick={() => {
                          setDeleteRecordId(record.id);
                          setActiveMenuId(null);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-[12px] font-medium text-[#c45353] hover:bg-red-500/10 transition-colors rounded-lg"
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
      
      <ConfirmModal
        isOpen={!!deleteRecordId}
        title="删除记录"
        message="确定要删除这条记录吗？该操作不可恢复。"
        confirmText="确认删除"
        cancelText="取消"
        variant="danger"
        onConfirm={() => {
          if (deleteRecordId && onDeleteRecord) {
            onDeleteRecord(project.id, deleteRecordId);
          }
          setDeleteRecordId(null);
        }}
        onCancel={() => setDeleteRecordId(null)}
      />
    </div>
  );
}
