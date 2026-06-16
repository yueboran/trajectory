import React from "react";
import { ArrowLeft, User, Apple, Chrome, Twitch, Heart, HelpCircle, Mail, MessageSquare, Twitter, Youtube, Instagram, Facebook } from "lucide-react";

interface AuthPageProps {
  onBack: () => void;
}

export default function AuthPage({ onBack }: AuthPageProps) {
  return (
    <div className="absolute inset-0 z-50 flex bg-white animate-fade-in h-[100dvh] w-full overflow-hidden">
      {/* Left Panel: Hero Image (Hidden on mobile) */}
      <div 
        className="hidden lg:block lg:w-[45%] h-full bg-cover bg-center relative"
        style={{ backgroundImage: 'url(/images/auth/auth_split_banner.png)' }}
      >
        {/* Optional inner overlay if needed to darken */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        
        {/* Floating Back Button on Image */}
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Right Panel: Auth Form */}
      <div className="w-full lg:w-[55%] h-full flex flex-col relative overflow-y-auto bg-white">
        
        {/* Mobile Back Button */}
        <button 
          onClick={onBack}
          className="lg:hidden absolute top-4 left-4 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-16 py-12">
          
          {/* Logo (Mocking the D&D Beyond Header Logo) */}
          <div className="mb-12 flex flex-col items-center">
            <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tighter text-gray-900 mb-1">
              <span className="text-[#e50914]">灵感</span>星图
            </h1>
            <div className="h-1 w-full bg-[#e50914]" />
          </div>

          <div className="w-full max-w-[340px]">
            <h2 className="text-xl font-bold text-gray-900 mb-6 font-sans">Sign In</h2>
            
            <div className="space-y-4">
              {/* Wizards Login (Mocked as Primary/Custom) */}
              <button className="w-full flex items-center h-[52px] bg-[#6149D2] hover:bg-[#503bb3] text-white transition-colors relative shadow-sm border border-[#6149D2]">
                <div className="w-[52px] h-full flex items-center justify-center bg-white border-r border-[#6149D2]">
                  {/* Wizards 'W' mock icon */}
                  <span className="font-serif font-bold text-[#6149D2] text-2xl leading-none pt-1">W</span>
                </div>
                <span className="flex-1 text-center font-semibold text-[15px] pr-8">Sign in with Wizards</span>
              </button>

              {/* Divider */}
              <div className="flex items-center justify-center py-2">
                <div className="w-8 h-[1px] bg-gray-300" />
              </div>

              {/* Apple Login */}
              <button className="w-full flex items-center h-[52px] bg-black hover:bg-gray-900 text-white transition-colors relative shadow-sm border border-black">
                <div className="w-[52px] h-full flex items-center justify-center bg-white border-r border-black text-black">
                  <Apple className="w-6 h-6 fill-current" />
                </div>
                <span className="flex-1 text-center font-semibold text-[15px] pr-8">Sign in with Apple</span>
              </button>

              {/* Google Login */}
              <button className="w-full flex items-center h-[52px] bg-[#4285F4] hover:bg-[#3367d6] text-white transition-colors relative shadow-sm border border-[#4285F4]">
                <div className="w-[52px] h-full flex items-center justify-center bg-white border-r border-[#4285F4] text-[#4285F4]">
                  <Chrome className="w-6 h-6" />
                </div>
                <span className="flex-1 text-center font-semibold text-[15px] pr-8">Sign in with Google</span>
              </button>

              {/* Twitch Login */}
              <button className="w-full flex items-center h-[52px] bg-[#9146FF] hover:bg-[#772ce8] text-white transition-colors relative shadow-sm border border-[#9146FF]">
                <div className="w-[52px] h-full flex items-center justify-center bg-white border-r border-[#9146FF] text-[#9146FF]">
                  <Twitch className="w-6 h-6" />
                </div>
                <span className="flex-1 text-center font-semibold text-[15px] pr-8">Sign in with Twitch</span>
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-[13px] font-semibold text-gray-900">
                New to 灵感星图?{" "}
                <a href="#" className="text-[#3a86ff] hover:underline">
                  Sign Up
                </a>
              </p>
            </div>

            {/* Social Icons row */}
            <div className="mt-10 flex items-center justify-center gap-5 text-gray-400">
              <MessageSquare className="w-[18px] h-[18px] hover:text-gray-600 cursor-pointer transition-colors" />
              <Instagram className="w-[18px] h-[18px] hover:text-gray-600 cursor-pointer transition-colors" />
              <Facebook className="w-[18px] h-[18px] hover:text-gray-600 cursor-pointer transition-colors" />
              <Twitter className="w-[18px] h-[18px] hover:text-gray-600 cursor-pointer transition-colors" />
              <Youtube className="w-[18px] h-[18px] hover:text-gray-600 cursor-pointer transition-colors" />
              <Twitch className="w-[18px] h-[18px] hover:text-gray-600 cursor-pointer transition-colors" />
            </div>

            <div className="mt-12 text-center text-[11px] font-semibold text-gray-900">
              Please <a href="#" className="text-[#3a86ff] hover:underline">contact our support team</a> if you're experiencing account issues.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
