/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Lightbulb, Search, ClipboardList, Expand, BarChart3 } from "lucide-react";

export default function BentoGrid() {
  return (
    <section className="flex flex-col gap-4 px-4 select-none max-w-4xl mx-auto w-full">
      {/* 分隔标题 */}
      <h3 className="font-mono text-[10px] text-[#cbc3d7]/65 tracking-[0.1em] uppercase flex items-center gap-3 before:content-[''] before:h-px before:flex-grow before:bg-white/10 after:content-[''] after:h-px after:flex-grow after:bg-white/10">
        5 核心评估维度
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 核心概念 - 全宽 */}
        <div
          className="col-span-2 lg:col-span-4 glass-card rounded-2xl p-5 shimmer-border flex flex-col gap-4 group hover:bg-[#171f33]/40 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="p-2 bg-[#d0bcff]/10 border border-[#d0bcff]/20 rounded-xl">
              <Lightbulb className="w-6 h-6 text-[#d0bcff] group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-[#4cd7f6] to-[#d0bcff] bg-clip-text text-transparent">
              92
            </span>
          </div>

          <div>
            <h4 className="font-display text-base font-bold text-[#dae2fd]">核心概念</h4>
            <p className="font-sans text-xs text-[#cbc3d7] mt-1">定义核心创意，明确价值主张与独特视角</p>
          </div>

          {/* 进度条 */}
          <div className="w-full h-1.5 bg-[#2d3449]/70 rounded-full overflow-hidden mt-1 relative">
            <div
              className="h-full bg-gradient-to-r from-[#4cd7f6] via-[#d0bcff] to-[#fbabff] rounded-full shadow-[0_0_8px_rgba(208,188,255,0.6)]"
              style={{ width: "92%" }}
            />
          </div>
        </div>

        {/* 深度调研 */}
        <div
          className="glass-card rounded-2xl p-4.5 flex flex-col justify-between gap-4 hover:bg-[#171f33]/40 transition-all"
        >
          <div className="p-2 bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 rounded-xl w-10 h-10 flex items-center justify-center">
            <Search className="w-5 h-5 text-[#4cd7f6]" />
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-[#dae2fd] leading-tight">深度调研</h4>
            <p className="font-sans text-[10px] text-[#cbc3d7]/70 mt-1">市场验证，竞品分析，用户访谈</p>
          </div>

          <div className="w-full h-1 bg-[#2d3449]/70 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#4cd7f6] to-[#d0bcff] w-[75%] opacity-90" />
          </div>
        </div>

        {/* 方案规划 */}
        <div
          className="glass-card rounded-2xl p-4.5 flex flex-col justify-between gap-4 hover:bg-[#171f33]/40 transition-all"
        >
          <div className="p-2 bg-[#fbabff]/10 border border-[#fbabff]/20 rounded-xl w-10 h-10 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-[#fbabff]" />
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-[#dae2fd] leading-tight">方案规划</h4>
            <p className="font-sans text-[10px] text-[#cbc3d7]/70 mt-1">架构设计，里程碑与资源配置</p>
          </div>

          <div className="w-full h-1 bg-[#2d3449]/70 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#fbabff] to-[#d0bcff] w-[85%] opacity-90" />
          </div>
        </div>

        {/* 拓展与延伸 */}
        <div
          className="glass-card rounded-2xl p-4.5 flex flex-col justify-between gap-4 hover:bg-[#171f33]/40 transition-all"
        >
          <div className="p-2 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-xl w-10 h-10 flex items-center justify-center">
            <Expand className="w-5 h-5 text-[#4ade80]" />
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-[#dae2fd] leading-tight">拓展与延伸</h4>
            <p className="font-sans text-[10px] text-[#cbc3d7]/70 mt-1">场景延伸，技术迭代，生态合作</p>
          </div>

          <div className="w-full h-1 bg-[#2d3449]/70 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#4ade80] to-[#d0bcff] w-[65%] opacity-90" />
          </div>
        </div>

        {/* 价值与评估 */}
        <div
          className="glass-card rounded-2xl p-4.5 flex flex-col justify-between gap-4 hover:bg-[#171f33]/40 transition-all"
        >
          <div className="p-2 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-xl w-10 h-10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#f59e0b]" />
          </div>

          <div>
            <h4 className="font-display text-sm font-bold text-[#dae2fd] leading-tight">价值与评估</h4>
            <p className="font-sans text-[10px] text-[#cbc3d7]/70 mt-1">商业潜力，社会影响，可持续性</p>
          </div>

          <div className="w-full h-1 bg-[#2d3449]/70 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#f59e0b] to-[#d0bcff] w-[60%] opacity-90" />
          </div>
        </div>
      </div>
    </section>
  );
}
