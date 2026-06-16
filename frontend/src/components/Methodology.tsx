/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Users, DollarSign, Target, Cpu, Globe, Rocket, Compass, BookOpen } from "lucide-react";

interface MethodologyProps {
  onGoToSubmit: () => void;
  selectedDefaultDimension?: string;
}

export default function Methodology({ onGoToSubmit, selectedDefaultDimension }: MethodologyProps) {
  const dimensions = [
    {
      id: "concept",
      icon: Cpu,
      color: "text-[#d0bcff] bg-[#d0bcff]/10 border-[#d0bcff]/20",
      pillBorder: "border-[#d0bcff]/30 text-[#d0bcff] bg-[#d0bcff]/10",
      title: "核心概念",
      desc: "评估项目的核心创意是否清晰、有力、可执行。一个好的核心概念应当一句话讲清楚'为什么这件事值得做'，并具备区别于现有方案的独特视角。",
      chips: ["价值主张", "痛点匹配度", "创意独特性"]
    },
    {
      id: "research",
      icon: Target,
      color: "text-[#4cd7f6] bg-[#4cd7f6]/10 border-[#4cd7f6]/20",
      pillBorder: "border-[#4cd7f6]/30 text-[#4cd7f6] bg-[#4cd7f6]/10",
      title: "深度调研",
      desc: "考察项目是否进行了充分的市场调研、竞品分析和用户访谈。数据的深度和广度直接决定了方案的可靠性与说服力。",
      chips: ["市场规模", "竞品分析", "用户验证"]
    },
    {
      id: "planning",
      icon: DollarSign,
      color: "text-[#fbabff] bg-[#fbabff]/10 border-[#fbabff]/20",
      pillBorder: "border-[#fbabff]/30 text-[#fbabff] bg-[#fbabff]/10",
      title: "方案规划",
      desc: "衡量项目是否拥有清晰的技术架构设计、可落地的里程碑规划和资源配置方案。规划的完整性和可行性是项目能否从概念走向现实的关键。",
      chips: ["架构设计", "里程碑规划", "资源配置"]
    },
    {
      id: "extension",
      icon: Globe,
      color: "text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/20",
      pillBorder: "border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/10",
      title: "拓展与延伸",
      desc: "评估项目是否有足够的成长空间和延伸可能，包括横向拓展的应用场景、纵向深挖的技术迭代方向以及生态合作的想象力。",
      chips: ["场景延伸", "技术迭代", "生态合作"]
    },
    {
      id: "evaluation",
      icon: Users,
      color: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20",
      pillBorder: "border-[#f59e0b]/30 text-[#f59e0b] bg-[#f59e0b]/10",
      title: "价值与评估",
      desc: "综合评估项目的社会价值、商业潜力和可持续性。一个真正有价值的项目应当在创造商业收益的同时，也为社会带来正向影响。",
      chips: ["商业潜力", "社会影响", "可持续性"]
    }
  ];

  return (
    <section className="flex flex-col gap-8 pb-32 animate-fade-in px-4 max-w-4xl mx-auto w-full">
      {/* Page Hero */}
      <div className="mt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#d0bcff]/20 bg-[#d0bcff]/10 font-mono text-[10px] text-[#d0bcff] mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          <span>评估体系</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-[#dae2fd] tracking-tight sm:text-3xl">
          如何定义 AI 项目的价值？
        </h2>
        <p className="font-sans text-xs text-[#cbc3d7] mt-3 leading-relaxed">
          在数智灵境，我们摒弃传统的单一商业财报考核体系，首创多维度的「星系评估模型」。从五个核心引力场对 AI 创新进行全面拆解与量化，发掘项目真正的技术深度与持久生命力。
        </p>
      </div>

      {/* Dimensions detailed List */}
      <div className="flex flex-col gap-4">
        {dimensions.map((dim) => {
          const isSelectedDefault = selectedDefaultDimension === dim.id;
          const IconComp = dim.icon;

          return (
            <div
              key={dim.id}
              className={`bg-[#171f33]/40 border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${
                isSelectedDefault
                  ? "border-[#d0bcff] shadow-[0_0_20px_rgba(208,188,255,0.15)] bg-[#171f33]/70 scale-[1.01]"
                  : "border-white/5"
              }`}
            >
              <div className="relative z-10 flex flex-col md:flex-row gap-4 items-start">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border ${dim.color} shadow-lg`}>
                  <IconComp className="w-5 h-5 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-semibold text-[#dae2fd] mb-1.5">
                    {dim.title}
                  </h3>
                  <p className="font-sans text-xs text-[#cbc3d7]/90 leading-relaxed mb-4">
                    {dim.desc}
                  </p>

                  {/* Innovation chips */}
                  <div className="flex flex-wrap gap-2">
                    {dim.chips.map((chip, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono border ${dim.pillBorder}`}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Radial score gauge visual block */}
      <div className="bg-[#222a3d]/50 backdrop-blur-2xl border border-[#4cd7f6]/20 rounded-2xl p-6 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-[#4cd7f6]/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#d0bcff]/10 rounded-full blur-[60px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="text-center sm:text-left">
            <h3 className="font-display text-base font-bold text-[#dae2fd] mb-2">
              光谱评分机制
            </h3>
            <p className="font-sans text-xs text-[#cbc3d7] max-w-sm leading-relaxed">
              系统将上述五大核心维度通过精密的加权矢量算法，输出一份象征其发展成熟度、爆发势能的「星图价值光谱」与统一数值评分。高分代表项目具备卓越的投资想象权并已跑通可闭环。
            </p>
          </div>

          {/* Sizable Radial scoring ring matches screenshot exactly */}
          <div className="shrink-0 flex items-center justify-center w-28 h-28 rounded-full bg-[#060e20] border border-white/10 relative shadow-[0_0_25px_rgba(76,215,246,0.15)]">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                className="text-slate-900"
                cx="56"
                cy="56"
                fill="transparent"
                r="50"
                stroke="currentColor"
                strokeWidth="5"
              />
              <circle
                cx="56"
                cy="56"
                fill="transparent"
                r="50"
                stroke="url(#aurora-grad)"
                strokeDasharray="314"
                strokeDashoffset="60" // represents 8.5/10 index percentage correctly
                strokeLinecap="round"
                strokeWidth="5"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="aurora-grad" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#4cd7f6" />
                  <stop offset="100%" stopColor="#d0bcff" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col items-center justify-center z-10 select-none">
              <span className="font-display text-2xl font-bold bg-gradient-to-r from-[#4cd7f6] to-[#d0bcff] bg-clip-text text-transparent leading-none">
                8.5
              </span>
              <span className="font-mono text-[8px] text-[#cbc3d7]/85 mt-1 tracking-widest font-semibold">
                综合评分
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action launch buttons */}
      <div className="text-center py-6 border-t border-white/5 flex flex-col items-center select-none">
        <h4 className="font-display text-base font-bold text-[#dae2fd] mb-4">
          准备好测算你的星系能量了吗？
        </h4>
        <button
          onClick={onGoToSubmit}
          className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] text-slate-950 font-display font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_20px_rgba(208,188,255,0.4)] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 duration-2 * mt-2"
        >
          去尝试评估
          <Rocket className="w-4 h-4 fill-slate-950 text-slate-950" />
        </button>
      </div>
    </section>
  );
}
