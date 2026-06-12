"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, LayoutDashboard, FileEdit, BarChart2, AlertCircle } from 'lucide-react';
import TestBuilder from './testBuilder';
import Header from './header';
import Image from 'next/image';
import PublishPreviewWorkspace from './publishPreview';

interface Subject {
  id: string | number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface Topic {
  id: string | number;
  name: string;
  created_at: string;
  updated_at: string;
  subject_id: string | number;
}

interface SubTopic {
  id: string | number;
  name: string;
  topic_id: string | number;
}

interface CreateTestProps {
  initialDataToEdit?: any;
  testIdToEdit?: string | null;
  onCloseEditModal?: () => void;
}

export default function CreateTest({
  initialDataToEdit,
  testIdToEdit,
  onCloseEditModal
}: CreateTestProps) {
  // Base State Initializations
  const [testType, setTestType] = useState(initialDataToEdit?.type || "chapterwise");
  const [testName, setTestName] = useState(initialDataToEdit?.name || "");
  const [difficulty, setDifficulty] = useState(
    initialDataToEdit?.difficulty
      ? initialDataToEdit.difficulty.charAt(0).toUpperCase() + initialDataToEdit.difficulty.slice(1)
      : 'Easy'
  );
  const [marking, setMarking] = useState({
    wrong: initialDataToEdit?.wrong_marks ?? -1,
    unattempted: initialDataToEdit?.unattempt_marks ?? 0,
    correct: initialDataToEdit?.correct_marks ?? 5
  });

  const [duration, setDuration] = useState(
    initialDataToEdit?.total_time ? String(initialDataToEdit.total_time) : ''
  );
  const [noOfQuestions, setNoOfQuestions] = useState<string>(
    initialDataToEdit?.total_questions ? String(initialDataToEdit.total_questions) : ""
  );

  // Dropdown Open Overlay Toggles
  const [isTopicMenuOpen, setIsTopicMenuOpen] = useState(false);
  const [isSubTopicMenuOpen, setIsSubTopicMenuOpen] = useState(false);

  // Core collections arrays
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);

  // Selection state parameters
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>([]);

  const [hasFetchedSubjects, setHasFetchedSubjects] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [createdTestId, setCreatedTestId] = useState(testIdToEdit || '');
  const [isCreatingTest, setIsCreatingTest] = useState(false);

  // 👑 STATE ADDED: Stores API validation failure messages to render inside the UI
  const [apiError, setApiError] = useState<string | null>(null);

  // Dynamic preview states initialized directly from incoming payload
  const [previewNoOfQuestions, setPreviewNoOfQuestions] = useState(initialDataToEdit?.total_questions || 0);
  const [previewTotalMarks, setPreviewTotalMarks] = useState(initialDataToEdit?.total_marks || 0);
  const [previewTopicName, setPreviewTopicName] = useState(
    initialDataToEdit?.topics && initialDataToEdit.topics.length > 1
      ? `${initialDataToEdit.topics.length} Topics configured`
      : initialDataToEdit?.topics?.[0] || ""
  );
  const [previewSubTopicName, setPreviewSubTopicName] = useState(
    initialDataToEdit?.sub_topics && initialDataToEdit.sub_topics.length > 1
      ? `${initialDataToEdit.sub_topics.length} Subtopics configured`
      : initialDataToEdit?.sub_topics?.[0] || ""
  );

  const activeSubjectObj = subjects.find(s => String(s.id) === String(selectedSubject));

  const validQuestionsNum = parseInt(noOfQuestions) || 0;
  const totalMarks = validQuestionsNum * marking.correct;

  const isDurationValid = duration.trim() !== "" && !isNaN(Number(duration)) && Number(duration) > 0;
  const isQuestionsCountValid = noOfQuestions.trim() !== "" && !isNaN(Number(noOfQuestions)) && Number(noOfQuestions) > 0;

  const isFormInvalid =
    !selectedSubject ||
    !testName.trim() ||
    selectedTopics.length === 0 ||
    !isDurationValid ||
    !isQuestionsCountValid;

  const getCookie = (name: string) => {
    if (typeof window === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const myToken = getCookie('token');

  // Clear API errors automatically when user modifies fields to re-try submission
  useEffect(() => {
    setApiError(null);
  }, [testName, selectedSubject, testType]);

  // Effect A: Always fetch top level base subject entities array maps on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Effect B: Automatically convert text name keys into system database UUID values
  useEffect(() => {
    if (subjects.length === 0) return;

    const resolveMetadataNamesToSystemUuids = async () => {
      if (!initialDataToEdit) return;

      const matchedSub = subjects.find(
        s => s.name === initialDataToEdit.subject || String(s.id) === String(initialDataToEdit.subject)
      );

      if (matchedSub) {
        const targetSubjectUuid = String(matchedSub.id);
        setSelectedSubject(targetSubjectUuid);

        setLoading(true);
        try {
          const response = await fetch(`/api/topics/subjects/${targetSubjectUuid}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${myToken}`
            },
          });
          const resData = await response.json();
          const loadedTopicsList: Topic[] = resData.data?.data || resData.data || [];
          setTopics(loadedTopicsList);

          if (initialDataToEdit.topics && initialDataToEdit.topics.length > 0) {
            const trueTopicUuids: string[] = [];

            initialDataToEdit.topics.forEach((tName: string) => {
              const foundTopic = loadedTopicsList.find(t => t.name === tName || String(t.id) === String(tName));
              if (foundTopic) trueTopicUuids.push(String(foundTopic.id));
            });

            if (trueTopicUuids.length > 0) {
              setSelectedTopics(trueTopicUuids);

              let subResponse;
              if (trueTopicUuids.length === 1) {
                subResponse = await fetch(`/api/sub-topics/${trueTopicUuids[0]}`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${myToken}`
                  }
                });
              } else {
                subResponse = await fetch('/api/sub-topics/multi-topics', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${myToken}`
                  },
                  body: JSON.stringify({ topicIds: trueTopicUuids })
                });
              }

              const subData = await subResponse.json();
              const loadedSubTopicsList: SubTopic[] = subData.data?.data || subData.data || [];
              setSubTopics(loadedSubTopicsList);

              if (initialDataToEdit.sub_topics && initialDataToEdit.sub_topics.length > 0) {
                const trueSubTopicUuids: string[] = [];
                initialDataToEdit.sub_topics.forEach((stName: string) => {
                  const foundSub = loadedSubTopicsList.find(st => st.name === stName || String(st.id) === String(stName));
                  if (foundSub) trueSubTopicUuids.push(String(foundSub.id));
                });
                setSelectedSubTopics(trueSubTopicUuids);
              }
            }
          }
        } catch (err) {
          console.error("Failed executing automated payload synchronization cascade:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    resolveMetadataNamesToSystemUuids();
  }, [initialDataToEdit, subjects]);

  // Click outside menus helper handler toggles
  useEffect(() => {
    const handleWindowClickContext = () => {
      setIsTopicMenuOpen(false);
      setIsSubTopicMenuOpen(false);
    };
    if (isTopicMenuOpen || isSubTopicMenuOpen) {
      window.addEventListener('click', handleWindowClickContext);
    }
    return () => window.removeEventListener('click', handleWindowClickContext);
  }, [isTopicMenuOpen, isSubTopicMenuOpen]);

  // Asynchronous content loading methods
  const fetchSubjects = async () => {
    if (hasFetchedSubjects) return;
    setLoading(true);
    try {
      const response = await fetch('/api/subjects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${myToken}`
        },
      });
      const data = await response.json();
      setSubjects(data.data.data || []);
      setHasFetchedSubjects(true);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicsForSubject = async (subjectId: string) => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/topics/subjects/${subjectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${myToken}`
        },
      });
      const data = await response.json();
      setTopics(data.data.data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubTopicMenuFocusFetch = async () => {
    if (selectedTopics.length === 0) return;
    setLoading(true);
    try {
      let response;
      if (selectedTopics.length === 1) {
        response = await fetch(`/api/sub-topics/${selectedTopics[0]}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${myToken}`
          }
        });
      } else {
        response = await fetch('/api/sub-topics/multi-topics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${myToken}`
          },
          body: JSON.stringify({ topicIds: selectedTopics })
        });
      }

      const data = await response.json();
      setSubTopics(data.data?.data || data.data || []);
    } catch (error) {
      console.error("Failed pulling target child subtopics arrays:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      } else {
        return [...prev, topicId];
      }
    });
    setSelectedSubTopics([]);
    setSubTopics([]);
  };

  const handleSubTopicToggle = (subTopicId: string) => {
    setSelectedSubTopics(prev => {
      if (prev.includes(subTopicId)) {
        return prev.filter(id => id !== subTopicId);
      } else {
        return [...prev, subTopicId];
      }
    });
  };

  const executeTestConfigurationSubmit = async (targetWorkflow: 'draft' | 'builder') => {
    if (isFormInvalid || isCreatingTest) return;

    setIsCreatingTest(true);
    setApiError(null); // Clear previous errors
    
    try {
      const payload = {
        name: testName.trim(),
        type: testType === "Chapter Wise" ? "chapterwise" : testType.toLowerCase().replace(/\s+/g, ""),
        subject: String(selectedSubject),
        topics: selectedTopics.map(String),
        sub_topics: selectedSubTopics.map(String),
        correct_marks: marking.correct,
        wrong_marks: marking.wrong,
        unattempt_marks: marking.unattempted,
        difficulty: difficulty.toLowerCase(),
        total_time: Number(duration),
        total_marks: totalMarks,
        total_questions: Number(noOfQuestions),
        status: initialDataToEdit?.status || "draft"
      };

      const endpointUrl = testIdToEdit ? `/api/tests/${testIdToEdit}` : '/api/tests';
      const requestMethod = testIdToEdit ? 'PUT' : 'POST';

      const response = await fetch(endpointUrl, {
        method: requestMethod,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${myToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // 👑 RESOLVED: Intercept API errors and extract validation arrays parameters messages
      if (response.ok && (data.status === "success" || data.success)) {
        const realDatabaseId = data.data?.id || data.data?.uuid || testIdToEdit;
        setCreatedTestId(realDatabaseId);
        
        setPreviewNoOfQuestions(Number(noOfQuestions));
        setPreviewTotalMarks(totalMarks);
        setPreviewTopicName(selectedTopics.length === 1 ? (topics.find(t => String(t.id) === selectedTopics[0])?.name || 'Multiple') : `${selectedTopics.length} Topics configured`);
        setPreviewSubTopicName(selectedSubTopics.length === 1 ? (subTopics.find(st => String(st.id) === selectedSubTopics[0])?.name || 'Multiple') : `${selectedSubTopics.length} Subtopics configured`);

        if (targetWorkflow === 'draft') {
          window.location.href = "/dashboard";
        } else {
          setStep(2);
        }
      } else {
        // 👑 Extract either the base message, or the first message from the backend nested errors array layout map
        const errorFeedbackMessage = data.errors?.[0]?.msg || data.errors?.message || data.message || "An unresolved network operational fault occurred.";
        setApiError(errorFeedbackMessage);
      }
    } catch (error) {
      console.error(error);
      setApiError("A critical network pipeline connection disruption blocked transmission.");
    } {
      setIsCreatingTest(false);
    }
  };

  if (step === 2) {
    return (
      <TestBuilder
        testDetails={{
          id: createdTestId,
          testType: testType,
          testName: testName,
          subjectName: activeSubjectObj ? activeSubjectObj.name : String(selectedSubject),
          topicName: selectedTopics.length === 1 ? (topics.find(t => String(t.id) === selectedTopics[0])?.name || 'Multiple') : `${selectedTopics.length} Topics configured`,
          subTopicName: selectedSubTopics.length === 1 ? (subTopics.find(st => String(st.id) === selectedSubTopics[0])?.name || 'Multiple') : `${selectedSubTopics.length} Subtopics configured`,
          difficulty: difficulty,
          duration: duration,
          noOfQuestions: Number(noOfQuestions),
          totalMarks: totalMarks,
          questions: initialDataToEdit?.questions || []
        }}
        navigateTo={(targetStep) => {
          if (targetStep === 'dashboard') {
            window.location.href = "/dashboard";
          } else {
            setStep(targetStep);
          }
        }}
        onSyncUpdatedMetrics={(finalCount, finalMarks, finalTopic, finalSubTopic) => {
          setPreviewNoOfQuestions(finalCount);
          setPreviewTotalMarks(finalMarks);
          setPreviewTopicName(finalTopic);
          setPreviewSubTopicName(finalSubTopic);
        }}
        onBack={() => setStep(1)}
      />
    );
  }

  if (step === 3) {
    return (
      <PublishPreviewWorkspace
        testDetails={{
          id: createdTestId,
          testType: testType,
          testName: testName,
          subjectName: activeSubjectObj ? activeSubjectObj.name : String(selectedSubject),
          topicName: previewTopicName,
          subTopicName: previewSubTopicName,
          difficulty: difficulty,
          duration: duration,
          noOfQuestions: previewNoOfQuestions,
          totalMarks: previewTotalMarks
        }}
        onBack={() => setStep(2)}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-700 font-sans overflow-hidden">
      {/* SIDEBAR CONTAINER */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between fixed h-full z-20">
        <div>
          <div className="p-6 flex items-center gap-2">
            <div className="relative w-40 h-10 mb-9">
              <Image src="/Frame 1171277511.svg" alt="PrepRoute Logo" fill priority className="object-contain object-left" />
            </div>
          </div>
          <nav className="mt-4 px-3 space-y-1">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-800 font-medium rounded-lg transition">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </a>
            <a href="/" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 font-medium rounded-r-none rounded-l-xl border-r-4 border-blue-600 transition">
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

      {/* CORE INPUT CONTAINER */}
      <div className="flex-1 flex flex-col ml-64 h-full relative overflow-y-auto">
        <Header testType={testType} />
        <main className="p-8 max-w-5xl w-full mx-auto flex-1">
          <div className="text-xs text-slate-400 font-medium mb-6 flex gap-2">
            <span>Test Creation</span> / <span>Create Test</span> / <span className="text-slate-600">{testType}</span>
          </div>

          <div className="inline-flex bg-slate-100 p-1 rounded-xl mb-8">
            {['Chapter Wise', 'PYQ', 'Mock Test'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setTestType(tab)}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${testType === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* INPUT FORMS FIELDS LAYOUT LAYER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {/* Subject Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Subject</label>
              <div className="relative">
                <select
                  className={`w-full appearance-none bg-white border border-slate-200 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-blue-400 transition ${selectedSubject ? 'text-slate-700' : 'text-slate-400'}`}
                  onFocus={fetchSubjects}
                  value={selectedSubject}
                  onChange={(e) => {
                    const targetSubId = e.target.value;
                    setSelectedSubject(targetSubId);
                    setSelectedTopics([]);
                    setSelectedSubTopics([]);
                    setTopics([]);
                    setSubTopics([]);
                    fetchTopicsForSubject(targetSubId);
                  }}
                >
                  <option value="">{loading && subjects.length === 0 ? 'Loading subjects...' : 'Select a subject'}</option>
                  {subjects?.map((subject) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Name of Test Field Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Name of Test</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Enter name of Test"
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 placeholder-slate-300 text-slate-700 focus:outline-none focus:border-blue-400 transition"
              />
            </div>

            {/* TOPIC CHECKBOX MULTI-SELECT DROPDOWN */}
            <div className="flex flex-col gap-2 relative" onClick={(e) => e.stopPropagation()}>
              <label className={`text-sm font-semibold ${selectedSubject ? 'text-slate-700' : 'text-slate-300'}`}>Topic</label>
              <button
                type="button"
                disabled={!selectedSubject}
                onClick={() => {
                  setIsSubTopicMenuOpen(false);
                  setIsTopicMenuOpen(!isTopicMenuOpen);
                }}
                className={`w-full flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3 text-left transition ${!selectedSubject ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-white text-slate-700'}`}
              >
                <span>
                  {selectedTopics.length === 0
                    ? 'Select a topic'
                    : `${selectedTopics.length} topic(s) selected`}
                </span>
                <ChevronDown size={18} className="text-slate-400" />
              </button>

              {isTopicMenuOpen && selectedSubject && (
                <div className="absolute top-[4.5rem] w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto p-3 space-y-2 z-30">
                  {topics.map((t) => (
                    <label key={t.id} className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 rounded-md cursor-pointer text-sm font-medium text-slate-600 transition select-none">
                      <input
                        type="checkbox"
                        checked={selectedTopics.includes(String(t.id))}
                        onChange={() => handleTopicToggle(String(t.id))}
                        className="rounded text-blue-600 border-slate-300 focus:ring-blue-500 w-4 h-4 transition"
                      />
                      <span>{t.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* SUB-TOPIC CHECKBOX MULTI-SELECT DROPDOWN */}
            <div className="flex flex-col gap-2 relative" onClick={(e) => e.stopPropagation()}>
              <label className={`text-sm font-semibold ${selectedTopics.length > 0 ? 'text-slate-700' : 'text-slate-300'}`}>Sub Topic</label>
              <button
                type="button"
                disabled={selectedTopics.length === 0}
                onClick={() => {
                  setIsTopicMenuOpen(false);
                  const targetNextOpenState = !isSubTopicMenuOpen;
                  setIsSubTopicMenuOpen(targetNextOpenState);
                  if (targetNextOpenState) {
                    handleSubTopicMenuFocusFetch();
                  }
                }}
                className={`w-full flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3 text-left transition ${selectedTopics.length === 0 ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-white text-slate-700'}`}
              >
                <span>
                  {selectedSubTopics.length === 0
                    ? 'Select a sub-topic'
                    : `${selectedSubTopics.length} sub-topic(s) selected`}
                </span>
                <ChevronDown size={18} className="text-slate-400" />
              </button>

              {isSubTopicMenuOpen && selectedTopics.length > 0 && (
                <div className="absolute top-[4.5rem] w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto p-3 space-y-2 z-30">
                  {loading ? (
                    <div className="text-sm text-slate-400 text-center py-4 font-bold tracking-wider animate-pulse">Loading sub-topics...</div>
                  ) : subTopics.length === 0 ? (
                    <div className="text-sm text-slate-400 text-center py-4 font-medium">Select a topic first</div>
                  ) : (
                    subTopics.map((st) => (
                      <label key={st.id} className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 rounded-md cursor-pointer text-sm font-medium text-slate-600 transition select-none">
                        <input
                          type="checkbox"
                          checked={selectedSubTopics.includes(String(st.id))}
                          onChange={() => handleSubTopicToggle(String(st.id))}
                          className="rounded text-blue-600 border-slate-300 focus:ring-blue-500 w-4 h-4 transition"
                        />
                        <span>{st.name}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Duration Input Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Duration (Minutes)</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Enter the time"
                className={`w-full bg-white border rounded-lg px-4 py-3 placeholder-slate-300 text-slate-700 focus:outline-none transition ${duration && !isDurationValid ? 'border-red-400 focus:border-red-400 bg-red-50/10' : 'border-slate-200 focus:border-blue-400'}`}
              />
              {duration && !isDurationValid && <p className="text-[10px] font-bold text-red-500">- Duration value must evaluate onto a valid positive integer numeric value.</p>}
            </div>

            {/* Difficulty selectors */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Test Difficulty Level</label>
              <div className="flex items-center gap-6 h-full py-3">
                {['Easy', 'Medium', 'Difficult'].map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600 select-none">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={difficulty === level}
                      onChange={() => setDifficulty(level)}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Marking Weight Systems Panel */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Marking Scheme:</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-600 font-medium">Wrong Answer</label>
                <input type="number" value={marking.wrong} onChange={(e) => setMarking(prev => ({ ...prev, wrong: parseInt(e.target.value) || 0 }))} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 font-medium focus:outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-600 font-medium">Unattempted</label>
                <input type="number" value={marking.unattempted} onChange={(e) => setMarking(prev => ({ ...prev, unattempted: parseInt(e.target.value) || 0 }))} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 font-medium focus:outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-600 font-medium">Correct Answer</label>
                <input type="number" value={marking.correct} onChange={(e) => setMarking(prev => ({ ...prev, correct: parseInt(e.target.value) || 0 }))} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 font-medium focus:outline-none" />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-600 font-medium">No of Questions</label>
                <input
                  type="text"
                  placeholder="Ex: 45"
                  value={noOfQuestions}
                  onChange={(e) => setNoOfQuestions(e.target.value)}
                  className={`w-full bg-white border rounded-lg px-3 py-2.5 placeholder-slate-300 text-slate-700 focus:outline-none font-medium ${noOfQuestions && !isQuestionsCountValid ? 'border-red-400 bg-red-50/10' : 'border-slate-200 focus:border-blue-400'}`}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400 font-medium">Total Marks</label>
                <input type="text" disabled value={totalMarks > 0 ? `${totalMarks} Marks` : ""} placeholder="Ex: 225 Marks" className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 placeholder-slate-300 text-slate-700 font-semibold cursor-not-allowed" />
              </div>
            </div>
            {noOfQuestions && !isQuestionsCountValid && <p className="text-[10px] font-bold text-red-500 mt-2">- Question fields must evaluate to a valid positive integer.</p>}
          </div>

          {/* 👑 ADDED: LIVE API DYNAMIC ERROR BANNER CONTROL ELEMENT PANEL */}
          {apiError && (
            <div className="mt-8 max-w-5xl w-full bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700 text-sm font-semibold shadow-sm animate-fade-in select-none">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-bold uppercase tracking-wider block text-[10px] text-red-500 mb-0.5">Configuration Conflict Rejected</span>
                {apiError}
              </div>
            </div>
          )}

          {/* ACTION FOOTER */}
          <div className="flex justify-end items-center gap-4 mt-12">
            <button 
              type="button" 
              onClick={onCloseEditModal} 
              className="px-6 py-2.5 text-slate-500 hover:text-slate-800 text-sm font-semibold transition"
            >
              Cancel
            </button>
            
            <button
              type="button"
              disabled={isFormInvalid || isCreatingTest}
              onClick={() => executeTestConfigurationSubmit('draft')}
              className={`px-6 py-2.5 font-semibold text-sm rounded-lg border transition ${
                isFormInvalid || isCreatingTest 
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed' 
                  : 'border-blue-600 text-blue-600 hover:bg-blue-50/50'
              }`}
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={isFormInvalid || isCreatingTest}
              onClick={() => executeTestConfigurationSubmit('builder')}
              className={`px-8 py-2.5 font-semibold text-sm rounded-lg shadow-sm transition-all ${
                isFormInvalid || isCreatingTest 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isCreatingTest ? "Processing..." : "Next to Add Questions"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}