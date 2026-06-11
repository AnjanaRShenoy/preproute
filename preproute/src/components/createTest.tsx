"use client";

import React, { useState } from 'react';
import { ChevronDown, LayoutDashboard, FileEdit, BarChart2 } from 'lucide-react';
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

export default function CreateTest() {
  const [testType, setTestType] = useState('Chapter Wise');
  const [difficulty, setDifficulty] = useState('Easy');
  const [marking, setMarking] = useState({ wrong: -1, unattempted: 0, correct: 5 });

  // Controlled field states for validation checks
  const [testName, setTestName] = useState('');
  const [duration, setDuration] = useState('');
  const [noOfQuestions, setNoOfQuestions] = useState<number | "">("");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');

  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');

  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [selectedSubTopic, setSelectedSubTopic] = useState('');

  const [hasFetchedSubjects, setHasFetchedSubjects] = useState(false);
  const [hasFetchedTopics, setHasFetchedTopics] = useState(false);
  const [hasFetchedSubTopics, setHasFetchedSubTopics] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [createdTestId, setCreatedTestId] = useState('');
  const [isCreatingTest, setIsCreatingTest] = useState(false);

  const activeSubjectObj = subjects.find(s => s.id == selectedSubject);
  const activeTopicObj = topics.find(t => t.id == selectedTopic);
  const activeSubTopicObj = subTopics.find(s => s.id == selectedSubTopic);

  // Dynamic Total Marks Calculation
  const totalMarks = noOfQuestions !== "" ? noOfQuestions * marking.correct : 0;

  // Form Field Validation Check (returns true if any required field is missing)
  const isFormInvalid =
    !selectedSubject ||
    !testName.trim() ||
    !selectedTopic ||
    // !selectedSubTopic ||
    !duration.trim() ||
    noOfQuestions === "" ||
    noOfQuestions <= 0;

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const myToken = getCookie('token');

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
      setSubjects(data.data.data);
      setHasFetchedSubjects(true);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    if (!selectedSubject || hasFetchedTopics) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/topics/subjects/${selectedSubject}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${myToken}`
        },
      });
      const data = await response.json();
      setTopics(data.data.data);
      setHasFetchedTopics(true);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubTopics = async () => {
    if (!selectedTopic || hasFetchedSubTopics) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/sub-topics/${selectedTopic}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${myToken}`
        },
      });
      const data = await response.json();

      const apiSubTopics = data.data.data || [];

      const generalElement: SubTopic = {
        id: `general-${selectedTopic}`,
        name: "General",
        topic_id: selectedTopic
      };

      setSubTopics([...apiSubTopics]);
      setHasFetchedSubTopics(true);
    } catch (error) {
      console.error("Error fetching sub-topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestSubmit = async () => {
    if (isFormInvalid || isCreatingTest) return;

    setIsCreatingTest(true);
    try {
      // Maps your frontend fields to the exact parameters required by POST /tests (API 6)
      const payload = {
        name: testName,
        // 👑 THE FIX: Formats "Chapter Wise" into "chapterwise" to satisfy the database enum constraint
        type: testType === "Chapter Wise" ? "chapterwise" : testType.toLowerCase().replace(/\s+/g, ""),
        subject: String(selectedSubject),
        topics: [String(selectedTopic)],

        // 👑 THE FIX: If selectedSubTopic is empty or holds a fallback placeholder, it sends a clean empty array []
        sub_topics: selectedSubTopic && selectedSubTopic.trim() !== "" ? [String(selectedSubTopic)] : [],

        correct_marks: marking.correct,
        wrong_marks: marking.wrong,
        unattempt_marks: marking.unattempted,
        difficulty: difficulty.toLowerCase(),
        total_time: Number(duration),
        total_marks: totalMarks,
        total_questions: Number(noOfQuestions),
        status: "draft"
      };
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${myToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && (data.status === "success" || data.success)) {
        // Capture the real database ID returned by your backend 
        const realDatabaseId = data.data?.id || data.data?.uuid;
        setCreatedTestId(realDatabaseId);

        // Advance cleanly to Step 2 Workspace now that we have a real ID
        setStep(2);
      } else {
        alert(`Failed to create test profile: ${data.message || 'Server error'}`);
      }
    } catch (error) {
      console.error("Error creating test instance:", error);
      alert("A network error occurred while communicating with the server.");
    } finally {
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
          subjectName: activeSubjectObj ? activeSubjectObj.name : 'Unknown',
          topicName: activeTopicObj ? activeTopicObj.name : 'Unknown',
          subTopicName: activeSubTopicObj ? activeSubTopicObj.name : 'Unknown',
          difficulty: difficulty,
          duration: duration,
          noOfQuestions: Number(noOfQuestions),
          totalMarks: totalMarks
        }}
        // 👑 THE FIX: Swap out 'onComplete' for 'navigateTo' to match the updated Prop interface rules
        navigateTo={(targetStep) => {
          if (targetStep === 'dashboard') {
            window.location.href = "/dashboard";
          } else {
            setStep(targetStep); // Moves cleanly to step 3 (Publish Page)
          }
        }}
        onBack={() => setStep(1)}
      />
    );
  }

  // 👑 NEW WORKSPACE: Page 5 Preview & Publish Layout Workspace
  if (step === 3) {
    return (
      <PublishPreviewWorkspace
        testDetails={{
          id: createdTestId,
          testType: testType,
          testName: testName,
          subjectName: activeSubjectObj ? activeSubjectObj.name : 'Unknown',
          topicName: activeTopicObj ? activeTopicObj.name : 'Unknown',
          subTopicName: activeSubTopicObj ? activeSubTopicObj.name : 'Unknown',
          difficulty: difficulty,
          duration: duration,
          noOfQuestions: Number(noOfQuestions),
          totalMarks: totalMarks
        }}
        onBack={() => setStep(2)}
      />
    );
  }


  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-700 font-sans overflow-hidden">

      {/* FIXED SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between fixed h-full z-20">
        <div>
          <div className="p-6 flex items-center gap-2">
            <div className="relative w-40 h-10 mb-9">
              <Image
                src="/logos/Frame 1171277511.svg"
                alt="PrepRoute Logo"
                fill
                priority
                className="object-contain object-left"
              />
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

      {/* MAIN WORKSPACE VIEWPORT (Fills screen via left margin offset and full dimension configurations) */}
      <div className="flex-1 flex flex-col ml-64 h-full relative overflow-y-auto">

        {/* Custom standalone header rendered natively at the top of the flex stack */}
        <Header testType={testType} />

        {/* Form Container */}
        <main className="p-8 max-w-5xl w-full mx-auto flex-1">

          <div className="text-xs text-slate-400 font-medium mb-6 flex gap-2">
            <span>Test Creation</span> / <span>Create Test</span> / <span className="text-slate-600">{testType}</span>
          </div>

          {/* Test Category Tabs */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl mb-8">
            {['Chapter Wise', 'PYQ', 'Mock Test'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTestType(tab)}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${testType === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

            {/* Subject Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Subject</label>
              <div className="relative" >
                <select
                  className={`w-full appearance-none bg-white border border-slate-200 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-blue-400 transition ${selectedSubject ? 'text-slate-700' : 'text-slate-400'}`}
                  onFocus={fetchSubjects}
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setSelectedTopic('');
                    setSelectedSubTopic('');
                    setTopics([]);
                    setSubTopics([]);
                    setHasFetchedTopics(false);
                    setHasFetchedSubTopics(false);
                  }}
                >
                  <option value="">
                    {loading && !hasFetchedSubjects ? 'Loading subjects...' : 'Select a subject'}
                  </option>
                  {subjects?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Name of Test */}
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

            {/* Topic Dropdown */}
            <div className="flex flex-col gap-2">
              <label className={`text-sm font-semibold ${selectedSubject ? 'text-slate-700' : 'text-slate-300'}`}>Topic</label>
              <div className="relative">
                <select
                  disabled={!selectedSubject}
                  className={`w-full appearance-none border border-slate-200 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-blue-400 transition ${!selectedSubject ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-white text-slate-700'}`}
                  onFocus={fetchTopics}
                  value={selectedTopic}
                  onChange={(e) => {
                    setSelectedTopic(e.target.value);
                    setSelectedSubTopic('');
                    setSubTopics([]);
                    setHasFetchedSubTopics(false);
                  }}
                >
                  <option value="">
                    {!selectedSubject ? 'Select subject first' : loading && !hasFetchedTopics ? 'Loading topics...' : 'Select a topic'}
                  </option>
                  {topics?.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Sub Topic Dropdown */}
            <div className="flex flex-col gap-2">
              <label className={`text-sm font-semibold ${selectedTopic ? 'text-slate-700' : 'text-slate-300'}`}>Sub Topic</label>
              <div className="relative">
                <select
                  disabled={!selectedTopic}
                  className={`w-full appearance-none border border-slate-200 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:border-blue-400 transition ${!selectedTopic ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-white text-slate-700'}`}
                  onFocus={fetchSubTopics}
                  value={selectedSubTopic}
                  onChange={(e) => setSelectedSubTopic(e.target.value)}
                >
                  <option value="">
                    {!selectedTopic ? 'Select topic first' : loading && !hasFetchedSubTopics ? 'Loading sub-topics...' : 'Select a sub-topic'}
                  </option>
                  {subTopics?.map((subTopic) => (
                    <option key={subTopic.id} value={subTopic.id}>
                      {subTopic.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Duration (Minutes)</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Enter the time"
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 placeholder-slate-300 text-slate-700 focus:outline-none focus:border-blue-400 transition"
              />
            </div>

            {/* Difficulty Radio Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Test Difficulty Level</label>
              <div className="flex items-center gap-6 h-full py-3">
                {['Easy', 'Medium', 'Difficult'].map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={difficulty === level}
                      onChange={() => setDifficulty(level)}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span>{level}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Marking Scheme Section */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Marking Scheme:</h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-600 font-medium">Wrong Answer</label>
                <input
                  type="number"
                  value={marking.wrong}
                  onChange={(e) => setMarking(prev => ({ ...prev, wrong: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 font-medium focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-600 font-medium">Unattempted</label>
                <input
                  type="number"
                  value={marking.unattempted}
                  onChange={(e) => setMarking(prev => ({ ...prev, unattempted: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 font-medium focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-600 font-medium">Correct Answer</label>
                <input
                  type="number"
                  value={marking.correct}
                  onChange={(e) => setMarking(prev => ({ ...prev, correct: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 font-medium focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-600 font-medium">No of Questions</label>
                <input
                  type="number"
                  placeholder="Ex: 45"
                  value={noOfQuestions}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNoOfQuestions(val === "" ? "" : parseInt(val) || 0);
                  }}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 placeholder-slate-300 text-slate-700 focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-slate-400 font-medium">Total Marks</label>
                <input
                  type="text"
                  disabled
                  value={totalMarks > 0 ? `${totalMarks} Marks` : ""}
                  placeholder="Ex: 225 Marks"
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 placeholder-slate-300 text-slate-700 font-semibold cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Control Buttons */}
          <div className="flex justify-end gap-4 mt-12">
            <button className="px-8 py-2.5 bg-slate-50 hover:bg-slate-100 text-blue-600 font-semibold text-sm rounded-lg transition">
              Cancel
            </button>
            <button
              disabled={isFormInvalid || isCreatingTest}
              onClick={handleCreateTestSubmit}
              className={`px-8 py-2.5 font-semibold text-sm rounded-lg shadow-sm transition-all ${isFormInvalid || isCreatingTest
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
            >
              {isCreatingTest ? "Creating Test..." : "Next"}
            </button>
          </div>

        </main>
      </div>
    </div>
  );
}