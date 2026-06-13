"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, Eye, Edit3, Trash2,
    FileText, CheckCircle, AlertCircle, Calendar,
    LayoutDashboard, FileEdit, BarChart2,
    ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';
import Header from './header';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface TestRecord {
    id: string;
    name: string;
    subject: string;
    topics: string[];
    status: 'draft' | 'live' | null | undefined;
    created_at: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [tests, setTests] = useState<TestRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'draft'>('all');
    const [isLoading, setIsLoading] = useState(true);
    
    // Mobile View Drawer Menu Toggle State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const getCookie = (name: string) => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
    };

    useEffect(() => {
        async function fetchAllTests() {
            try {
                const token = getCookie('token');
                setIsLoading(true);
                const response = await fetch('/api/tests', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const resData = await response.json();

                if (response.ok && (resData.status === 'success' || resData.success)) {
                    setTests(resData.data || []);
                }
            } catch (err) {
                console.error("Failed fetching test records matrix:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAllTests();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const filteredTests = tests.filter(test => {
        const matchesSearch = test.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            test.subject?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // --- PAGINATION MATHEMATICS ---
    const totalItems = filteredTests.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPaginatedItems = filteredTests.slice(indexOfFirstItem, indexOfLastItem);

    // KPI Counter Metrics
    const totalCount = tests.length;
    const liveCount = tests.filter(t => t.status === 'live').length;
    const draftCount = tests.filter(t => t.status === 'draft').length;

    return (
        <div className="flex h-screen w-screen bg-slate-50 text-slate-700 font-sans overflow-hidden relative">

            {/* MOBILE TOP BAR TOGGLE BUTTON */}
            <div className="md:hidden fixed top-4 left-4 z-30">
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 focus:outline-none"
                >
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* 1. SIDEBAR NAVIGATION CONTAINER (Responsive Layout) */}
            <aside className={`w-64 bg-white border-r border-slate-100 flex flex-col justify-between fixed h-full z-20 transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    <div className="p-6 flex items-center justify-between gap-2 border-b border-slate-50">
                        <div className="relative w-40 h-10 mb-9">
                            {/* 👑 LOGO RESTORED: Uses your correct working route path string */}
                            <Image
                                src="/prepRoute/logo.svg"
                                alt="PrepRoute Logo"
                                fill
                                priority
                                className="object-contain object-left"
                            />
                        </div>
                        <button className="md:hidden text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <nav className="mt-6 px-3 space-y-1">
                        <a href="/" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 font-semibold rounded-xl border-r-4 border-blue-600 transition">
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                        </a>
                        <a href="/create-test" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-800 font-medium rounded-xl transition">
                            <FileEdit size={18} />
                            <span>Test Creation</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-800 font-medium rounded-xl transition">
                            <BarChart2 size={18} />
                            <span>Test Tracking</span>
                        </a>
                    </nav>
                </div>
            </aside>

            {/* MOBILE DRAWER BLACKOUT OVERLAY FRAME */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-10 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* 2. MAIN HUB WORKSPACE WRAPPER */}
            <div className="flex-1 flex flex-col md:ml-64 h-full overflow-y-auto">
                <Header testType="Overview" />

                <main className="p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6 md:space-y-8 mt-12 md:mt-0">

                    {/* Header Action Row */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Test Inventory</h1>
                            <p className="text-xs text-slate-400 mt-1">Manage, update configurations, and inspect performance evaluation models.</p>
                        </div>
                        <a
                            href="/create-test"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition w-full sm:w-auto text-center"
                        >
                            <Plus size={16} />
                            <span>Create New Test</span>
                        </a>
                    </div>

                    {/* 3. PERFORMANCE STATS RESPONSIVE GRID MATRIX */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        <div className="bg-white border border-slate-100 p-5 md:p-6 rounded-xl shadow-2xs flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 block mb-1">Total Assessments</span>
                                <span className="text-xl md:text-2xl font-bold text-slate-800">{isLoading ? "..." : totalCount}</span>
                            </div>
                            <div className="p-3 bg-slate-50 text-slate-500 rounded-xl"><FileText size={20} /></div>
                        </div>

                        <div className="bg-white border border-slate-100 p-5 md:p-6 rounded-xl shadow-2xs flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 block mb-1">Live & Active</span>
                                <span className="text-xl md:text-2xl font-bold text-emerald-600">{isLoading ? "..." : liveCount}</span>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><CheckCircle size={20} /></div>
                        </div>

                        <div className="bg-white border border-slate-100 p-5 md:p-6 rounded-xl shadow-2xs flex items-center justify-between sm:col-span-2 md:col-span-1">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 block mb-1">Draft Configs</span>
                                <span className="text-xl md:text-2xl font-bold text-amber-600">{isLoading ? "..." : draftCount}</span>
                            </div>
                            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><AlertCircle size={20} /></div>
                        </div>
                    </div>

                    {/* 4. UTILITY OPERATIONS FILTER ROW */}
                    <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row gap-4 justify-between md:items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3.5 top-3.5 text-slate-300" size={15} />
                            <input
                                type="text"
                                placeholder="Search assessments by signature or names..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-400 transition"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 overflow-x-auto self-start md:self-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                            <Filter size={14} className="text-slate-400 mr-1 flex-shrink-0" />
                            {(['all', 'live', 'draft'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition whitespace-nowrap ${statusFilter === filter
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 5. DATA INVENTORY TABLE CONTAINER (Responsive Horizontal Scroll) */}
                    <div className="bg-white border border-slate-200/60 rounded-xl shadow-2xs overflow-hidden">

                        {/* 👑 PAGINATION RESTORED: Back to your original truncated layout schema */}
                        {!isLoading && totalItems > 0 && (
                            <div className="bg-slate-50/50 px-6 py-3.5 border-b border-slate-100 flex items-center justify-between">
                                <div className="text-xs text-slate-400">
                                    Showing <span className="font-semibold text-slate-600">{indexOfFirstItem + 1}</span> to{' '}
                                    <span className="font-semibold text-slate-600">
                                        {Math.min(indexOfLastItem, totalItems)}
                                    </span>{' '}
                                    of <span className="font-semibold text-slate-600">{totalItems}</span> items
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 border border-slate-200 bg-white rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-400 transition"
                                    >
                                        <ChevronLeft size={15} />
                                    </button>

                                    {(() => {
                                        const pages: (number | string)[] = [];
                                        if (totalPages <= 5) {
                                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                                        } else {
                                            pages.push(1);
                                            if (currentPage > 3) pages.push('...left');
                                            const start = Math.max(2, currentPage - 1);
                                            const end = Math.min(totalPages - 1, currentPage + 1);
                                            for (let i = start; i <= end; i++) {
                                                if (i !== 1 && i !== totalPages) pages.push(i);
                                            }
                                            if (currentPage < totalPages - 2) pages.push('...right');
                                            pages.push(totalPages);
                                        }

                                        return pages.map((page, idx) => {
                                            if (typeof page === 'string') {
                                                return (
                                                    <span key={`ellipsis-${idx}`} className="px-2 text-slate-300 text-xs font-mediumSelect">
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-7 h-7 rounded-lg text-xs font-semibold tracking-wide transition ${currentPage === page
                                                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-100'
                                                        : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        });
                                    })()}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-1.5 border border-slate-200 bg-white rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-400 transition"
                                    >
                                        <ChevronRight size={15} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* SCROLLABLE RESPONSIVE VIEWPORT BOUNDARY */}
                        <div className="w-full overflow-x-auto scrollbar-thin">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="px-6 py-4">Test Description Name</th>
                                        <th className="px-6 py-4">Subject Field</th>
                                        <th className="px-6 py-4">Status Flag</th>
                                        <th className="px-6 py-4">Initialization Date</th>
                                        <th className="px-6 py-4 text-right">Actions Workflow Control</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
                                    {/* 👑 LOADING HANDLE RE-ORDERED: Checks isLoading first to prevent falling through to empty array check */}
                                    {isLoading ? (
                                        [1, 2, 3, 4, 5].map((skeletonIndex) => (
                                            <tr key={skeletonIndex} className="animate-pulse bg-white">
                                                <td className="px-6 py-5"><div className="h-4 w-56 bg-slate-100 rounded-lg"></div></td>
                                                <td className="px-6 py-5"><div className="h-5 w-20 bg-slate-100 rounded-full"></div></td>
                                                <td className="px-6 py-5"><div className="h-6 w-16 bg-slate-100 rounded-md"></div></td>
                                                <td className="px-6 py-5"><div className="h-4 w-28 bg-slate-100 rounded-lg"></div></td>
                                                <td className="px-6 py-5 text-right"><div className="h-5 w-24 bg-slate-100 rounded-lg ml-auto"></div></td>
                                            </tr>
                                        ))
                                    ) : currentPaginatedItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12 text-slate-400 font-medium text-xs bg-white">
                                                No matching test profiles found inside this container registry.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentPaginatedItems.map((test) => (
                                            <tr key={test.id} className="hover:bg-slate-50/30 transition bg-white">
                                                <td className="px-6 py-4 text-slate-800 font-semibold truncate max-w-[240px]">
                                                    {test.name || <span className="text-slate-300 font-normal italic">Untitled Test Record</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-blue-50/60 border border-blue-100 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                                                        {test.subject}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {/* 👑 NULL STATUS FALLBACK HANDLER */}
                                                    {test.status === 'live' || test.status === 'draft' ? (
                                                        <span className={`inline-flex items-center text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-md border ${test.status === 'live'
                                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                            {test.status}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-[11px] font-bold text-slate-300 bg-slate-50 border border-slate-100 px-3 py-0.5 rounded-md select-none">
                                                            -
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-400 font-normal whitespace-nowrap">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar size={13} className="text-slate-300" />
                                                        {test.created_at ? new Date(test.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' }) : "N/A"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2 text-slate-400">
                                                        <button className="p-1.5 hover:text-blue-500 hover:bg-slate-50 rounded-lg transition" onClick={() => router.push(`/edit/${test.id}`)}><Eye size={16} /></button>
                                                        <button className="p-1.5 hover:text-amber-500 hover:bg-slate-50 rounded-lg transition" onClick={() => router.push(`/edit/${test.id}`)}><Edit3 size={16} /></button>
                                                        <button className="p-1.5 hover:text-red-500 hover:bg-slate-50 rounded-lg transition"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}