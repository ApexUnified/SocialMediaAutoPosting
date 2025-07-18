import { useState } from "react";
import PostsDashboard from "../../components/post/PostsDashboard";
import PublisherForm from "../../components/post/PublisherForm";

// Main Application Component
const SocialMediaPublisher = () => {
  const [currentView, setCurrentView] = useState("dashboard"); // 'dashboard' or 'create'
  console.log("currentView: ", currentView);

  const handleCreatePost = () => {
    setCurrentView("create");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  const handlePublishSuccess = () => {
    setCurrentView("dashboard");
    // You might want to refresh the posts here
    window.location.reload(); // Simple refresh, or implement proper state management
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {currentView === "dashboard" ? (
        <PostsDashboard onCreatePost={handleCreatePost} />
      ) : (
        <PublisherForm
          onBack={handleBackToDashboard}
          onSuccess={handlePublishSuccess}
        />
      )}
    </div>
  );
};

export default SocialMediaPublisher;
