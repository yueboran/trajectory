import React from "react";

export default function JumpGridSection() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col items-center select-none">
      
      {/* Title Area */}
      <div className="text-center mb-10 md:mb-16">
        <h2 className="font-display font-black text-4xl md:text-5xl text-white mb-4 drop-shadow-md">
          立即 <span className="text-gray-300">加入体验</span>
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          数智灵境是您进行构思和创新的官方数字工具集。
        </p>
      </div>

      {/* Grid Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        
        {/* Large Left Card */}
        <div className="group relative w-full lg:col-span-2 h-[400px] lg:h-[600px] rounded-xl overflow-hidden cursor-pointer">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: 'url(/images/home/jump_grid_large.png)' }}
          />
          {/* Gradient overlay to make text readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
          
          <div className="absolute bottom-0 left-0 p-8 w-full">
            <h3 className="font-display font-black text-3xl md:text-5xl text-white mb-2 tracking-tight drop-shadow-md">
              我的灵感
            </h3>
            <p className="text-gray-300 text-sm md:text-base drop-shadow-sm max-w-md">
              使用我们的数字构思构建器，在几秒钟内创建您的概念。
            </p>
          </div>
        </div>

        {/* Right Smaller Cards Stack */}
        <div className="flex flex-col gap-4 lg:gap-6 h-full">
          
          {/* Top Right Card */}
          <div className="group relative w-full flex-1 min-h-[250px] lg:min-h-0 rounded-xl overflow-hidden cursor-pointer">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: 'url(/images/home/jump_grid_small_top.png)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
            
            <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
              <h3 className="font-display font-black text-2xl md:text-3xl text-white mb-2 tracking-tight drop-shadow-md">
                我的活动
              </h3>
              <p className="text-gray-300 text-xs md:text-sm drop-shadow-sm">
                将您的所有成员聚集在一处，记录灵感，共同创新。
              </p>
            </div>
          </div>

          {/* Bottom Right Card */}
          <div className="group relative w-full flex-1 min-h-[250px] lg:min-h-0 rounded-xl overflow-hidden cursor-pointer">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: 'url(/images/home/jump_grid_small_bottom.png)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
            
            <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
              <h3 className="font-display font-black text-2xl md:text-3xl text-white mb-2 tracking-tight drop-shadow-md">
                星图虚拟桌面
              </h3>
              <p className="text-gray-300 text-xs md:text-sm drop-shadow-sm">
                在我们的官方虚拟桌面中，通过快速模板、协作工具等，减少准备时间，享受更多乐趣。
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
