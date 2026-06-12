"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, Eye, Edit3, Trash2,
    FileText, CheckCircle, AlertCircle, Calendar, Users,
    LayoutDashboard,
    FileEdit,
    BarChart2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Header from './header';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface TestRecord {
    id: string;
    name: string;
    subject: string;
    topics: string[];
    status: 'draft' | 'live';
    created_at: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [tests, setTests] = useState<TestRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'draft'>('all');
    const [isLoading, setIsLoading] = useState(true);

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Helper to read cookies safely on client-side
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
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Failed fetching test records matrix:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchAllTests();
    }, []);

    // Reset pagination to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    // Filter computations matrix operations
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

    // Slice data array down to only the current 10 items
    const currentPaginatedItems = filteredTests.slice(indexOfFirstItem, indexOfLastItem);

    // KPI Counter Metrics
    const totalCount = tests.length;
    const liveCount = tests.filter(t => t.status === 'live').length;
    const draftCount = tests.filter(t => t.status === 'draft').length;

    return (
        <div className="flex h-screen w-screen bg-slate-50 text-slate-700 font-sans overflow-hidden">

            {/* 1. LEFT SIDEBAR */}
            <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between fixed h-full z-20">
                <div>
                    <div className="p-6 flex items-center gap-2">
                        <div className="relative w-40 h-10 mb-9">
                            <Image
                                src="\prepRoute\logo.svg"
                                alt="PrepRoute Logo"
                                fill
                                priority
                                className="object-contain object-left"
                            />
                        </div>
                    </div>

                    <nav className="mt-4 px-3 space-y-1">
                        <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 font-medium rounded-r-none rounded-l-xl border-r-4 border-blue-600 transition">
                            <LayoutDashboard size={18} />
                            <span>Dashboard</span>
                        </a>
                        <a href="/" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-800 font-medium rounded-lg transition">
                            <FileEdit size={18} />
                            <span>Test Creation</span>
                        </a>
                        <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-800 font-medium rounded-lg transition">
                            <BarChart2 size={18} />
                            <span>Test Tracking</span>
                        </a>
                    </nav>
                </div>
            </aside>

            {/* 2. MAIN HUB WORKSPACE CONTAINER */}
            <div className="flex-1 flex flex-col ml-64 h-full overflow-y-auto">

                {/* Global Nav Row */}
                <Header testType="Overview" />

                <main className="p-8 max-w-7xl w-full mx-auto space-y-8">

                    {/* Header Description & Action Hook Row */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Test Inventory</h1>
                            <p className="text-xs text-slate-400 mt-1">Manage, update configurations, and inspect performance evaluation models.</p>
                        </div>
                        <a
                            href="/"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition"
                        >
                            <Plus size={16} />
                            <span>Create New Test</span>
                        </a>
                    </div>

                    {/* 3. PERFORMANCE SUMMARY CARDS MATRIX */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 block mb-1">Total Assessments</span>
                                <span className="text-2xl font-bold text-slate-800">{isLoading ? "..." : totalCount}</span>
                            </div>
                            <div className="p-3 bg-slate-50 text-slate-500 rounded-xl"><FileText size={22} /></div>
                        </div>

                        <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 block mb-1">Live & Active</span>
                                <span className="text-2xl font-bold text-emerald-600">{isLoading ? "..." : liveCount}</span>
                            </div>
                            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><CheckCircle size={22} /></div>
                        </div>

                        <div className="bg-white border border-slate-100 p-6 rounded-xl shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-xs font-semibold text-slate-400 block mb-1">Draft Configs</span>
                                <span className="text-2xl font-bold text-amber-600">{isLoading ? "..." : draftCount}</span>
                            </div>
                            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl"><AlertCircle size={22} /></div>
                        </div>
                    </div>

                    {/* 4. UTILITY FILTER OPERATIONS BAR */}
                    <div className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3.5 top-3 text-slate-300" size={16} />
                            <input
                                type="text"
                                placeholder="Search assessments by signature or names..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-blue-400 transition"
                            />
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-auto">
                            <Filter size={14} className="text-slate-400 mr-1" />
                            {((['all', 'live', 'draft'] as const)).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${statusFilter === filter
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                                        }`}
                                    align-items="center">
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 5. DATA INVENTORY CONTAINER */}
                    <div className="bg-white border border-slate-200/60 rounded-xl shadow-sm overflow-hidden">

                        {/* --- PAGINATION INTERFACE HEADER BAR (MOVED TO TOP + TRUNCATED) --- */}
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
                                    {/* Previous Button */}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-1.5 border border-slate-200 bg-white rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-400 transition"
                                    >
                                        <ChevronLeft size={15} />
                                    </button>

                                    {/* Dynamic Truncated Page Numbers */}
                                    {(() => {
                                        const pages: (number | string)[] = [];

                                        if (totalPages <= 5) {
                                            // If total pages are small, show all of them
                                            for (let i = 1; i <= totalPages; i++) pages.push(i);
                                        } else {
                                            // Always include page 1
                                            pages.push(1);

                                            if (currentPage > 3) {
                                                pages.push('...left');
                                            }

                                            // Pages around current page
                                            const start = Math.max(2, currentPage - 1);
                                            const end = Math.min(totalPages - 1, currentPage + 1);

                                            for (let i = start; i <= end; i++) {
                                                // Avoid duplicating page 1 or last page
                                                if (i !== 1 && i !== totalPages) {
                                                    pages.push(i);
                                                }
                                            }

                                            if (currentPage < totalPages - 2) {
                                                pages.push('...right');
                                            }

                                            // Always include last page
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

                                    {/* Next Button */}
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

                        {/* --- TABLE CONTENT --- */}
                        <table className="w-full text-left border-collapse">
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
                                {isLoading ? (
                                    [1, 2, 3].map((s) => (
                                        <tr key={s} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-4 w-48 bg-slate-100 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 w-16 bg-slate-100 rounded-full"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-28 bg-slate-100 rounded"></div></td>
                                            <td className="px-6 py-4 text-right"><div className="h-4 w-20 bg-slate-100 rounded ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : currentPaginatedItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-slate-400 font-medium text-xs">
                                            No matching test profiles found inside this container registry.
                                        </td>
                                    </tr>
                                ) : (
                                    currentPaginatedItems.map((test) => (
                                        <tr key={test.id} className="hover:bg-slate-50/40 transition">
                                            <td className="px-6 py-4 text-slate-800 font-semibold">{test.name}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-blue-50/60 border border-blue-100 text-blue-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                                    {test.subject}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-md ${test.status === 'live'
                                                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                    : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                    }`}>
                                                    {test.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-400 font-normal">
                                                <span className="flex items-center gap-1.5"><Calendar size={13} />{new Date(test.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 text-slate-400">
                                                    <button className="p-1.5 hover:text-blue-500 hover:bg-slate-50 rounded-lg transition" onClick={() => router.push(`/edit/${test.id}`)}><Eye size={16} /></button>
                                                    <button className="p-1.5 hover:text-amber-500 hover:bg-slate-50 rounded-lg transition"  onClick={() => router.push(`/edit/${test.id}`)}><Edit3 size={16} /></button>
                                                    <button className="p-1.5 hover:text-red-500 hover:bg-slate-50 rounded-lg transition"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                </main>
            </div>

        </div>
    );
}