import React from "react";
import { MessageSquare, Instagram, Facebook, Twitter, Youtube, Twitch, X } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#12161A] text-gray-400 border-t border-white/10 pt-6 pb-8 md:pb-6">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center">
        
        {/* Main Footer Info */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mb-6 w-full justify-center">
          
          {/* Logo */}
          <h1 className="font-display text-2xl md:text-3xl font-black tracking-widest text-[#E0E0E0]">
            迹向
          </h1>

          {/* Vertical Divider (Desktop) */}
          <div className="hidden md:block w-px h-6 bg-white/10" />

          {/* About Links - Horizontal layout with prominent styling */}
          <div className="flex flex-row flex-wrap justify-center items-center gap-6 md:gap-8 mt-2 md:mt-0">
            <a href="#" className="text-[15px] md:text-[16px] font-bold text-white hover:text-[#fbbf24] transition-colors drop-shadow-sm">关于作者</a>
            <a href="#" className="text-[15px] md:text-[16px] font-bold text-white hover:text-[#fbbf24] transition-colors drop-shadow-sm">联系作者</a>
            <a href="#" className="text-[15px] md:text-[16px] font-bold text-white hover:text-[#fbbf24] transition-colors drop-shadow-sm">合作请留言</a>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="w-full border-t border-white/10 pt-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="text-xs text-gray-500 text-center md:text-left font-medium">
            © 2026 迹向 | 保留所有权利
          </div>
          
          <div className="flex items-center gap-6 text-xs font-medium text-gray-500">
            <a href="#" className="hover:text-white transition-colors">隐私政策</a>
            <a href="#" className="hover:text-white transition-colors">服务条款</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
