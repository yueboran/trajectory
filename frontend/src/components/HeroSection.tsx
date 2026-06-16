import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Play, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onBrowseProjects: () => void;
  onSubmitIdea: () => void;
}

const TABS = ["金融科技", "医疗健康", "创意与设计", "数智灵境 V1.0"];

export default function HeroSection({
  onBrowseProjects,
  onSubmitIdea,
}: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(3); // 默认停留在第4个Tab(数智灵境)

  return (
    <section className="relative w-full h-[500px] md:h-[600px] flex flex-col select-none overflow-hidden bg-black group">
      
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
        style={{ backgroundImage: 'url(/images/banners/hero_carousel_banner.png)' }}
      />
      
      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex items-center px-6 md:px-20 pt-10 md:pt-0">
        <div className="max-w-xl">
          
          {/* Main Title/Logo Simulation */}
          <div className="mb-4 md:mb-6">
            <h1 className="font-display text-4xl md:text-7xl font-black text-white tracking-tighter mb-1 md:mb-2 drop-shadow-lg">
              <span className="text-[#e50914]">灵感</span>星图
            </h1>
            <p className="font-mono text-[11px] md:text-base text-gray-300 tracking-[0.2em] uppercase font-bold">
              The Official Idea VTT
            </p>
          </div>

          {/* Subtitle Badge Row */}
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div className="bg-[#e50914] text-white text-[9px] md:text-[10px] font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-sm tracking-wider uppercase">
              HOT
            </div>
            <h3 className="text-white font-bold text-sm md:text-lg italic tracking-wide drop-shadow-md">
              数智灵境 全新上线
            </h3>
          </div>

          {/* Description */}
          <p className="text-gray-200 text-xs md:text-base leading-relaxed md:leading-relaxed mb-6 md:mb-8 max-w-lg drop-shadow-md">
            AI 不只是大厂的专利，它属于各行各业的每一个人。不懂代码没关系，只要你懂生活、懂业务，你就是下一个 AI 创新的发起人。在这里，分享你的日常痛点，让技术为你打工。
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <button 
              onClick={onBrowseProjects}
              className="bg-[#e50914] hover:bg-[#f40612] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-md font-bold text-xs md:text-sm tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(229,9,20,0.4)]"
            >
              探索灵境 <ArrowRight className="w-4 h-4" />
            </button>

            <button 
              onClick={onSubmitIdea}
              className="flex items-center gap-2 text-white font-bold text-xs md:text-sm hover:text-gray-300 transition-colors group/watch drop-shadow-md"
            >
              分享灵感 <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover/watch:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Navigation Arrows (Hidden on mobile to avoid overlapping text) */}
      <button className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-black/40 hover:bg-black/70 text-white rounded-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-black/40 hover:bg-black/70 text-white rounded-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Bottom Tabs Indicator */}
      <div className="absolute bottom-0 left-0 w-full z-20 px-4 md:px-20">
        <div className="flex items-end justify-start gap-1 md:gap-4 overflow-x-auto hide-scrollbar border-b border-white/10 scroll-smooth">
          {TABS.map((tab, idx) => {
            const isActive = activeSlide === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`relative px-4 py-4 text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                  isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab}
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#e50914] shadow-[0_0_10px_#e50914]" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Decorative Play/Pause indicator similar to D&D Maps */}
        <div className="absolute bottom-4 right-8 md:right-20 hidden md:flex items-center justify-center w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-sm cursor-pointer transition-colors">
           <div className="w-1.5 h-3 border-l-2 border-r-2 border-white/80" />
        </div>
      </div>
    </section>
  );
}
