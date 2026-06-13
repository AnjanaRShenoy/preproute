"use client";

import React, { useState, useEffect, useRef } from 'react';
import { LogOut, ChevronDown, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    testType?: string;
}

export default function Header({ testType = "Overview" }: HeaderProps) {
    const router = useRouter();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // 👑 FEATURE: Clear authentication credentials and route back to login anchor
    const handleLogout = () => {
        // Clear the token cookie by setting its expiration date to the past
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure";
        
        // Clear any local cache states if necessary
        console.log("Session terminated successfully.");
        
        // Force routing back onto your login view
        router.push("/login");
        router.refresh();
    };

    // 👑 INTERACTION: Close the profile menu if user clicks anywhere outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        if (isProfileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileMenuOpen]);

    return (
        <header className="bg-white border-b border-slate-100 h-16 w-full flex items-center justify-between px-6 md:px-8 relative z-30">
            {/* Left Section: Context Title Indicator */}
            <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-800 capitalize tracking-tight hidden sm:inline-block">
                    {testType === "chapterwise" ? "Chapter Wise" : testType}
                </span>
            </div>

            {/* Right Section: User Identity Profile Controls */}
            <div className="flex items-center gap-4 ml-auto">
                
                {/* 👑 DROPDOWN ANCHOR CONTAINER */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded-xl transition cursor-pointer select-none focus:outline-none"
                    >
                        {/* Avatar Image */}
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden relative border border-slate-200">
                            {/* Falling back to standard icon if source changes */}
                            <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Name & Role Text metadata */}
                        <div className="hidden sm:flex flex-col text-left">
                            <span className="text-xs font-bold text-slate-700 leading-tight">Alex Wando</span>
                            <span className="text-[10px] text-slate-400 font-medium">Admin</span>
                        </div>

                        <ChevronDown 
                            size={14} 
                            className={`text-slate-400 transition-transform duration-200 hidden sm:block ${isProfileMenuOpen ? 'rotate-180' : ''}`} 
                        />
                    </button>

                    {/* 👑 DROPDOWN FLOATING CARD OPTION LAYER */}
                    {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200/80 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                            {/* Decorative Mobile Header */}
                            <div className="sm:hidden px-4 py-2 border-b border-slate-100 mb-1">
                                <p className="text-xs font-bold text-slate-700">Alex Wando</p>
                                <p className="text-[10px] text-slate-400">Admin</p>
                            </div>

                            {/* Optional Profile Option Link */}
                            <button 
                                onClick={() => {
                                    setIsProfileMenuOpen(false);
                                    router.push("/profile");
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition text-left"
                            >
                                <User size={14} className="text-slate-400" />
                                <span>My Profile</span>
                            </button>

                            {/* Horizontal Break Separator */}
                            <div className="h-px bg-slate-100 my-1" />

                            {/* Logout Operational Toggle Button */}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50/50 transition text-left"
                            >
                                <LogOut size={14} className="text-red-500" />
                                <span>Logout Session</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}