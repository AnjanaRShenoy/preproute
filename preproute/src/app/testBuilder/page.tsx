import TestBuilder from "../../components/testBuilder";

export default function Home() {
  const defaultTestDetails = {
    testType: 'Chapter Wise',
    testName: 'Initial Test Setup',
    subjectName: 'Select a subject',
    topicName: 'Select a topic',
    subTopicName: 'Select a subtopic',
    difficulty: 'Easy',
    duration: '0',
    noOfQuestions: 0,
    totalMarks: 0,
  };

  const handleBackNavigation = () => {
    console.log("Back navigation clicked from root home page");
  };

  // 👑 1. Define a dummy fallback router for your home preview environment
  const handleNavigationMock = (step: number | 'dashboard') => {
    console.log(`Mock routing activated. Target route step index would be: ${step}`);
  };

  return (
    // 👑 2. THE FIX: Pass navigateTo into your component to clear ts(2741)
    <TestBuilder 
      testDetails={defaultTestDetails} 
      onBack={handleBackNavigation} 
      navigateTo={handleNavigationMock} 
    />
  );
}