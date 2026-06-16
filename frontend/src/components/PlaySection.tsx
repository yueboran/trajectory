import React from "react";
import { ArrowRight, Zap, Target, Layout } from "lucide-react";

export default function PlaySection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-20 flex flex-col items-center select-none">
      
      {/* Title Area */}
      <div className="text-center mb-16">
        <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-4 drop-shadow-md">
          畅玩 <span className="font-serif">数智灵境</span>
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          使用我们的数字构思工具套件，开始构建未来，旨在让您沉浸在面对面和在线的协作头脑风暴中。
        </p>
      </div>

      {/* Split Content Area */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        {/* Left: Text & CTA */}
        <div className="flex flex-col gap-6 w-full max-w-lg mx-auto lg:mx-0">
          
          {/* Faux Tabs */}
          <div className="flex items-center gap-6 border-b border-white/10 pb-2 mb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider cursor-pointer border-b-2 border-white pb-2 -mb-[10px]">
              灵感构建器
            </span>
            <span className="text-xs font-bold text-gray-500 hover:text-gray-300 uppercase tracking-wider cursor-pointer transition-colors">
              思维导图
            </span>
            <span className="text-xs font-bold text-gray-500 hover:text-gray-300 uppercase tracking-wider cursor-pointer transition-colors">
              操作指南
            </span>
          </div>

          <h3 className="font-display font-black text-4xl text-white leading-[1.2] drop-shadow-md">
            构建任何<br />你能想象的概念
          </h3>

          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            在创新中，唯一的限制是你的想象力。借助我们的数字灵感构建器和架构表，你可以：
          </p>

          <ul className="flex flex-col gap-4 mt-2 mb-4">
            <li className="flex items-center gap-3 text-sm text-gray-300">
              <Zap className="w-5 h-5 text-gray-400 shrink-0" />
              在几秒钟内构建一个创业概念
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-300">
              <Layout className="w-5 h-5 text-gray-400 shrink-0" />
              从预制或自定义模板中选择
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-300">
              <Target className="w-5 h-5 text-gray-400 shrink-0" />
              支持手机和平板，随时随地协作
            </li>
          </ul>

          <button className="bg-white hover:bg-gray-100 text-black px-6 py-3.5 rounded-sm font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-colors shadow-lg max-w-[280px]">
            <span>构建概念</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Overlapping Images */}
        <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] flex items-center justify-center">
          
          {/* Background Card 1 (Far back) */}
          <div className="absolute right-[10%] top-[10%] w-[50%] h-[70%] border border-amber-600/30 rounded-md bg-gradient-to-b from-[#1a1412] to-black opacity-60 transform rotate-6 shadow-2xl hidden sm:block" />
          
          {/* Background Card 2 (Middle) */}
          <div 
            className="absolute left-[5%] top-[15%] w-[60%] h-[75%] rounded-md bg-cover bg-center border-2 border-[#d0bcff]/20 shadow-2xl transform -rotate-3"
            style={{ backgroundImage: 'url(/images/home/play_feature_1.png)' }}
          />

          {/* Foreground Device Simulation */}
          <div className="absolute right-[5%] bottom-[5%] w-[55%] h-[85%] bg-[#1c212a] border-[6px] border-[#2a303c] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col z-10">
            {/* Fake phone notch */}
            <div className="w-1/3 h-4 bg-[#2a303c] mx-auto rounded-b-xl" />
            
            <div className="p-4 flex-1 flex flex-col overflow-y-auto hide-scrollbar">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-700" />
                <div>
                  <div className="text-white text-xs font-bold">Project Neo</div>
                  <div className="text-gray-400 text-[10px]">Level 3 Architecture</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
                    <div className="text-[9px] text-gray-400 uppercase">Stat {i}</div>
                    <div className="text-white font-bold text-lg">+{(i * 3) % 5}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
