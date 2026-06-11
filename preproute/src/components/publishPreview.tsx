"use client";

import React, { useState } from 'react';
import { Calendar, Clock, Award, CheckCircle2, ArrowLeft, Edit2 } from 'lucide-react';
import Header from './header';

interface PreviewProps {
  testDetails: {
    id: string;
    testType: string;
    testName: string;
    subjectName: string;
    topicName: string;
    subTopicName: string;
    difficulty: string;
    duration: string;
    noOfQuestions: number;
    totalMarks: number;
  };
  onBack: () => void;
}

export default function PublishPreviewWorkspace({ testDetails, onBack }: PreviewProps) {
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [availability, setAvailability] = useState('always');
  const [isSubmitting, setIsSubmitting] = useState(false);

    const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const myToken = getCookie('token');

  const handleFinalPublish = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tests/${testDetails.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${myToken}` 
        },
        body: JSON.stringify({
          status: "live" // Pushes state change matching API 10 standard guidelines
        })
      });

      const data = await response.json();
      if (response.ok && (data.status === 'success' || data.success)) {
        alert("🎉 Test has been published live on the platform registry successfully!");
        window.location.href = "/dashboard";
      } else {
        alert(`Publication rejected: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("A core transport layer error blocked the publish confirmation stream.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-700 font-sans overflow-hidden">
      
      {/* SIDEBAR PLACEHOLDER BLOCKS */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-20">
        <div className="p-6 text-blue-600 font-black text-xl italic tracking-wider border-b border-slate-50">PrepRoute</div>
        <div className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-widest mt-4 px-6 block">Assessments Workflow</div>
        <div className="px-3 mt-1"><div className="px-4 py-3 bg-blue-50 text-blue-600 font-medium text-sm rounded-xl">Preview & Publish</div></div>
      </aside>

      <div className="flex-1 flex flex-col ml-64 h-full overflow-y-auto">
        <Header testType="Test Finalization Workspace" />

        <main className="p-8 max-w-5xl w-full mx-auto space-y-8 pb-16">
          
          {/* Breadcrumb row tracking details */}
          <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-700 transition">
              <ArrowLeft size={14}/> Back to Question Registry
            </button>
            <span className="text-[11px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-black tracking-wider uppercase px-2.5 py-1 rounded-md flex items-center gap-1.5">
              <CheckCircle2 size={12}/> All {testDetails.noOfQuestions} Questions complete
            </span>
          </div>

          {/* 1. RENDERED PROFILE DISPLAY META SUMMARY ROW CARD */}
          <div className="bg-white border border-slate-200/70 shadow-sm rounded-2xl p-6 relative">
            <button className="absolute right-6 top-6 text-slate-300 hover:text-blue-500 transition"><Edit2 size={16}/></button>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-slate-900 text-white font-black text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded-md">{testDetails.testType}</span>
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[11px] px-2.5 py-0.5 rounded-full capitalize">{testDetails.difficulty}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">{testDetails.testName}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 text-xs font-medium text-slate-400 pt-1">
                <div>Subject Name: <span className="text-slate-700 font-semibold">{testDetails.subjectName}</span></div>
                <div>Topic: <span className="text-slate-700 font-semibold">{testDetails.topicName}</span></div>
                {testDetails.subTopicName !== 'Unknown' && <div>Subtopic: <span className="text-slate-700 font-semibold">{testDetails.subTopicName}</span></div>}
              </div>
              <div className="border-t border-slate-50 pt-4 flex gap-6 text-xs text-slate-500 font-bold">
                <span className="flex items-center gap-1.5 text-slate-400 font-medium"><Clock size={14} className="text-slate-300"/>{testDetails.duration} Minutes</span>
                <span className="flex items-center gap-1.5 text-slate-400 font-medium"><Award size={14} className="text-slate-300"/>{testDetails.noOfQuestions} Questions total</span>
                <span className="flex items-center gap-1.5 text-slate-400 font-medium"><CheckCircle2 size={14} className="text-slate-300"/>{testDetails.totalMarks} Weight Marks</span>
              </div>
            </div>
          </div>

          {/* 2. MODE CONFIGURATION SWITCHER TABS */}
          <div className="flex gap-2 border-b border-slate-200">
            <button onClick={() => setPublishMode('now')} className={`pb-3 text-sm font-bold transition-all relative ${publishMode === 'now' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Publish Now</button>
            <button onClick={() => setPublishMode('schedule')} className={`pb-3 text-sm font-bold ml-6 transition-all relative ${publishMode === 'schedule' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Schedule Publish</button>
          </div>

          {/* 3. PLATFORM VISIBILITY / DURATION OPTIONS MATRIX SEGMENT */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800">Live Until Availability Threshold</h3>
            <p className="text-xs text-slate-400 mt-1">Choose how long this configuration payload data remains active inside client platform evaluation dashboards.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                { id: 'always', text: 'Always Available' },
                { id: '3w', text: '3 Weeks Duration Window' },
                { id: '1w', text: '1 Week Active Timeline' },
                { id: '1m', text: '1 Month Standard Deployment' },
                { id: '2w', text: '2 Weeks Retention' },
                { id: 'custom', text: 'Custom Duration Matrix Setting' }
              ].map((opt) => (
                <label key={opt.id} className={`flex items-center gap-3 p-4 bg-white border rounded-xl shadow-sm cursor-pointer transition-all hover:border-blue-200 ${availability === opt.id ? 'border-blue-500 bg-blue-50/10' : 'border-slate-200/70'}`}>
                  <input type="radio" name="availability" checked={availability === opt.id} onChange={() => setAvailability(opt.id)} className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-400" />
                  <span className="text-xs font-semibold text-slate-600">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fallback Custom Date Form Row Fields block if 'custom' option value is active */}
          {availability === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in pt-2">
              <div className="relative"><input type="date" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-400 text-slate-600 font-medium" /></div>
              <div className="relative"><input type="time" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-blue-400 text-slate-600 font-medium" /></div>
            </div>
          )}

          {/* 4. BOTTOM WORKFLOW CONTROL NAVIGATION FOOTER BAR ROW */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-200/60">
            <button onClick={onBack} disabled={isSubmitting} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition">Cancel</button>
            <button onClick={handleFinalPublish} disabled={isSubmitting} className={`px-8 py-2.5 text-white font-semibold text-xs rounded-xl shadow-md transition ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isSubmitting ? "Finalizing Deployment..." : "Confirm & Publish Live"}
            </button>
          </div>

        </main>
      </div>

    </div>
  );
}