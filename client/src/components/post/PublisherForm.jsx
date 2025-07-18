import { useEffect, useState } from "react";
import { blogService } from "../../services/blogService";
import { ArrowLeft, ChevronDown, ChevronUp, Calendar, X } from "lucide-react";
import PlatformSelector from "./PlatformSelector";
import AIGenerator from "./AIGenerator";
import MediaURLManager from "./MediaURLManager";
import { toast } from "react-toastify";
const API_URL = import.meta.env.VITE_API_BASE_URL;
import axios from "axios";

// Publisher Form Component
const PublisherForm = ({ onBack, onSuccess }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorResults, setErrorResults] = useState([]);
  const [formData, setFormData] = useState({
    postTitle: "",
    subreddit: "",
    redditLink: "",
    postText: "",
    shortenLinks: false,
    xThread: false,
    youtubeShorts: false,
    youtubeVisibility: "private",
    instagramPostType: "regular",
    facebookPostType: "regular",
    snapchatPostType: "story",
    aiGenerated: false,
    prompt: "",
    autoTranslate: false,
    contentType: "general",
    mediaUrls: [],
  });

  // its for getting the blog id If Post Fails On Social Media To Prevent Duplicate Blogs
  const [blogId, setBlogId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log(selectedPlatforms);
  }, [selectedPlatforms]);

  useEffect(() => {
    console.log(formData.snapchatPostType);
  }, [formData.snapchatPostType]);

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );

    if (platformId === "reddit") {
      setFormData((prev) => ({
        ...prev,
        contentType: "reddit",
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddMediaUrl = (url) => {
    setFormData((prev) => ({
      ...prev,
      mediaUrls: [...prev.mediaUrls, url],
    }));
  };

  const handleRemoveMediaUrl = (index) => {
    setFormData((prev) => ({
      ...prev,
      mediaUrls: prev.mediaUrls.filter((_, i) => i !== index),
    }));
  };

  const handleAIGenerate = async () => {
    if (!selectedPlatforms.length) {
      toast.error("Please select at least one platform");
      return;
    }
    if (!formData.prompt) {
      toast.error("Please enter a prompt for AI generation");
      return;
    }

    setIsGenerating(true);
    try {
      const generatedContent = await blogService.generateContent({
        prompt: formData.prompt,
        platforms: selectedPlatforms,
        contentType: formData.contentType,
      });

      setFormData((prev) => ({
        ...prev,
        postText: generatedContent.content,
        postTitle: generatedContent.title || prev.postTitle,
        aiGenerated: true,
        mediaUrls: generatedContent.mediaUrls || prev.mediaUrls,
      }));

      toast.success("Content generated successfully!");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(error.message || "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  // Validation For Video
  function isVideo(url) {
    const videoExtensions = [".mp4", ".mov", ".avi", ".mkv", ".webm"];
    return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
  }

  // Validation For Media Size
  async function checkMediaSize(url, maxSizeMB, platformName) {
    try {
      const response = await axios.post(`${API_URL}/blogs/validate-media`, {
        url,
        maxSizeMB,
        platformName,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to validate media"
      );
    }
  }

  // Media URL And Extension Checker
  function isValidExtension(url, allowedImageExtensions) {
    try {
      const pathname = new URL(url).pathname;
      const segments = pathname.split("/");
      const file = segments[segments.length - 1];

      if (!file.includes(".")) {
        throw new Error(
          "Please enter a valid media URL. Accepted extensions: " +
            allowedImageExtensions.join(", ")
        );
      }

      const ext = file.split(".").pop().toLowerCase();
      if (!allowedImageExtensions.includes(ext)) {
        throw new Error(
          `Invalid media extension '${ext}'. Accepted: ${allowedImageExtensions.join(
            ", "
          )}`
        );
      }

      return true;
    } catch (err) {
      throw new Error(
        "Please enter a valid media URL. Accepted extensions: " +
          allowedImageExtensions.join(", ")
      );
    }
  }

  // Validation of Post
  async function validatePostBeforeSend(selectedPlatforms, formData) {
    const mediaRequiredPlatforms = [
      "instagram",
      "snapchat",
      "pinterest",
      "youtube",
      "tiktok",
      "gmb",
    ];

    const textRequiredPlatforms = [
      "facebook",
      "linkedin",
      "x/twitter",
      "gmb",
      "telegram",
      "bluesky",
      "reddit",
    ];

    const platformNames = {
      "x/twitter": "X (Twitter)",
      gmb: "Google Business",
      youtube: "YouTube",
      tiktok: "TikTok",
      facebook: "Facebook",
      linkedin: "LinkedIn",
      instagram: "Instagram",
      snapchat: "Snapchat",
      pinterest: "Pinterest",
      telegram: "Telegram",
      threads: "Threads",
      bluesky: "Bluesky",
      reddit: "Reddit",
    };

    // 1. Validate platforms that require media
    const missingMedia = selectedPlatforms.filter(
      (platform) =>
        mediaRequiredPlatforms.includes(platform.toLowerCase()) &&
        (!formData.mediaUrls || formData.mediaUrls.length === 0)
    );

    const text = formData.postText || "";
    const trimmed = text.trim();
    const mediaUrls = formData.mediaUrls;
    const videos = mediaUrls.filter((url) => isVideo(url));
    const images = mediaUrls.filter((url) => !isVideo(url));

    if (missingMedia.length > 0) {
      const platformList = missingMedia
        .map((p) => platformNames[p.toLowerCase()] || p)
        .join(", ");
      toast.error(`Please upload at least one URL for: ${platformList}`);
      return false;
    }

    // 2. Validate platforms that require post title or post text
    const missingText = selectedPlatforms.filter(
      (platform) =>
        (textRequiredPlatforms.includes(platform.toLowerCase()) &&
          !formData.postTitle.trim()) ||
        !formData.postText.trim()
    );

    if (missingText.length > 0) {
      const platformList = missingText
        .map((p) => platformNames[p.toLowerCase()] || p)
        .join(", ");
      toast.error(`Please enter a post title AND text for: ${platformList}`);
      return false;
    }

    // 3. Reddit specific: Require redditLink
    if (selectedPlatforms.includes("reddit") && !formData.redditLink.trim()) {
      toast.error("Please enter a valid Reddit link");
      return false;
    }

    if (selectedPlatforms.includes("gmb")) {
      if (trimmed.length > 1500) {
        toast.error(
          `Google Business  Post Text Length Cannot Be Greater Than 1500 characters. Your post is ${trimmed.length} characters.`
        );
        return false;
      }

      if (images.length > 1) {
        toast.error("Please upload only 1 image for Google Business");
        return false;
      }

      if (videos.length > 0) {
        toast.error("Google Business Doesnt supports video.");
        return false;
      }

      if (videos.length > 0 && images.length > 0) {
        toast.error("Google Business Doesnt accept both image and video.");
        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];
        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 5 MB each)
          await checkMediaSize(imgUrl, 5, "Google Business");
        }
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("bluesky")) {
      if (trimmed.length > 299) {
        toast.error(
          `Bluesky  Post Text Length Cannot Be Greater Than 299 characters. Your post is ${trimmed.length} characters.`
        );
        return false;
      }

      if (videos.length > 1) {
        toast.error("BlueSky supports only one video at a time.");
        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.error(
          "BlueSky cannot accept both image and video in the same post."
        );
        return false;
      }

      if (images.length > 4) {
        toast.error("BlueSky supports up to 4 images only.");
        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];
        const videoExtensions = ["mp4"];

        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);
          // Check image sizes (max 1 MB each)
          await checkMediaSize(imgUrl, 1, "BlueSky");
        }

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 100 MB for BlueSky)
          await checkMediaSize(videoUrl, 100, "BlueSky");
        }
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("instagram")) {
      if (trimmed.length > 2200) {
        toast.error(
          `Instagram  Post Text Length Cannot Be Greater Than 2200 characters. Your post is ${trimmed.length} characters.`
        );
        return false;
      }

      if (videos.length > 1) {
        toast.error("Instagram supports only one video at a time.");
        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.error(
          "Instagram cannot accept both image and video in the same post."
        );
        return false;
      }

      if (images.length > 10) {
        toast.error("Instagram supports up to 10 images only.");
        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];
        const videoExtensions = ["mp4", "mov"];

        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 8 MB each)
          await checkMediaSize(imgUrl, 8, "instagram");
        }

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 100 MB for instagram)
          await checkMediaSize(videoUrl, 100, "instagram");
        }
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("linkedin")) {
      console.log(trimmed.length);
      if (trimmed.length > 3000) {
        toast.error(
          `LinkedIn  Post Text Length Cannot Be Greater Than 3000 characters. Your post is ${trimmed.length} characters.`
        );
        return false;
      }

      if (videos.length > 1) {
        toast.error("Linkedin supports only one video at a time.");
        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.error(
          "Linkedin cannot accept both image and video in the same post."
        );
        return false;
      }

      if (images.length > 9) {
        toast.error("Linkedin supports up to 9 images only.");
        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];
        const videoExtensions = ["mp4"];

        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 5 MB each)
          await checkMediaSize(imgUrl, 5, "Linkedin");
        }

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 200 MB for Linkedin)
          await checkMediaSize(videoUrl, 200, "Linkedin");
        }
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("facebook")) {
      if (videos.length > 1) {
        toast.error("Facebook supports only one video at a time.");
        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.error(
          "Facebook cannot accept both image and video in the same post."
        );
        return false;
      }

      if (images.length > 10) {
        toast.error("Facebook supports up to 10 images only.");
        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];
        const videoExtensions = ["mp4", "mov", "avi"];
        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 10 MB each)
          await checkMediaSize(imgUrl, 10, "Facebook");
        }

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 2 GB for Facebook)
          await checkMediaSize(videoUrl, 2000, "Facebook");
        }
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("reddit")) {
      if (trimmed.length > 5000) {
        toast.error(
          `Reddit  Post Text Length Cannot Be Greater Than 5000 characters. Your post is ${trimmed.length} characters.`
        );
        return false;
      }

      if (videos.length > 0) {
        toast.error("Reddit Doesnt supports video ");
        return false;
      }

      if (videos.length > 0 && images.length > 0) {
        toast.error("Reddit doesnt accept both image and video");
        return false;
      }

      if (images.length > 1) {
        toast.error("Reddit supports up to 1 images only Per Post.");
        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];

        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);
          // Check image sizes (max 10 MB each)
          await checkMediaSize(imgUrl, 10, "Reddit");
        }
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("pinterest")) {
      if (trimmed.length > 500) {
        toast.error(
          `Pinterest  Post Text Length Cannot Be Greater Than 500 characters. Your post is ${trimmed.length} characters.`
        );
        return false;
      }

      if (videos.length > 0) {
        toast.error("Pinterest Doesnt supports video ");
        return false;
      }

      if (videos.length > 0 && images.length > 0) {
        toast.error("Pinterest doesnt accept both image and video");
        return false;
      }

      if (images.length > 5) {
        toast.error("Pinterest supports up to 5 images only Per Post.");
        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];

        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 20 MB each)
          await checkMediaSize(imgUrl, 20, "Pinterest");
        }
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("telegram")) {
      if (trimmed.length > 1024) {
        toast.error(
          `Telegram  Post Text Length Cannot Be Greater Than 1024 characters. Your post is ${trimmed.length} characters.`
        );
        return false;
      }

      if (videos.length > 0) {
        toast.error("Telegram Doesnt supports Videos");
        return false;
      }

      if (images.length > 0) {
        toast.error("Telegram Doesnt supports images");
        return false;
      }

      // try {
      //   const imageExtensions = ["jpg", "jpeg", "png"];
      //   const videoExtensions = ["mp4"];

      //   for (const imgUrl of images) {
      //     isValidExtension(imgUrl, imageExtensions);

      //     // Check image sizes (max 5 MB each)
      //     await checkMediaSize(imgUrl, 5, "Telegram");
      //   }

      //   for (const videoUrl of videos) {
      //     isValidExtension(videoUrl, videoExtensions);

      //     // Check video size (max 20 MB for Telegram)
      //     await checkMediaSize(videoUrl, 20, "Telegram");
      //   }
      // } catch (err) {
      //   toast.error(err.message);
      //   return false;
      // }
    }

    if (selectedPlatforms.includes("threads")) {
      if (trimmed.length > 500) {
        toast.error(
          `Threads  Post Text Length Cannot Be Greater Than 500 characters. Your post is ${trimmed.length} characters.`
        );
        return false;
      }

      if (videos.length > 1) {
        toast.error("Threads Only supports 1 video Per Post ");
        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.error("Threads doesnt accept both image and video");
        return false;
      }

      if (images.length > 20) {
        toast.error("Threads supports up to 20 images only Per Post.");
        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];
        const videoExtensions = ["mp4", "mov"];
        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 8 MB each)
          await checkMediaSize(imgUrl, 8, "Threads");
        }

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 1 GB for Threads)
          await checkMediaSize(videoUrl, 1000, "Threads");
        }
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("tiktok")) {
      if (trimmed.length > 2200) {
        toast.error(
          `Tiktok  Post Text Length Cannot Be Greater Than 2200 characters. Your post is ${trimmed.length} characters.`
        );
        return false;
      }

      if (videos.length > 1) {
        toast.error("TikTok Only supports 1 video Per Post ");
        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.error("TikTok doesnt accept both image and video");
        return false;
      }

      if (images.length > 0) {
        toast.error("TikTok Doesnt supports images .");
        return false;
      }

      try {
        const videoExtensions = ["mp4", "mov", "webm"];

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 1 GB for Tiktok)
          await checkMediaSize(videoUrl, 1000, "Tiktok");
        }
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("twitter")) {
      if (trimmed.length > 280) {
        toast.error(
          `Twitter  Post Text Length Cannot Be Greater Than 280 characters. Your post is ${trimmed.length} characters.`
        );
        return false;
      }

      if (videos.length > 4) {
        toast.error("Twitter Only supports 4 video Per Post ");
        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.error("Twitter doesnt accept both image and video");
        return false;
      }

      if (images.length > 4) {
        toast.error("Twitter supports up to 4 images only Per Post.");
        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png", "webp"];
        const videoExtensions = ["mp4", "mov"];

        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 5 MB each)
          await checkMediaSize(imgUrl, 5, "Twitter");
        }

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 512 MB for Twitter)
          await checkMediaSize(videoUrl, 512, "Twitter");
        }
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("youtube")) {
      if (trimmed.length > 5000) {
        toast.error(
          `Youtube Post Text Length Cannot Be Greater Than 5000 characters. Your post is ${trimmed.length} characters.`
        );
        return false;
      }

      if (videos.length > 1) {
        toast.error("Youtube Only supports 1 video Per Post");
        return false;
      }

      if (videos.length > 0 && images.length > 0) {
        toast.error("Youtube doesnt accept both image and video");
        return false;
      }

      if (images.length > 0) {
        toast.error("Youtube Doesnt Support Images");
        return false;
      }

      try {
        const videoExtensions = ["mp4", "mov"];

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 4 GB for Youtube)
          await checkMediaSize(videoUrl, 4000, "Youtube");
        }
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("snapchat")) {
      if (!formData.snapchatPostType === "spotlight") {
        if (trimmed.length > 500) {
          toast.error(
            `SnapChat  Post Text Length Cannot Be Greater Than 500 characters. Your post is ${trimmed.length} characters.`
          );
          return false;
        }
      }

      if (videos.length > 1) {
        toast.error("Snapchat Only supports 1 video Per Post");
        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.error("Snapchat doesnt accept both image and video");
        return false;
      }

      if (images.length > 1) {
        toast.error("Snapchat supports up to 1 image only Per Post.");
        return false;
      }

      if (formData.snapchatPostType === "spotlight") {
        if (images.length > 0) {
          toast.error("Snapchat Spotlight doesnt accept images");
          return false;
        }

        if (trimmed.length > 160) {
          toast.error(
            `SnapChat Spotlight  Post Text Length Cannot Be Greater Than 160 characters. Your post is ${trimmed.length} characters.`
          );
          return false;
        }
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];
        const videoExtensions = ["mp4"];

        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 20 MB each)
          await checkMediaSize(imgUrl, 20, "SnapChat");
        }

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 500 MB for SnapChat Story)
          await checkMediaSize(videoUrl, 500, "SnapChat");
        }
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    }

    return true; // ✅ All validations passed
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);

    if (!selectedPlatforms.length) {
      toast.error("Please select at least one platform");
      setIsSubmitting(false);
      return;
    }

    const isValid = await validatePostBeforeSend(selectedPlatforms, formData);
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        title: formData.postTitle,
        blogId: blogId,
        content: formData.postText,
        platforms: selectedPlatforms,
        mediaUrls: formData.mediaUrls || [],
        autoShare: true,
        autoTranslate: formData.autoTranslate,
        aiGenerated: formData.aiGenerated,
        contentType: formData.contentType,
        metadata: {
          subreddit: formData.subreddit,
          redditLink: formData.redditLink,
          youtubeVisibility: formData.youtubeVisibility,
          instagramPostType: formData.instagramPostType,
          facebookPostType: formData.facebookPostType,
          snapchatPostType: formData.snapchatPostType,
          youtubeShorts: formData.youtubeShorts,
          xThread: formData.xThread,
          shortenLinks: formData.shortenLinks,
        },
      };

      const response = await blogService.create(payload);
      console.log(response);

      if (response.success) {
        console.log("✅ Blog created successfully.");

        // Check if sharing to social media failed
        if (response.socialMediaStatus && !response.socialMediaStatus.success) {
          console.warn("⚠️ Some social media shares failed:");
          console.log(response.socialMediaStatus.results);
          setErrorResults(response.socialMediaStatus.results || []);
          setBlogId(response.blog._id);
          setShowErrorModal(true);
        } else {
          console.log("🎉 Shared on all platforms successfully!");
          toast.success("Post created and distributed successfully!");
          onSuccess();
        }
      } else {
        // Handle total failure of blog creation
        console.error("❌ Failed to create the blog.");
        alert("Failed to create blog. Please try again.");
      }
    } catch (error) {
      toast.error(error.message);
      if (error.results) {
        setErrorResults(error.results || []);
        setShowErrorModal(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Error Modal Component
  const ErrorModal = () => {
    if (!showErrorModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
        <div className="w-full max-w-lg p-6 mx-4 bg-white rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Publishing Errors
            </h3>
            <button
              onClick={() => setShowErrorModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          <div className="space-y-3  max-h-[50vh] overflow-y-auto">
            {errorResults.map((error, index) => (
              <div key={index} className="p-3 rounded-md bg-red-50">
                <p className="font-medium text-red-700">{error.platform}</p>
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowErrorModal(false)}
              className="px-4 py-2 text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <ErrorModal />
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 rounded-md hover:bg-gray-100">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Publish a Post</h1>
            <p className="text-sm text-gray-600">
              Create and distribute content across multiple platforms
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-6">
          {/* Platform Selection */}
          <PlatformSelector
            selectedPlatforms={selectedPlatforms}
            onToggle={handlePlatformToggle}
          />

          {/* AI Generation */}
          <AIGenerator
            formData={formData}
            onInputChange={handleInputChange}
            onGenerate={handleAIGenerate}
            isGenerating={isGenerating}
          />

          {selectedPlatforms.includes("snapchat") && (
            <div className="bg-yellow-300 rounded-2xl p-2 my-5  transition-all ease-in-out duration-300">
              <p className="text-lg">
                Note: Please ensure that you wait at least 5 minutes before
                uploading another post to Snapchat. Continuous or rapid uploads
                may result in temporary restrictions or failed attempts.
              </p>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Post Title
                </label>
                <input
                  type="text"
                  name="postTitle"
                  value={formData.postTitle}
                  onChange={handleInputChange}
                  placeholder="Enter post title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {selectedPlatforms.includes("reddit") && (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Subreddit
                    </label>
                    <input
                      type="text"
                      name="subreddit"
                      value={formData.subreddit}
                      onChange={handleInputChange}
                      placeholder="Enter subreddit name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Reddit Link
                    </label>
                    <input
                      type="text"
                      name="redditLink"
                      value={formData.redditLink}
                      onChange={handleInputChange}
                      placeholder="Enter Reddit link (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Snapchat Post Type Selection */}
              {selectedPlatforms.includes("snapchat") && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Snapchat Post Type
                  </label>
                  <select
                    name="snapchatPostType"
                    value={formData.snapchatPostType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="story">Story</option>
                    <option value="saved_story">Saved Story</option>
                    <option value="spotlight">Spotlight</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Choose how your content will be shared on Snapchat
                  </p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Additional Options
                </label>
                <div className="space-y-3 text-sm">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="autoTranslate"
                      checked={formData.autoTranslate}
                      onChange={handleInputChange}
                      className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>Auto Translate</span>
                  </label>
                  <p className="ml-6 text-xs text-gray-500">
                    Automatically translate content to multiple languages
                  </p>

                  {/* Shorten Links Option */}
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="shortenLinks"
                      checked={formData.shortenLinks}
                      onChange={handleInputChange}
                      className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>Shorten Links</span>
                  </label>
                  <p className="ml-6 text-xs text-gray-500">
                    Track clicks and demographics
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Post Text */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Post Text
            </label>
            <textarea
              name="postText"
              value={formData.postText}
              onChange={handleInputChange}
              placeholder="Enter post text"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Media URLs */}
          <MediaURLManager
            mediaUrls={formData.mediaUrls}
            onAdd={handleAddMediaUrl}
            onRemove={handleRemoveMediaUrl}
          />

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="flex items-center px-6 py-2 space-x-2 text-blue-700 transition-colors bg-blue-100 rounded-md hover:bg-blue-200"
            >
              <Calendar size={16} />
              <span>Schedule Post</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedPlatforms.length === 0}
              className={`flex items-center px-6 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <span className="flex justify-center items-center p-2 gap-3 ">
                Publish Post
                {isSubmitting && (
                  <>
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        class="w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                    </div>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublisherForm;
