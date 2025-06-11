
import { useState, useEffect } from "react";
import LoginPage from "@/components/LoginPage";
import Onboarding from "@/components/Onboarding";
import UsernamePrompt from "@/components/UsernamePrompt";
import TaskReminderNotification from "@/components/TaskReminderNotification";
import Navigation from "@/components/Navigation";
import HomePage from "./HomePage";
import TasksPage from "./TasksPage";
import ExplorePage from "./ExplorePage";
import ProfilePage from "./ProfilePage";
import { useAppContext } from "@/context/AppContext";

const Index = () => {
  const { 
    isLoggedIn, 
    showOnboarding, 
    showUsernamePrompt, 
    activeTab,
    setActiveTab,
    setOnboardingComplete,
    setUsernamePromptComplete,
    completeTask
  } = useAppContext();

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setOnboardingComplete(true)} />;
  }

  if (showUsernamePrompt) {
    return <UsernamePrompt onComplete={() => setUsernamePromptComplete(true)} />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'tasks':
        return <TasksPage />;
      case 'explore':
        return <ExplorePage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <main className="pb-20 min-h-screen">
        {renderActiveTab()}
      </main>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <TaskReminderNotification onMarkComplete={completeTask} />
    </div>
  );
};

export default Index;
