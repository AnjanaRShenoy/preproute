"use client";

import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';

interface HeaderProps {
  testType?: string;
}

export default function Header({ testType = "Chapter Wise" }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 w-full">
      
      {/* 👑 THE FIX: Empty placeholder forces the next flex group to the far right end */}
      <div></div> 
      
      {/* Action Controls & Profile info */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full border border-slate-100">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
        </button>
        
        {/* User Profile Info Card */}
        <div className="flex items-center gap-3 cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"
            alt="Alex Wando"
            className="w-10 h-10 rounded-full border border-slate-100 object-cover"
          />
          <div>
            <div className="font-semibold text-sm text-slate-800 flex items-center gap-1">
              Alex Wando <ChevronDown size={14} className="text-slate-400" />
            </div>
            <div className="text-xs text-slate-400">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}