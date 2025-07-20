import { useState } from "react";
import { blogService } from "../../services/blogService";
import { ArrowLeft, ChevronDown, ChevronUp, Calendar, X } from "lucide-react";
import PlatformSelector from "./PlatformSelector";
import AIGenerator from "./AIGenerator";
import MediaURLManager from "./MediaURLManager";
import { toast } from "react-toastify";
const API_URL = import.meta.env.VITE_API_BASE_URL;
import axios from "axios";
import useLanguage from "../../hook/useLanguage";

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

  const { lang } = useLanguage();

  // its for getting the blog id If Post Fails On Social Media To Prevent Duplicate Blogs
  const [blogId, setBlogId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast.info(
        lang === "en"
          ? "Please select at least one platform"
          : "적어도 하나의 플랫폼을 선택하세요"
      );

      return;
    }
    if (!formData.prompt) {
      toast.info(
        lang === "en"
          ? "Please enter a prompt for AI generation"
          : "AI 생성을 위한 프롬프트를 입력하세요"
      );

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

      toast.success(
        lang === "en"
          ? "Content generated successfully!"
          : "콘텐츠가 성공적으로 생성되었습니다!"
      );
    } catch (error) {
      toast.error(
        error.message ||
          (lang === "en"
            ? "Failed to generate content"
            : "콘텐츠 생성에 실패했습니다")
      );
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
  async function checkMediaSize({
    url,
    maxSizeMB,
    platformName,
    mediaType, // 'image' or 'video'
    validateDimensions = false,
    validateDuration = false,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    minDuration,
    maxDuration,
  }) {
    try {
      const response = await axios.post(`${API_URL}/blogs/validate-media`, {
        url,
        maxSizeMB,
        platformName,
        mediaType,
        validateDimensions,
        validateDuration,
        minWidth,
        maxWidth,
        minHeight,
        maxHeight,
        minDuration,
        maxDuration,
        lang,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          (lang === "en"
            ? "Failed to validate media"
            : "미디어 검증에 실패했습니다")
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
          lang === "en"
            ? "Please enter a valid media URL. Accepted extensions: " +
              allowedImageExtensions.join(", ")
            : "유효한 미디어 URL을 입력하세요. 허용되는 확장자: " +
              allowedImageExtensions.join(", ")
        );
      }

      const ext = file.split(".").pop().toLowerCase();
      if (!allowedImageExtensions.includes(ext)) {
        throw new Error(
          lang === "en"
            ? `Invalid media extension '${ext}'. Accepted: ${allowedImageExtensions.join(
                ", "
              )}`
            : `잘못된 미디어 확장자 '${ext}'입니다. 허용되는 확장자: ${allowedImageExtensions.join(
                ", "
              )}`
        );
      }

      return true;
    } catch (err) {
      throw new Error(
        lang === "en"
          ? "Please enter a valid media URL. Accepted extensions: " +
            allowedImageExtensions.join(", ")
          : "유효한 미디어 URL을 입력하세요. 허용되는 확장자: " +
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
      "bluesky",
      "facebook",
      "gmb",
      "linkedin",
      "x/twitter",
      "telegram",
      "instagram",
      "reddit",
      "threads",
      "pinterest",
      "snapchat",
      "tiktok",
      "youtube",
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
      toast.info(
        lang === "en"
          ? `Please upload at least one URL for: ${platformList}`
          : `${platformList}에 대해 최소한 하나의 URL을 업로드하세요`
      );

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
      toast.info(
        lang === "en"
          ? `Please enter a post title AND text for: ${platformList}`
          : `${platformList}에 대해 게시물 제목과 내용을 모두 입력하세요`
      );

      return false;
    }

    if (selectedPlatforms.includes("gmb")) {
      if (trimmed.length > 1500) {
        toast.info(
          lang === "en"
            ? `Google Business Post Text Length Cannot Be Greater Than 1500 characters. Your post is ${trimmed.length} characters.`
            : `Google 비즈니스 게시물의 텍스트 길이는 1500자를 초과할 수 없습니다. 현재 게시물은 ${trimmed.length}자입니다.`
        );

        return false;
      }

      if (images.length > 1) {
        toast.info(
          lang === "en"
            ? "Please upload only 1 image for Google Business"
            : "Google 비즈니스에는 이미지 1개만 업로드할 수 있습니다"
        );

        return false;
      }

      if (videos.length > 0) {
        toast.info(
          lang === "en"
            ? "Google Business doesn't support video."
            : "Google 비즈니스는 동영상을 지원하지 않습니다."
        );

        return false;
      }

      if (videos.length > 0 && images.length > 0) {
        toast.info(
          lang === "en"
            ? "Google Business doesn't accept both image and video."
            : "Google 비즈니스는 이미지와 동영상을 동시에 업로드할 수 없습니다."
        );

        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];
        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 5 MB each)
          await checkMediaSize({
            url: imgUrl,
            maxSizeMB: 5,
            platformName: "Google Business",
            mediaType: "image",
            validateDimensions: true,
            minWidth: 250,
            maxWidth: 4000, // safe upper limit
            minHeight: 250,
            maxHeight: 4000,
          });
        }
      } catch (err) {
        toast.info(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("bluesky")) {
      if (trimmed.length > 299) {
        toast.info(
          lang === "en"
            ? `Bluesky Post Text Length Cannot Be Greater Than 299 characters. Your post is ${trimmed.length} characters.`
            : `Bluesky 게시물의 텍스트 길이는 299자를 초과할 수 없습니다. 현재 게시물은 ${trimmed.length}자입니다.`
        );

        return false;
      }

      if (videos.length > 1) {
        toast.info(
          lang === "en"
            ? "BlueSky supports only one video at a time."
            : "BlueSky는 한 번에 하나의 동영상만 지원합니다."
        );

        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.info(
          lang === "en"
            ? "BlueSky cannot accept both image and video in the same post."
            : "BlueSky는 하나의 게시물에 이미지와 동영상을 동시에 업로드할 수 없습니다."
        );

        return false;
      }

      if (images.length > 4) {
        toast.info(
          lang === "en"
            ? "BlueSky supports up to 4 images only."
            : "BlueSky는 최대 4개의 이미지만 지원합니다."
        );

        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];
        const videoExtensions = ["mp4"];

        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);
          // Check image sizes (max 1 MB each)
          await checkMediaSize({
            url: imgUrl,
            maxSizeMB: 1,
            platformName: "bluesky",
            mediaType: "image",
            validateDimensions: false,
          });
        }

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 100 MB for BlueSky)
          await checkMediaSize({
            url: videoUrl,
            maxSizeMB: 1024, // 1 GB = 1024 MB
            platformName: "bluesky",
            mediaType: "video",
            validateDimensions: true,
            validateDuration: true,
            validateAspectRatio: true,
            minDuration: 1,
            maxDuration: 240, // 4 minutes = 240 seconds
            minAspectRatio: 1 / 3,
            maxAspectRatio: 3 / 1,
          });
        }
      } catch (err) {
        toast.info(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("instagram")) {
      if (trimmed.length > 2200) {
        toast.info(
          lang === "en"
            ? `Instagram Post Text Length Cannot Be Greater Than 2200 characters. Your post is ${trimmed.length} characters.`
            : `Instagram 게시물의 텍스트 길이는 2200자를 초과할 수 없습니다. 현재 게시물은 ${trimmed.length}자입니다.`
        );

        return false;
      }

      if (videos.length > 1) {
        toast.info(
          lang === "en"
            ? "Instagram supports only one video at a time."
            : "Instagram은 한 번에 하나의 동영상만 지원합니다."
        );

        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.info(
          lang === "en"
            ? "Instagram cannot accept both image and video in the same post."
            : "Instagram은 하나의 게시물에 이미지와 동영상을 동시에 업로드할 수 없습니다."
        );

        return false;
      }

      if (images.length > 10) {
        toast.info(
          lang === "en"
            ? "Instagram supports up to 10 images only."
            : "Instagram은 최대 10개의 이미지만 지원합니다."
        );

        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];
        const videoExtensions = ["mp4", "mov"];

        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 8 MB each)
          await checkMediaSize({
            url: imgUrl,
            maxSizeMB: 8,
            platformName: "instagram",
            mediaType: "image",
            validateDimensions: true,
            validateAspectRatio: true, // to restrict 4:5 to 1.91:1
            minWidth: 320,
            maxWidth: 1440,
            minHeight: 320,
            maxHeight: 1440,
            minAspectRatio: 0.8, // 4:5
            maxAspectRatio: 1.91, // 1.91:1
          });
        }

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 100 MB for instagram)
          await checkMediaSize({
            url: videoUrl,
            maxSizeMB: 100,
            platformName: "instagram",
            mediaType: "video",
            validateDimensions: true,
            validateDuration: true,
            validateAspectRatio: true,
            minWidth: 320,
            maxWidth: 1920,
            minHeight: 320,
            maxHeight: 1080,
            minDuration: 3,
            maxDuration: 60,
            minAspectRatio: 0.8, // 4:5
            maxAspectRatio: 1.91, // 1.91:1
          });
        }
      } catch (err) {
        toast.info(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("linkedin")) {
      // console.log(trimmed.length);
      if (trimmed.length > 3000) {
        toast.info(
          lang === "en"
            ? `LinkedIn Post Text Length Cannot Be Greater Than 3000 characters. Your post is ${trimmed.length} characters.`
            : `LinkedIn 게시물의 텍스트 길이는 3000자를 초과할 수 없습니다. 현재 게시물은 ${trimmed.length}자입니다.`
        );

        return false;
      }

      if (videos.length > 1) {
        toast.info(
          lang === "en"
            ? "LinkedIn supports only one video at a time."
            : "LinkedIn은 한 번에 하나의 동영상만 지원합니다."
        );

        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.info(
          lang === "en"
            ? "LinkedIn cannot accept both image and video in the same post."
            : "LinkedIn은 이미지와 비디오를 동시에 포함한 게시물을 허용하지 않습니다."
        );

        return false;
      }

      if (images.length > 9) {
        toast.info(
          lang === "en"
            ? "LinkedIn supports up to 9 images only."
            : "LinkedIn은 최대 9장의 이미지까지만 지원합니다."
        );

        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];
        const videoExtensions = ["mp4"];

        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 5 MB each)
          await checkMediaSize({
            url: imgUrl,
            maxSizeMB: 5,
            platformName: "Linkedin",
            mediaType: "image",
            validateDimensions: true,
            minWidth: 320, // safe lower bound
            maxWidth: 7680, // based on 36,152,320 pixel limit
            minHeight: 320,
            maxHeight: 7680,
            validateAspectRatio: true,
            minAspectRatio: 0.4167, // 1:2.4
            maxAspectRatio: 2.4, // 2.4:1
          });
        }

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 200 MB for Linkedin)
          await checkMediaSize({
            url: videoUrl,
            maxSizeMB: 200,
            platformName: "Linkedin",
            mediaType: "video",
            validateDimensions: true,
            validateDuration: true,
            minWidth: 320,
            maxWidth: 3840, // reasonable upper bound for HD
            minHeight: 320,
            maxHeight: 2160,
            minDuration: 3, // 3 seconds
            maxDuration: 1800, // 30 minutes
            validateAspectRatio: true,
            minAspectRatio: 0.4167, // 1:2.4
            maxAspectRatio: 2.4, // 2.4:1
          });
        }
      } catch (err) {
        toast.info(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("facebook")) {
      if (trimmed.length > 63206) {
        toast.info(
          lang === "en"
            ? `Facebook Post Text Length Cannot Be Greater Than 63,206 characters. Your post is ${trimmed.length} characters.`
            : `Facebook 게시물 텍스트 길이는 최대 63,206자까지만 허용됩니다. 현재 게시물은 ${trimmed.length}자입니다.`
        );

        return false;
      }

      if (videos.length > 1) {
        toast.info(
          lang === "en"
            ? "Facebook supports only one video at a time."
            : "Facebook은 한 번에 하나의 동영상만 지원합니다."
        );
        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.info(
          lang === "en"
            ? "Facebook cannot accept both image and video in the same post."
            : "Facebook은 이미지와 동영상을 동시에 업로드할 수 없습니다."
        );

        return false;
      }

      if (images.length > 10) {
        toast.info(
          lang === "en"
            ? "Facebook supports up to 10 images only."
            : "Facebook은 최대 10개의 이미지까지만 지원합니다."
        );

        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];
        const videoExtensions = ["mp4", "mov", "avi"];
        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 10 MB each)
          await checkMediaSize({
            url: imgUrl,
            maxSizeMB: 10,
            platformName: "Facebook",
            mediaType: "image",
            validateDimensions: true,
            minWidth: 470,
            maxWidth: 2048,
            minHeight: 470,
            maxHeight: 2048,
          });
        }

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 2 GB for Facebook)
          await checkMediaSize({
            url: videoUrl,
            maxSizeMB: 2000,
            platformName: "Facebook",
            mediaType: "video",
            validateDimensions: true,
            minWidth: 720,
            maxWidth: 1920,
            minHeight: 720,
            maxHeight: 1080,
            validateDuration: true,
            maxDuration: 14400, // 4 hours
            validateAspectRatio: true,
            minAspectRatio: 0.5625, // 9:16 (portrait)
            maxAspectRatio: 1.7778, // 16:9 (landscape)
          });
        }
      } catch (err) {
        toast.info(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("reddit")) {
      if (trimmed.length > 5000) {
        toast.info(
          lang === "en"
            ? `Reddit Post Text Length Cannot Be Greater Than 5000 characters. Your post is ${trimmed.length} characters.`
            : `Reddit 게시물 텍스트 길이는 5000자를 초과할 수 없습니다. 현재 길이: ${trimmed.length}자입니다.`
        );

        return false;
      }

      if (formData.subreddit === "" || formData.subreddit === null) {
        toast.info(
          lang === "en" ? "Please add a subreddit" : "서브레딧을 추가해 주세요"
        );
        return false;
      }

      if (videos.length > 0) {
        toast.info(
          lang === "en"
            ? "Reddit doesn't support video."
            : "Reddit는 동영상을 지원하지 않습니다."
        );

        return false;
      }

      if (videos.length > 0 && images.length > 0) {
        toast.info(
          lang === "en"
            ? "Reddit doesn't accept both image and video."
            : "Reddit는 이미지와 동영상을 동시에 업로드할 수 없습니다."
        );

        return false;
      }

      if (images.length > 1) {
        toast.info(
          lang === "en"
            ? "Reddit supports up to 1 image only per post."
            : "Reddit는 게시물당 이미지 1개만 업로드할 수 있습니다."
        );

        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png", "webp"];

        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);
          // Check image sizes (max 10 MB each)
          await checkMediaSize({
            url: imgUrl,
            maxSizeMB: 10,
            platformName: "Reddit",
            mediaType: "image",
          });
        }
      } catch (err) {
        toast.info(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("pinterest")) {
      if (trimmed.length > 500) {
        toast.info(
          lang === "en"
            ? `Pinterest Post Text Length Cannot Be Greater Than 500 characters. Your post is ${trimmed.length} characters.`
            : `Pinterest 게시물 텍스트 길이는 500자를 초과할 수 없습니다. 현재 길이: ${trimmed.length}자입니다.`
        );

        return false;
      }

      if (videos.length > 0) {
        toast.info(
          lang === "en"
            ? "Pinterest doesn't support video."
            : "Pinterest는 비디오를 지원하지 않습니다."
        );

        return false;
      }

      if (videos.length > 0 && images.length > 0) {
        toast.info(
          lang === "en"
            ? "Pinterest doesn't accept both image and video."
            : "Pinterest는 이미지와 비디오를 동시에 업로드할 수 없습니다."
        );

        return false;
      }

      if (images.length > 5) {
        toast.info(
          lang === "en"
            ? "Pinterest supports up to 5 images only per post."
            : "Pinterest는 게시물당 최대 5장의 이미지만 지원합니다."
        );

        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];

        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 20 MB each)
          await checkMediaSize({
            url: imgUrl,
            maxSizeMB: 20,
            platformName: "Pinterest",
            mediaType: "image",
            validateDimensions: true,
            minWidth: 600,
            minHeight: 900,
            maxWidth: 2000,
            maxHeight: 3000,
            validateAspectRatio: true,
            minAspectRatio: 0.66, // 2:3 = 0.666...
            maxAspectRatio: 0.66,
          });
        }
      } catch (err) {
        toast.info(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("telegram")) {
      if (trimmed.length > 1024) {
        toast.info(
          lang === "en"
            ? `Telegram Post Text Length Cannot Be Greater Than 1024 characters. Your post is ${trimmed.length} characters.`
            : `Telegram 게시물 텍스트 길이는 1024자를 초과할 수 없습니다. 현재 게시물은 ${trimmed.length}자입니다.`
        );

        return false;
      }

      if (videos.length > 0) {
        toast.info(
          lang === "en"
            ? "Telegram Doesn't support videos."
            : "Telegram은 동영상을 지원하지 않습니다."
        );

        return false;
      }

      if (images.length > 0) {
        toast.info(
          lang === "en"
            ? "Telegram doesn't support images."
            : "Telegram은 이미지를 지원하지 않습니다."
        );

        return false;
      }
    }

    if (selectedPlatforms.includes("threads")) {
      if (trimmed.length > 500) {
        toast.info(
          lang === "en"
            ? `Threads post text cannot exceed 500 characters. Your post is ${trimmed.length} characters.`
            : `Threads 게시물 텍스트는 500자를 초과할 수 없습니다. 현재 ${trimmed.length}자입니다.`
        );

        return false;
      }

      if (videos.length > 1) {
        toast.info(
          lang === "en"
            ? "Threads only supports 1 video per post."
            : "Threads는 게시물당 하나의 동영상만 지원합니다."
        );

        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.info(
          lang === "en"
            ? "Threads doesn't accept both image and video in the same post."
            : "Threads는 이미지와 동영상을 동시에 포함하는 게시물을 허용하지 않습니다."
        );

        return false;
      }

      if (images.length > 20) {
        toast.info(
          lang === "en"
            ? "Threads supports up to 20 images only per post."
            : "Threads는 게시물당 최대 20개의 이미지만 지원합니다."
        );

        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png"];
        const videoExtensions = ["mp4", "mov"];
        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 8 MB each)
          await checkMediaSize({
            url: imgUrl,
            maxSizeMB: 8,
            platformName: "Threads",
            mediaType: "image",
            validateDimensions: true,
            minWidth: 320,
            maxWidth: 1440,
            minAspectRatio: 1 / 10, // 0.1
            maxAspectRatio: 10 / 1, // 10
          });
        }

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 1 GB for Threads)
          await checkMediaSize({
            url: videoUrl,
            maxSizeMB: 1024, // 1 GB
            platformName: "Threads",
            mediaType: "video",
            validateAspectRatio: true,
            minAspectRatio: 1 / 100, // 0.01
            maxAspectRatio: 10 / 1,
            validateDuration: true,
            minDuration: 1, // > 0 sec
            maxDuration: 300, // 5 min
          });
        }
      } catch (err) {
        toast.info(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("tiktok")) {
      if (trimmed.length > 2200) {
        toast.info(
          lang === "en"
            ? `TikTok post text length cannot be greater than 2200 characters. Your post is ${trimmed.length} characters.`
            : `TikTok 게시물 텍스트 길이는 2200자를 초과할 수 없습니다. 현재 길이는 ${trimmed.length}자입니다.`
        );

        return false;
      }

      if (videos.length > 1) {
        toast.info(
          lang === "en"
            ? "TikTok only supports 1 video per post."
            : "TikTok은 게시물당 하나의 동영상만 지원합니다."
        );

        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.info(
          lang === "en"
            ? "TikTok doesn't accept both image and video."
            : "TikTok은 이미지와 동영상을 동시에 포함한 게시물을 허용하지 않습니다."
        );

        return false;
      }

      if (images.length > 0) {
        toast.info(
          lang === "en"
            ? "TikTok doesn't support images."
            : "TikTok은 이미지를 지원하지 않습니다."
        );

        return false;
      }

      try {
        const videoExtensions = ["mp4", "mov", "webm"];

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 1 GB for Tiktok)
          await checkMediaSize({
            url: videoUrl,
            maxSizeMB: 1024, // 1 GB
            platformName: "TikTok",
            mediaType: "video",
            validateDimensions: true,
            minWidth: 360,
            maxWidth: 4096,
            minHeight: 360,
            maxHeight: 4096,
            validateDuration: true,
            minDuration: 3, // 3 seconds
            maxDuration: 600, // 10 minutes
            validateAspectRatio: true,
            minAspectRatio: 9 / 16, // 0.5625
            maxAspectRatio: 16 / 9, // 1.777...
          });
        }
      } catch (err) {
        toast.info(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("twitter")) {
      if (trimmed.length > 280) {
        toast.info(
          lang === "en"
            ? `Twitter post text cannot be greater than 280 characters. Your post is ${trimmed.length} characters.`
            : `Twitter 게시물 텍스트 길이는 280자를 초과할 수 없습니다. 현재 길이는 ${trimmed.length}자입니다.`
        );

        return false;
      }

      if (videos.length > 4) {
        toast.info(
          lang === "en"
            ? "Twitter only supports 4 videos per post."
            : "Twitter는 게시물당 최대 4개의 동영상만 지원합니다."
        );

        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.info(
          lang === "en"
            ? "Twitter doesn't accept both image and video."
            : "Twitter는 이미지와 동영상을 동시에 포함하는 게시물을 허용하지 않습니다."
        );

        return false;
      }

      if (images.length > 4) {
        toast.info(
          lang === "en"
            ? "Twitter supports up to 4 images only per post."
            : "Twitter는 게시물당 최대 4개의 이미지만 지원합니다."
        );

        return false;
      }

      try {
        const imageExtensions = ["jpg", "jpeg", "png", "webp"];
        const videoExtensions = ["mp4", "mov"];

        for (const imgUrl of images) {
          isValidExtension(imgUrl, imageExtensions);

          // Check image sizes (max 5 MB each)
          await checkMediaSize({
            url: imgUrl,
            maxSizeMB: 5,
            platformName: "X/Twitter",
            mediaType: "image",
            validateDimensions: true,
            minWidth: 4,
            maxWidth: 8192,
            minHeight: 4,
            maxHeight: 8192,
            validateAspectRatio: true,
            minAspectRatio: 1 / 3, // As low as 1:3 (0.333...)
            maxAspectRatio: 3 / 1, // Up to 3:1 (3.0)
          });
        }

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 512 MB for Twitter)
          await checkMediaSize({
            url: videoUrl,
            maxSizeMB: 512,
            platformName: "X/Twitter",
            mediaType: "video",
            validateDimensions: true,
            minWidth: 1, // Not documented exactly, safe fallback
            maxWidth: 1280,
            minHeight: 1, // Not documented exactly, safe fallback
            maxHeight: 1024,
            validateDuration: true,
            minDuration: 0.5, // 0.5 seconds
            maxDuration: 140, // 140 seconds
            validateAspectRatio: true,
            minAspectRatio: 1 / 3, // 0.333...
            maxAspectRatio: 3 / 1, // 3.0
          });
        }
      } catch (err) {
        toast.info(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("youtube")) {
      if (trimmed.length > 5000) {
        toast.info(
          lang === "en"
            ? `YouTube post text cannot be greater than 5000 characters. Your post is ${trimmed.length} characters.`
            : `YouTube 게시물 텍스트 길이는 5000자를 초과할 수 없습니다. 현재 길이는 ${trimmed.length}자입니다.`
        );

        return false;
      }

      if (videos.length > 1) {
        toast.info(
          lang === "en"
            ? "YouTube only supports 1 video per post."
            : "YouTube는 게시물당 하나의 동영상만 지원합니다."
        );

        return false;
      }

      if (videos.length > 0 && images.length > 0) {
        toast.info(
          lang === "en"
            ? "YouTube doesn't accept both image and video."
            : "YouTube는 이미지와 동영상을 동시에 포함하는 게시물을 허용하지 않습니다."
        );

        return false;
      }

      if (images.length > 0) {
        toast.info(
          lang === "en"
            ? "YouTube doesn't support images."
            : "YouTube는 이미지를 지원하지 않습니다."
        );

        return false;
      }

      try {
        const videoExtensions = ["mp4", "mov"];

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 4 GB for Youtube)
          await checkMediaSize({
            url: videoUrl,
            maxSizeMB: 4000, // 4 GB
            platformName: "YouTube",
            mediaType: "video",
            validateAspectRatio: true,
            minAspectRatio: 1 / 3,
            maxAspectRatio: 3 / 1,
          });
        }
      } catch (err) {
        toast.info(err.message);
        return false;
      }
    }

    if (selectedPlatforms.includes("snapchat")) {
      if (!formData.snapchatPostType === "spotlight") {
        if (trimmed.length > 500) {
          toast.info(
            lang === "en"
              ? `Snapchat post text cannot be greater than 500 characters. Your post is ${trimmed.length} characters.`
              : `Snapchat 게시물 텍스트 길이는 500자를 초과할 수 없습니다. 현재 길이는 ${trimmed.length}자입니다.`
          );

          return false;
        }
      }

      if (videos.length > 1) {
        toast.info(
          lang === "en"
            ? "Snapchat only supports 1 video per post."
            : "Snapchat은 게시물당 하나의 동영상만 지원합니다."
        );

        return false;
      }

      if (videos.length === 1 && images.length > 0) {
        toast.info(
          lang === "en"
            ? "Snapchat doesn't accept both image and video."
            : "Snapchat은 이미지와 동영상을 동시에 포함하는 게시물을 허용하지 않습니다."
        );

        return false;
      }

      if (images.length > 1) {
        toast.info(
          lang === "en"
            ? "Snapchat supports up to 1 image only per post."
            : "Snapchat은 게시물당 최대 1장의 이미지만 지원합니다."
        );

        return false;
      }

      if (formData.snapchatPostType === "spotlight") {
        if (images.length > 0) {
          toast.info(
            lang === "en"
              ? "Snapchat Spotlight doesn't accept images."
              : "Snapchat Spotlight는 이미지를 지원하지 않습니다."
          );

          return false;
        }

        if (trimmed.length > 160) {
          toast.info(
            lang === "en"
              ? `Snapchat Spotlight post text cannot be greater than 160 characters. Your post is ${trimmed.length} characters.`
              : `Snapchat Spotlight 게시물 텍스트 길이는 160자를 초과할 수 없습니다. 현재 길이는 ${trimmed.length}자입니다.`
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
          await checkMediaSize({
            url: imgUrl,
            maxSizeMB: 20,
            platformName: "Snapchat",
            mediaType: "image",
            validateAspectRatio: true,
            minAspectRatio: 9 / 16,
            maxAspectRatio: 9 / 16,
          });
        }

        for (const videoUrl of videos) {
          isValidExtension(videoUrl, videoExtensions);

          // Check video size (max 500 MB for SnapChat )
          await checkMediaSize({
            url: videoUrl,
            maxSizeMB: 500,
            platformName: "Snapchat",
            mediaType: "video",
            validateAspectRatio: true,
            validateDuration: true,
            minDuration: 5,
            maxDuration: 60,
            minAspectRatio: 9 / 16,
            maxAspectRatio: 9 / 16,
          });
        }
      } catch (err) {
        toast.info(err.message);
        return false;
      }
    }

    return true; // ✅ All validations passed
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);

    if (!selectedPlatforms.length) {
      toast.info(
        lang === "en"
          ? "Please select at least one platform."
          : "적어도 하나의 플랫폼을 선택하세요."
      );

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
        lang: lang,
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
      // console.log(response);

      if (response.success) {
        // console.log("✅ Blog created successfully.");

        // Check if sharing to social media failed
        if (response.socialMediaStatus && !response.socialMediaStatus.success) {
          console.warn("⚠️ Some social media shares failed:");
          // console.log(response.socialMediaStatus.results);
          setErrorResults(response.socialMediaStatus.results || []);
          setBlogId(response.blog._id);
          setShowErrorModal(true);
        } else {
          // console.log("🎉 Shared on all platforms successfully!");
          toast.success(
            lang === "en"
              ? "Post created and distributed successfully!"
              : "게시물이 성공적으로 생성되어 배포되었습니다!"
          );

          onSuccess();
        }
      } else {
        // Handle total failure of blog creation
        console.error("❌ Failed to create the blog.");
        alert(
          lang === "en"
            ? "Failed to create blog. Please try again."
            : "블로그 생성에 실패했습니다. 다시 시도하세요."
        );
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
              {lang === "en" ? "Publishing Errors" : "게시 오류"}
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
              {lang === "en" ? "Close" : "닫기"}
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
            <h1 className="text-2xl font-bold text-gray-900">
              {lang === "en" ? "Post Distribution" : "게시물 배포"}
            </h1>
            <p className="text-sm text-gray-600">
              {lang === "en"
                ? "Create and distribute content across multiple platforms"
                : "다양한 플랫폼에 콘텐츠를 생성하고 배포하세요."}
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
            <div className="p-2 my-5 transition-all duration-300 ease-in-out bg-yellow-300 rounded-2xl">
              <p className="text-lg">
                {lang === "en"
                  ? "Note: Please ensure that you wait at least 5 minutes before uploading another post to Snapchat. Continuous or rapid uploads may result in temporary restrictions or failed attempts."
                  : "참고: Snapchat에 다른 게시물을 업로드하기 전에 최소 5분 이상 기다려주세요. 연속적이거나 빠른 업로드는 일시적인 제한 또는 업로드 실패로 이어질 수 있습니다."}
              </p>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {lang === "en" ? "Post Title" : "게시물 제목"}
                </label>
                <input
                  type="text"
                  name="postTitle"
                  value={formData.postTitle}
                  onChange={handleInputChange}
                  placeholder={
                    lang === "en"
                      ? "Enter post title"
                      : "게시물 제목을 입력하세요."
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {selectedPlatforms.includes("reddit") && (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      {lang === "en" ? "Subreddit" : "서브레딧"}
                    </label>
                    <input
                      type="text"
                      name="subreddit"
                      value={formData.subreddit}
                      onChange={handleInputChange}
                      placeholder={
                        lang === "en"
                          ? "Enter subreddit name"
                          : "서브레딧 이름을 입력하세요."
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      {lang === "en" ? "Reddit Link" : "Reddit 링크"}
                    </label>
                    <input
                      type="text"
                      name="redditLink"
                      value={formData.redditLink}
                      onChange={handleInputChange}
                      placeholder={
                        lang === "en"
                          ? "Enter Reddit link (optional)"
                          : "Reddit 링크를 입력하세요 (선택 사항)."
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* Snapchat Post Type Selection */}
              {selectedPlatforms.includes("snapchat") && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    {lang === "en"
                      ? "Snapchat Post Type"
                      : "Snapchat 게시물 유형"}
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
                    {lang === "en"
                      ? "Choose how your content will be shared on Snapchat"
                      : "Snapchat에서 콘텐츠를 어떻게 공유할지 선택하세요."}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {lang === "en" ? "Additional Options" : "추가 옵션"}
                </label>
                <div className="space-y-3 text-sm">
                  {/* <label className="flex items-center space-x-2">
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
                  </p> */}

                  {/* Shorten Links Option */}
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="shortenLinks"
                      checked={formData.shortenLinks}
                      onChange={handleInputChange}
                      className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span>
                      {lang === "en" ? "Shorten Links" : "링크 단축하기"}
                    </span>
                  </label>
                  <p className="ml-6 text-xs text-gray-500">
                    {lang === "en"
                      ? "Track clicks and demographics"
                      : "클릭 수 및 인구 통계 추적"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Post Text */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              {lang === "en" ? "Post Text" : "게시물 내용"}
            </label>
            <textarea
              name="postText"
              value={formData.postText}
              onChange={handleInputChange}
              placeholder={
                lang === "en" ? "Enter post text" : "게시물 내용을 입력하세요."
              }
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
            {/* <button
              type="button"
              className="flex items-center px-6 py-2 space-x-2 text-blue-700 transition-colors bg-blue-100 rounded-md hover:bg-blue-200"
            >
              <Calendar size={16} />
              <span>Schedule Post</span>
            </button> */}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || selectedPlatforms.length === 0}
              className={`flex items-center px-6 py-2 space-x-2 text-white transition-colors bg-gradient-to-r from-blue-600 to-purple-600 rounded-md disabled:cursor-not-allowed disabled:opacity-70`}
            >
              <span className="flex items-center justify-center gap-3 p-2 ">
                {lang === "en" ? "Publish Post" : "게시물 게시"}
                {isSubmitting && (
                  <>
                    <div role="status">
                      <svg
                        aria-hidden="true"
                        className="w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
