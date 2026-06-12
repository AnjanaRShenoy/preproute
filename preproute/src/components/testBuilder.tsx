"use client";

import React, { useState, useEffect } from 'react';
import {
  ChevronDown, ChevronLeft, ChevronRight, Plus, Download, Trash2, Bell,
  LineChart, FileText, HelpCircle, Copy, Users, GraduationCap,
  Settings, Landmark, Wallet, MessageSquare, AlertCircle
} from 'lucide-react';
import Image from 'next/image';

interface TestBuilderProps {
  testDetails: {
    testType: string;
    testName: string;
    subjectName: string;
    topicName: string;
    subTopicName: string;
    difficulty: string;
    duration: string;
    noOfQuestions: number;
    totalMarks: number;
    id?: string;
    questions?: string[];
  };
  navigateTo: (step: number | 'dashboard') => void;
  onBack: () => void;
  onSyncUpdatedMetrics: (finalCount: number, finalMarks: number, finalTopic: string, finalSubTopic: string) => void;
}

interface LocalQuestion {
  id?: string;
  type: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correct_option: string;
  explanation: string;
  difficulty: string;
  topic_id: string;
  sub_topic_id: string;
}

export default function TestBuilder({ testDetails, navigateTo, onBack, onSyncUpdatedMetrics }: TestBuilderProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isEditWorkflow = !!(testDetails.questions && testDetails.questions.length > 0);
  const [loadingQuestions, setLoadingQuestions] = useState(isEditWorkflow);

  // Initialize your array space structure
  const [questionsList, setQuestionsList] = useState<LocalQuestion[]>(() => {
    const totalCount = testDetails.noOfQuestions || 1;
    return Array.from({ length: totalCount }, () => ({
      type: "mcq",
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correct_option: "", 
      explanation: "",
      difficulty: testDetails.difficulty.toLowerCase(),
      topic_id: "",
      sub_topic_id: ""
    }));
  });

  const getCookie = (name: string) => {
    if (typeof window === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const myToken = getCookie('token');

  // Bulk recovery synchronization effect hook
  useEffect(() => {
    if (isEditWorkflow && testDetails.questions) {
      const recoverExistingTestQuestions = async () => {
        setLoadingQuestions(true);
        try {
          console.log(`🚀 Edit Mode verified! Fetching ${testDetails.questions?.length} questions bulk...`);

          const response = await fetch('/api/questions/fetchBulk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${myToken}`
            },
            body: JSON.stringify({ question_ids: testDetails.questions })
          });

          const resData = await response.json();
          const fetchedQuestions: any[] = resData.data?.data || resData.data || [];

          if (response.ok && fetchedQuestions.length > 0) {
            const allocationSize = Math.max(testDetails.noOfQuestions, fetchedQuestions.length);

            const mappedQuestionsList = Array.from({ length: allocationSize }, (_, idx) => {
              const apiQ = fetchedQuestions[idx];
              return {
                id: apiQ?.id || undefined,
                type: apiQ?.type || "mcq",
                question: apiQ?.question || "",
                option1: apiQ?.option1 || "",
                option2: apiQ?.option2 || "",
                option3: apiQ?.option3 || "",
                option4: apiQ?.option4 || "",
                correct_option: apiQ?.correct_option || "", 
                explanation: apiQ?.explanation || "",
                difficulty: apiQ?.difficulty?.toLowerCase() || testDetails.difficulty.toLowerCase(),
                topic_id: apiQ?.topic_id || "",
                sub_topic_id: apiQ?.sub_topic_id || ""
              };
            });

            setQuestionsList(mappedQuestionsList);
          }
        } catch (error) {
          console.error("Critical error reconstructing question items:", error);
        } finally {
          setLoadingQuestions(false);
        }
      };

      recoverExistingTestQuestions();
    }
  }, [testDetails.questions, isEditWorkflow, myToken, testDetails.difficulty, testDetails.noOfQuestions]);

  const currentQuestion = questionsList[currentQuestionIndex];

  // Dynamic scoring configurations calculations based on question count adjustments
  const singleQuestionMarksValue = testDetails.noOfQuestions > 0 ? (testDetails.totalMarks / testDetails.noOfQuestions) : 5;
  const recalculatedTotalMarks = questionsList.length * singleQuestionMarksValue;

  const updateCurrentQuestionField = (field: keyof LocalQuestion, value: string) => {
    setQuestionsList(prev => {
      const updated = [...prev];
      updated[currentQuestionIndex] = {
        ...updated[currentQuestionIndex],
        [field]: value
      };
      return updated;
    });
  };

  // Clear layout field state drafts completely
  const handleClearFormDraft = () => {
    setQuestionsList(prev => {
      const updated = [...prev];
      updated[currentQuestionIndex] = {
        ...updated[currentQuestionIndex],
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correct_option: "", 
        explanation: ""
      };
      return updated;
    });
  };

  // Append fresh blank question tracking entity node safely into memory
  const handleAddNewQuestionNode = () => {
    const nextQuestionBlankNode: LocalQuestion = {
      type: "mcq",
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correct_option: "", 
      explanation: "",
      difficulty: testDetails.difficulty.toLowerCase(),
      topic_id: "",
      sub_topic_id: ""
    };
    
    setQuestionsList(prev => [...prev, nextQuestionBlankNode]);
    setCurrentQuestionIndex(questionsList.length); 
  };

  // 👑 FUNCTIONALITY ADDED: Remove question from sidebar index stack cleanly
  const handleDeleteQuestionNode = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering selected navigation onClick handlers
    
    if (questionsList.length <= 1) {
      alert("A test workspace configuration must preserve a minimum layout sizing of at least 1 question item.");
      return;
    }

    setQuestionsList(prev => prev.filter((_, idx) => idx !== indexToDelete));

    // Fix active selection focus row to prevent structural clipping out of bounds
    if (currentQuestionIndex === indexToDelete) {
      setCurrentQuestionIndex(prev => (prev === 0 ? 0 : prev - 1));
    } else if (currentQuestionIndex > indexToDelete) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Input validation parameters
  const isQuestionPromptPopulated = currentQuestion?.question?.trim() !== "";
  const areAllOptionsPopulated = 
    currentQuestion?.option1?.trim() !== "" &&
    currentQuestion?.option2?.trim() !== "" &&
    currentQuestion?.option3?.trim() !== "" &&
    currentQuestion?.option4?.trim() !== "";
  const isCorrectAnswerSelected = currentQuestion?.correct_option !== "";

  const isCurrentQuestionValid = isQuestionPromptPopulated && areAllOptionsPopulated && isCorrectAnswerSelected;

  const isEntireFormReadyForSubmission = questionsList.every(q => 
    q.question?.trim() !== "" &&
    q.option1?.trim() !== "" &&
    q.option2?.trim() !== "" &&
    q.option3?.trim() !== "" &&
    q.option4?.trim() !== "" &&
    q.correct_option !== ""
  );

  const isQuestionCompleted = (q: LocalQuestion) => {
    return q &&
      q.question?.trim() !== "" &&
      q.option1?.trim() !== "" &&
      q.option2?.trim() !== "" &&
      q.option3?.trim() !== "" &&
      q.option4?.trim() !== "" &&
      q.correct_option !== "";
  };

  const handleTopPublishClick = async () => {
    if (!isEntireFormReadyForSubmission || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const formattedPayload = {
        questions: questionsList.map((q) => ({
          type: q.type,
          question: q.question.trim(),
          option1: q.option1.trim(),
          option2: q.option2.trim(),
          option3: q.option3.trim(),
          option4: q.option4.trim(),
          correct_option: q.correct_option,
          explanation: q.explanation.trim(),
          difficulty: q.difficulty.toLowerCase(),
          subject: testDetails.subjectName,
          test_id: testDetails.id
        }))
      };

      const response = await fetch('/api/questions/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${myToken}`
        },
        body: JSON.stringify(formattedPayload)
      });

      const data = await response.json();

      if (response.ok && (data.status === "success" || data.success)) {
        navigateTo(3);
      } else {
        alert(`Submission failed: ${data.message || 'Unknown server error occurred'}`);
      }
    } catch (error) {
      console.error(error);
      alert("A network error occurred while submitting your test questions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingQuestions) {
    return (
      <div className="flex h-screen w-screen bg-slate-50 flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xs font-black text-slate-400 tracking-widest uppercase animate-pulse">
          Recovering Pre-existing Test Questions Layout Matrix...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-700 font-sans overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-16 bg-white border-r border-slate-100 flex flex-col items-center py-4 justify-between fixed h-full z-20">
        <div className="flex flex-col items-center gap-6 w-full">
          <nav className="flex flex-col items-center gap-2 w-full px-2">
            <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 rounded-lg transition"><LineChart size={18} /></button>
            <button type="button" className="p-2.5 bg-blue-50 text-blue-600 rounded-lg transition"><FileText size={18} /></button>
            <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 rounded-lg transition"><HelpCircle size={18} /></button>
            <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 rounded-lg transition"><Copy size={18} /></button>
            <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 rounded-lg transition"><Users size={18} /></button>
            <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 rounded-lg transition"><Landmark size={18} /></button>
            <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 rounded-lg transition"><GraduationCap size={18} /></button>
            <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 rounded-lg transition"><Wallet size={18} /></button>
            <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 rounded-lg transition"><MessageSquare size={18} /></button>
          </nav>
        </div>
        <div>
          <button type="button" className="p-2.5 text-slate-400 hover:text-slate-600 rounded-lg transition"><Settings size={18} /></button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col ml-16 h-full relative overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 w-full shrink-0">
          <div className="relative w-40 h-10">
            <Image src="/Frame 1171277511.svg" alt="PrepRoute Logo" fill priority className="object-contain object-left" />
          </div>
          <div className="flex items-center gap-6">
            <button type="button" className="relative p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full border border-slate-100">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80" alt="Alex Wando" className="w-10 h-10 rounded-full border border-slate-100 object-cover" />
              <div>
                <div className="font-semibold text-sm text-slate-800 flex items-center gap-1">Alex Wando <ChevronDown size={14} className="text-slate-400" /></div>
                <div className="text-xs text-slate-400">Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* SUB-HEADER STRIP */}
        <div className="bg-slate-50 border-b border-slate-200/60 h-16 flex items-center justify-between px-8 w-full shrink-0">
          <div className="text-xs text-slate-400 font-medium flex gap-2">
            <span>Test Creation</span> / <span>Create Test</span> / <span className="text-slate-600">{testDetails.testType}</span>
          </div>
          <button
            type="button"
            disabled={isSubmitting || !isEntireFormReadyForSubmission}
            onClick={handleTopPublishClick}
            className={`px-10 py-2 text-white font-semibold text-sm rounded-lg shadow-sm transition ${
              isSubmitting || !isEntireFormReadyForSubmission 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? "Processing..." : "Publish"}
          </button>
        </div>

        {/* SPLIT VIEW WORKSPACE */}
        <div className="flex flex-1 overflow-hidden w-full bg-white">
          {/* LEFTHAND NAVIGATION PANEL */}
          <div className="w-64 bg-white border-r border-slate-100 p-4 flex flex-col gap-4 h-full overflow-y-auto shrink-0">
            <div className="flex items-center justify-between text-sm font-semibold border-b border-slate-100 pb-3">
              <span className="flex items-center gap-1 text-slate-500">Question creation</span>
              <ChevronLeft size={16} className="text-slate-400 cursor-pointer" />
            </div>
            
            <div className="text-sm font-bold text-slate-700 flex justify-between items-center">
              <span>Total Questions . <span className="font-semibold text-slate-500">{questionsList.length}</span></span>
              <button 
                type="button" 
                onClick={handleAddNewQuestionNode}
                className="p-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 space-y-2 pr-1 overflow-y-auto">
              {questionsList.map((q, idx) => {
                const isSelected = currentQuestionIndex === idx;
                const isDone = isQuestionCompleted(q);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`group w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg border transition-all relative ${
                      isSelected ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : isDone ? 'border-emerald-100 bg-emerald-50/50 text-emerald-700' : 'border-slate-100 text-slate-500 hover:bg-slate-50/80'
                    }`}
                  >
                    <span className="flex items-center gap-2 pr-6 overflow-hidden text-ellipsis whitespace-nowrap">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${isSelected ? 'bg-blue-500 text-white' : isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{isDone ? '✓' : idx + 1}</span>
                      Question {idx + 1}
                    </span>
                    
                    {/* 👑 ADDED: CONTEXT DELETE ICON (REVEALS ON HOVER MATRIX OVER CARD ITEMS) */}
                    <span className="flex items-center gap-1">
                      <Trash2 
                        size={13} 
                        onClick={(e) => handleDeleteQuestionNode(idx, e)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all cursor-pointer mr-0.5" 
                        
                      />
                      <ChevronRight size={14} className={isSelected ? 'text-blue-400 flex-shrink-0' : 'text-slate-300 flex-shrink-0'} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN FIELD INPUTS PANEL */}
          <main className="flex-1 p-8 overflow-y-auto bg-slate-50/50 h-full flex flex-col justify-between">
            <div className="max-w-4xl mx-auto w-full flex-1">
              {/* TEST METADATA OVERVIEW CARD */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm mb-6 relative">
                <button 
                  type="button" 
                  onClick={handleAddNewQuestionNode} 
                  className="absolute top-6 right-6 text-blue-500 hover:text-blue-600 text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} /> Add Question
                </button>

                <div className="inline-block bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-md mb-4">{testDetails.testType}</div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                  {testDetails.testName || "Untitled Assignment"} <span className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-100">{testDetails.difficulty}</span>
                </h2>
                <div className="grid grid-cols-2 gap-y-3 text-sm">
                  <div className="flex gap-2"><span className="text-slate-400 w-24">Subject</span><span className="font-medium text-slate-700">: {testDetails.subjectName}</span></div>
                  <div className="flex gap-2"><span className="text-slate-400 w-24">Topic</span><span className="font-medium text-slate-700">: <span className="border border-amber-200 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-xs">{testDetails.topicName}</span></span></div>
                  <div className="flex gap-2"><span className="text-slate-400 w-24">Sub Topic</span><span className="font-medium text-slate-700">: <span className="border border-amber-200 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full text-xs">{testDetails.subTopicName}</span></span></div>
                  
                  <div className="col-span-2 flex justify-end gap-3 text-xs text-slate-400 mt-2">
                    <span className="border border-slate-100 rounded-lg px-3 py-1.5 flex items-center gap-1 bg-white">🕒 {testDetails.duration} Min</span>
                    <span className="border border-slate-100 rounded-lg px-3 py-1.5 flex items-center gap-1 bg-white">📄 {questionsList.length} Q's</span>
                    <span className="border border-slate-100 rounded-lg px-3 py-1.5 flex items-center gap-1 bg-white">¼ {recalculatedTotalMarks} Marks</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">Question {currentQuestionIndex + 1}/{questionsList.length}</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={handleAddNewQuestionNode} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"><Plus size={14} /> Add Question</button>
                  <button type="button" className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-500 flex items-center gap-1"><Download size={14} /> CSV</button>
                </div>
              </div>

              <div 
                onClick={handleClearFormDraft} 
                className="text-red-500 hover:text-red-600 text-xs font-semibold flex items-center gap-1 mb-4 select-none cursor-pointer w-max transition-colors"
              >
                <Trash2 size={14} /> Clear Form Draft
              </div>

              {/* TEXTAREA QUESTION BOX INPUTS */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-2 shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-4 text-slate-400 text-xs serif select-none">
                  <span><i>I</i></span> <span className="font-bold">B</span> <span><u>U</u></span> <span><s>S</s></span> <span>🔗</span> <span>◼</span> <span>☰</span> <span>☷</span> <span>∑</span>
                </div>
                <textarea
                  value={currentQuestion?.question || ""}
                  onChange={(e) => updateCurrentQuestionField("question", e.target.value)}
                  placeholder="Type question content here..."
                  className="w-full h-32 px-4 py-3 text-slate-700 placeholder-slate-300 resize-none focus:outline-none text-sm font-medium"
                />
              </div>
              {!isQuestionPromptPopulated && <div className="text-[10px] font-bold text-red-500 flex items-center gap-1 mb-6 px-1"><AlertCircle size={10}/> - Prompt body is a mandatory submission item field.</div>}

              {/* OPTIONS INPUT PANEL */}
              <div className="space-y-3 mt-4 mb-2">
                <h4 className="text-xs font-bold text-slate-800">Type the options below</h4>
                {[1, 2, 3, 4].map((idx) => {
                  const optionKey = `option${idx}` as keyof LocalQuestion;
                  const valueKey = `option${idx}`;
                  const isChecked = currentQuestion?.correct_option === valueKey;

                  return (
                    <div key={idx} className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 shadow-sm transition ${isChecked ? 'border-blue-400 bg-blue-50/10' : 'border-slate-200'}`}>
                      <button
                        type="button"
                        onClick={() => updateCurrentQuestionField("correct_option", valueKey)}
                        className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${isChecked ? 'border-blue-500 bg-blue-500' : 'border-slate-300 bg-white'}`}
                      />
                      <input
                        type="text"
                        value={(currentQuestion?.[optionKey] as string) || ""}
                        onChange={(e) => updateCurrentQuestionField(optionKey, e.target.value)}
                        placeholder={`Type Option ${idx} here`}
                        className="w-full text-xs text-slate-700 bg-transparent focus:outline-none font-medium"
                      />
                    </div>
                  );
                })}
              </div>
              {!areAllOptionsPopulated && <div className="text-[10px] font-bold text-red-500 flex items-center gap-1 mb-6 px-1"><AlertCircle size={10}/> - All 4 options fields must contain valid character string input values.</div>}
              {areAllOptionsPopulated && !isCorrectAnswerSelected && <div className="text-[10px] font-bold text-amber-500 flex items-center gap-1 mb-6 px-1"><AlertCircle size={10}/> - Select one radio choice button indicator item option to serve as the answer target.</div>}

              {/* SOLUTION EXPLANATION */}
              <div className="mb-8 mt-4">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Add Solution Explanation</h4>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <textarea
                    value={currentQuestion?.explanation || ""}
                    onChange={(e) => updateCurrentQuestionField("explanation", e.target.value)}
                    placeholder="Provide explanatory details..."
                    className="w-full h-24 px-4 py-3 text-slate-700 placeholder-slate-300 resize-none focus:outline-none text-xs font-medium"
                  />
                </div>
              </div>

              {/* QUESTION SETTINGS DROPDOWN CONTAINER */}
              <div className="mt-8 pt-6 border-t border-slate-200 space-y-5">
                <h4 className="text-sm font-bold text-slate-800 tracking-wide">Question settings</h4>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-600">Level of Difficulty</label>
                  <div className="relative max-w-4xl w-full">
                    <select
                      value={currentQuestion?.difficulty || "easy"}
                      onChange={(e) => updateCurrentQuestionField("difficulty", e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-4 py-3 pr-10 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-400 transition"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="difficult">Difficult</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-600">Topic</label>
                  <div className="relative max-w-4xl w-full">
                    <select disabled className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-10 text-xs font-semibold text-slate-700 cursor-not-allowed">
                      <option>{testDetails.topicName || "Select from Drop-down"}</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-600">Sub-topic</label>
                  <div className="relative max-w-4xl w-full">
                    <select disabled className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 pr-10 text-xs font-semibold text-slate-700 cursor-not-allowed">
                      <option>{testDetails.subTopicName || "Select from Drop-down"}</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* NAVIGATION FOOTER */}
            <div className="max-w-4xl mx-auto w-full flex justify-between border-t border-slate-200/60 pt-6 mt-6 bg-transparent shrink-0">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2.5 bg-red-400 hover:bg-red-500 text-white font-semibold text-xs rounded-xl shadow-sm transition"
              >
                Exit Test Creation
              </button>

              <div className="flex gap-2">
                {currentQuestionIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition-all"
                  >
                    Previous
                  </button>
                )}
                {currentQuestionIndex < questionsList.length - 1 && (
                  <button
                    type="button"
                    disabled={!isCurrentQuestionValid}
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className={`px-10 py-2.5 font-semibold text-xs rounded-xl shadow-sm transition-all ${
                      !isCurrentQuestionValid 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </main>
        </div>
    </div>
    </div>
  );
}