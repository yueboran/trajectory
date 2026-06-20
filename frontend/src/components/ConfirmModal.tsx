import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger" | "warning";
}

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "保存草稿",
  cancelText = "不保存",
  variant = "primary"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const confirmBtnStyles = {
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]",
    primary: "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-amber-500/30",
    warning: "bg-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 模糊遮罩层：禁止点击背景关闭以防误触 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onCancel}></div>
      
      {/* 弹窗主体 */}
      <div className="relative bg-[#1a1b1e] border border-white/10 rounded-2xl p-6 shadow-2xl w-full max-w-sm flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-[#A0A0A0] text-[14px] text-center mb-6 leading-relaxed">{message}</p>
        
        <div className="flex w-full gap-3 mt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#A0A0A0] hover:text-white bg-[#232429] hover:bg-[#2A2A30] transition-colors border border-white/5"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${confirmBtnStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
