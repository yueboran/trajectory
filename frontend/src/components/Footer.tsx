import React, { useState } from "react";
import { MessageSquare, Mail, Phone, Users, X, CheckCircle2 } from "lucide-react";

export default function Footer() {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!feedbackName.trim() || !feedbackContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: feedbackName.trim(),
          content: feedbackContent.trim()
        })
      });
      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setShowFeedbackModal(false);
          setFeedbackName("");
          setFeedbackContent("");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="w-full bg-[#12161A] text-gray-400 border-t border-white/10 pt-6 pb-8 md:pb-6 relative z-10">
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
            <button 
              onClick={() => setShowContactModal(true)}
              className="text-[15px] md:text-[16px] font-bold text-white hover:text-[#fbbf24] transition-colors drop-shadow-sm flex items-center gap-1"
            >
              <Users className="w-4 h-4" />
              合作请联系作者
            </button>
            <button 
              onClick={() => setShowFeedbackModal(true)}
              className="text-[15px] md:text-[16px] font-bold text-white hover:text-[#4cd7f6] transition-colors drop-shadow-sm flex items-center gap-1"
            >
              <MessageSquare className="w-4 h-4" />
              问题反馈请留言
            </button>
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

      {/* 联系作者 Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowContactModal(false)} />
          <div className="bg-[#171f33] border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl relative z-10 max-w-sm w-full animate-fade-in text-center">
            <button 
              onClick={() => setShowContactModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 tracking-wider">联系作者</h2>
            
            <div className="space-y-4 text-left bg-black/30 p-5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3 text-[#dae2fd]">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span className="font-mono">vx：yueboran666</span>
              </div>
              <div className="w-full h-px bg-white/5" />
              <div className="flex items-center gap-3 text-[#dae2fd]">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="font-mono">邮箱：2689748728@qq.com</span>
              </div>
              <div className="w-full h-px bg-white/5" />
              <div className="flex items-center gap-3 text-[#dae2fd]">
                <Phone className="w-5 h-5 text-purple-400" />
                <span className="font-mono">手机号：18535130777</span>
              </div>
            </div>
            
            <button 
              onClick={() => setShowContactModal(false)}
              className="mt-6 w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 问题反馈 Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFeedbackModal(false)} />
          <div className="bg-[#171f33] border border-white/10 p-6 rounded-2xl shadow-2xl relative z-10 max-w-md w-full animate-fade-in">
            <h2 className="text-xl font-bold text-white mb-4 tracking-wider flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#4cd7f6]" />
              问题反馈请留言
            </h2>
            
            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                <p className="text-white font-bold">提交成功！感谢您的反馈。</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">您的称呼</label>
                  <input 
                    type="text" 
                    placeholder="请输入您的称呼或联系方式..."
                    value={feedbackName}
                    onChange={(e) => setFeedbackName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#4cd7f6]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">反馈内容</label>
                  <textarea 
                    placeholder="请详细描述您的问题、建议或想法..."
                    rows={4}
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#4cd7f6]/50 transition-colors resize-none"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowFeedbackModal(false)}
                    className="flex-1 py-2.5 rounded-full border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white font-bold transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleSubmitFeedback}
                    disabled={isSubmitting || !feedbackName.trim() || !feedbackContent.trim()}
                    className="flex-1 py-2.5 rounded-full bg-gradient-to-r from-[#4cd7f6] to-[#0a95ff] text-white font-bold shadow-lg hover:shadow-[#4cd7f6]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "提交中..." : "确认提交"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
