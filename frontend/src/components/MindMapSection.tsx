/**
 * 个人成长与记录体系 — 多级嵌套列表
 * 支持折叠展开，每级均带有图片和摘要
 */
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Activity, Brain, Rocket, DollarSign, Users, Star, ArrowRight, Pause, Play } from "lucide-react";

// ═══════════════════════════════════════════
// 数据定义
// ═══════════════════════════════════════════

import { TreeNode, treeData } from "../data/treeData";

// ═══════════════════════════════════════════
// 递归水平树卡片组件 (Org Chart Node)
// ═══════════════════════════════════════════

function OrgNode({ node, isRoot = false, onClick }: { node: TreeNode, isRoot?: boolean, onClick?: () => void }) {
  const hasChildren = node.children && node.children.length > 0;
  
  return (
    <div className={`flex flex-col items-center relative ${isRoot ? 'w-full' : ''}`}>
      {/* 节点纵向卡片 */}
      <div 
        onClick={() => onClick && onClick()}
        className={`relative z-10 flex flex-col p-2.5 md:p-3 rounded-2xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all
          ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}
          ${isRoot ? "bg-white/5 w-full max-w-[145px] sm:max-w-none sm:w-[160px] md:w-[180px]" : "bg-black/60 w-[130px] sm:w-[140px] md:w-[150px]"}`}
      >
        {/* 顶部正方形封面图 */}
        <div 
          className="w-full aspect-square rounded-xl bg-cover bg-center border border-white/10 shadow-inner relative overflow-hidden mb-2 md:mb-3" 
          style={{ backgroundImage: `url(${node.image})` }} 
        >
          {isRoot && node.icon && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
               <span style={{ color: node.color }}>
                 {React.cloneElement(node.icon as React.ReactElement, { className: "w-8 h-8 md:w-10 md:h-10 opacity-80" })}
               </span>
            </div>
          )}
          {/* 边缘高亮 */}
          <div className="absolute inset-0 rounded-xl ring-1 ring-inset" style={{ ringColor: node.color + "40" }} />
        </div>
        
        {/* 底部文字区域 */}
        <div className="w-full flex flex-col justify-start flex-1">
          <h3 
            className="font-display font-semibold text-center drop-shadow-sm mb-1.5 leading-snug line-clamp-2 tracking-wide" 
            style={{ fontSize: isRoot ? '14px' : '11px', color: node.color }}
          >
            {node.label}
          </h3>
          <p className="text-[#A0A0A0] text-[10px] md:text-[11px] text-center line-clamp-3 leading-relaxed font-light">
            {node.summary}
          </p>
        </div>
      </div>

      {/* 子树区域 (采用玻璃拟态面板包裹，移除错乱连线，自适应换行) */}
      {hasChildren && (
        <>
          {/* 父节点往下的垂直连线 */}
          <div className="w-px h-5 md:h-8 bg-[#fbbf24]/30" />
          
          {/* 子节点玻璃拟态容器 */}
          <div className="w-fit max-w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex justify-center mx-auto">
             <div className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6">
                {node.children!.map((child) => (
                  <OrgNode key={child.id} node={child} />
                ))}
             </div>
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════

interface MindMapSectionProps {
  onBrowseProjects?: () => void;
  onSubmitIdea?: () => void;
  onCategorySelect?: (filter: string) => void;
}

export default function MindMapSection({ onBrowseProjects, onSubmitIdea, onCategorySelect }: MindMapSectionProps) {
  const [activeCategoryId, setActiveCategoryId] = useState("1");
  const [activeSubCategoryId, setActiveSubCategoryId] = useState("1-1");
  const [isCarouselPaused, setIsCarouselPaused] = useState(true);
  
  // 自动轮播定时器
  useEffect(() => {
    if (isCarouselPaused) return;

    const timer = setInterval(() => {
      setActiveCategoryId((currentId) => {
        const currentIndex = treeData.findIndex(n => n.id === currentId);
        const nextIndex = (currentIndex + 1) % treeData.length;
        const nextNode = treeData[nextIndex];
        
        // 自动选中下一个主节点的第一个子节点
        if (nextNode.children && nextNode.children.length > 0) {
          setActiveSubCategoryId(nextNode.children[0].id);
        } else {
          setActiveSubCategoryId("");
        }
        return nextNode.id;
      });
    }, 6000); // 每 6 秒轮播一次
    return () => clearInterval(timer);
  }, [isCarouselPaused]);
  
  const activeNode = treeData.find(n => n.id === activeCategoryId);
  const activeSubNode = activeNode?.children?.find(n => n.id === activeSubCategoryId) || activeNode?.children?.[0];

  const handleCategoryClick = (id: string) => {
    setActiveCategoryId(id);
    const newCat = treeData.find(n => n.id === id);
    if (newCat?.children?.length) {
      setActiveSubCategoryId(newCat.children[0].id);
    } else {
      setActiveSubCategoryId("");
    }
  };

  return (
    <section className="bg-[#030712] pb-8 md:pb-12 relative overflow-hidden">
      
      {/* 顶部 Hero 区域 (与总线拓扑融合，作为轮播图背景) */}
      <div className="relative w-full h-[240px] md:h-[280px] flex flex-col select-none overflow-hidden group">
        {/* Background Image Layer (绑定当前选中节点的图片，如果图片分辨率不够也可暂时用通用 banner) */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out hover:scale-105"
          style={{ backgroundImage: `url(${activeNode?.image || '/images/banners/hero_carousel_banner.png'})` }}
        />
        
        {/* Gradient Overlay 渐变遮罩，使文字清晰并向下平滑过渡到 #030712 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/95 via-[#030712]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#030712] to-transparent" />

        {/* Hero 主内容区 */}
        <div className="relative z-10 flex-1 flex flex-col justify-start px-6 md:px-20 pt-8 md:pt-14">
          <div className="max-w-2xl">
            {/* 主标题 */}
            <div className="mb-4 md:mb-6 animate-fade-in">
              <h1 className="font-display text-5xl md:text-7xl font-black tracking-[0.1em] mb-4 md:mb-6 drop-shadow-2xl text-white">
                迹向
              </h1>
            </div>

            {/* 描述文案 */}
            <div className="space-y-4 mb-6 md:mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
              <p className="text-[#E0E0E0] text-lg md:text-2xl font-light tracking-widest drop-shadow-md">
                迹为镜，<span className="font-medium text-white">向为航。</span>
              </p>
              <p className="text-[#A0A0A0] text-sm md:text-base tracking-wide drop-shadow-md max-w-lg leading-relaxed">
                存档人生履迹，指引向上航向。
              </p>
            </div>
          </div>
        </div>

        {/* 轮播控制台 (图1样式) */}
        <div className="absolute bottom-4 md:bottom-6 right-6 md:right-16 z-30 flex items-center gap-3 bg-[#12161A]/90 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-3">
            {treeData.map((node) => {
              const isActive = activeCategoryId === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => handleCategoryClick(node.id)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive ? "bg-[#e50914] scale-125 shadow-[0_0_8px_rgba(229,9,20,0.8)]" : "bg-gray-500 hover:bg-gray-300"}`}
                />
              );
            })}
          </div>
          <div className="w-px h-5 bg-white/20 mx-1" />
          <button 
            onClick={() => setIsCarouselPaused(!isCarouselPaused)}
            className="text-gray-400 hover:text-white transition-colors flex items-center justify-center"
          >
            {isCarouselPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
          </button>
        </div>
      </div>
      
      {/* 顶部：完全固定自适应的水平树状导航 (Level 1, 2, 3) */}
      <div className="w-full relative z-20 mt-2 md:mt-4 pb-8 md:pb-12">
        <div className="w-full flex flex-col items-center px-1 sm:px-4 md:px-6">
          
          {/* Root 节点 */}
          <div className="px-6 py-2.5 md:px-8 md:py-3 rounded-2xl border border-[#fbbf24]/40 bg-gradient-to-b from-[#fbbf24]/10 to-transparent text-[#fbbf24] flex items-center gap-2 md:gap-3 font-black z-20 shadow-[0_0_30px_rgba(251,191,36,0.15)] backdrop-blur-md cursor-default">
            <Star className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-lg tracking-[0.2em]">个人成长</span>
          </div>
          
          {/* 向下延伸到二级分类的中心连线 */}
          <div className="w-px h-6 md:h-8 bg-white/10" />
          
          {/* 二三级分类统一的居中容器 */}
          <div className="flex flex-col items-center w-full relative z-10 md:w-[900px] lg:w-[1000px]">
            
            {/* 二级分类分支 (Level 2) - 固定间距分布，等分屏幕空间 */}
            <div className="flex relative w-full justify-between z-10">
              {treeData.map((node, i, arr) => {
                const isActive = activeCategoryId === node.id;
                const isFirst = i === 0;
                const isLast = i === arr.length - 1;
                const shortLabel = node.label.split('(')[0].trim();
                
                return (
                  <div key={node.id} className="flex flex-col items-center relative flex-1">
                    {/* 二级分类的水平连线段 */}
                    {!isFirst && <div className="absolute top-0 left-0 w-1/2 h-px bg-white/10" />}
                    {!isLast && <div className="absolute top-0 right-0 w-1/2 h-px bg-white/10" />}
                    
                    {/* 连接到二级按钮的垂直连线 */}
                    <div className="w-px h-4 md:h-6 bg-white/10" />
                    
                    {/* 二级分类按钮：在移动端深度压缩 Padding 和字号 */}
                    <button 
                      onClick={() => handleCategoryClick(node.id)}
                      className={`mt-1 md:mt-2 px-2 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2.5 rounded-2xl border flex items-center gap-1.5 md:gap-2 transition-all duration-300 z-20
                        ${isActive ? "scale-105 md:scale-110 shadow-xl" : "bg-black/20 border-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:scale-105"}`}
                      style={isActive ? { 
                        backgroundColor: node.color + "15",
                        borderColor: node.color + "50",
                        color: node.color,
                        boxShadow: `0 0 25px ${node.color}25`
                      } : {}}
                    >
                      {node.icon && React.cloneElement(node.icon as React.ReactElement, { className: "w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" })}
                      <span className="font-bold text-[10px] sm:text-[12px] md:text-sm tracking-wide whitespace-nowrap">{shortLabel}</span>
                    </button>

                    {/* 向下延伸的主干连线 (仅激活状态呈现) */}
                    {isActive && node.children && node.children.length > 0 && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-4 md:h-6 z-20" style={{ backgroundColor: node.color, opacity: 0.5 }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* 第三级分类分支 (独立居中面板容器) */}
            {activeNode && activeNode.children && activeNode.children.length > 0 && (
              <div className="w-full relative flex flex-col items-center mt-4 md:mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                
                {/* 动态路由水平线：计算百分比完美接合二级连线与中心点 */}
                {(() => {
                  const activeIndex = treeData.findIndex(n => n.id === activeCategoryId);
                  const activePercent = 12.5 + activeIndex * 25; 
                  return (
                    <div 
                      className="absolute top-0 h-px z-10"
                      style={{
                        left: activeIndex < 2 ? `${activePercent}%` : '50%',
                        right: activeIndex >= 2 ? `${100 - activePercent}%` : '50%',
                        backgroundColor: activeNode.color,
                        opacity: 0.5
                      }}
                    />
                  );
                })()}

                {/* 接入面板的中心垂线 */}
                <div className="w-px h-4 md:h-6 z-10" style={{ backgroundColor: activeNode.color, opacity: 0.5 }} />

                {/* 三级分类面板 (玻璃拟态背景框，消除杂乱线条) */}
                <div className="flex relative justify-center w-[95%] sm:w-max max-w-full flex-wrap gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-20">
                  {activeNode.children.map((subNode) => {
                    const isSubActive = activeSubCategoryId === subNode.id;
                    const cleanLabel = subNode.label.trim();
                    
                    return (
                      <button 
                        key={subNode.id}
                        onClick={(e) => { e.stopPropagation(); setActiveSubCategoryId(subNode.id); }}
                        className={`px-4 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 rounded-full text-[11px] sm:text-[12px] md:text-sm font-bold tracking-wide transition-all duration-300 border
                          ${isSubActive 
                            ? "scale-105" 
                            : "bg-black/20 border-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20"}`}
                        style={isSubActive ? {
                          backgroundColor: `${activeNode.color}15`,
                          borderColor: `${activeNode.color}40`,
                          color: activeNode.color,
                          boxShadow: `0 0 20px ${activeNode.color}20`
                        } : {}}
                      >
                        {cleanLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 下方：选中第二级分类的嵌套卡片树 (直接展示第三级内容) */}
      <div className="w-full max-w-5xl mx-auto mt-0 relative pb-8 px-2 sm:px-4 flex flex-col items-center">
        {activeSubNode && activeSubNode.children && activeSubNode.children.length > 0 && (
          <>
            {/* 连接上方二级胶囊面板的连线 */}
            <div className="w-px h-6 md:h-10 opacity-50" style={{ backgroundColor: activeNode?.color || '#fbbf24' }} />
            
            <div className="w-full sm:w-fit max-w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl p-3 sm:p-5 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex justify-center mx-auto relative z-10">
               <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-items-center justify-center gap-2.5 sm:gap-5 md:gap-8 w-full sm:w-auto">
                  {activeSubNode.children.map((child) => {
                    const l1Name = activeNode?.label.split('(')[0].trim();
                    const l2Name = activeSubNode?.label.split('(')[0].trim();
                    const l3Name = child.label.trim();
                    const fullTag = `${l1Name} / ${l2Name} / ${l3Name}`;
                    return (
                      <OrgNode 
                        key={child.id} 
                        node={child} 
                        isRoot={true} 
                        onClick={() => onCategorySelect && onCategorySelect(fullTag)}
                      />
                    );
                  })}
               </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
