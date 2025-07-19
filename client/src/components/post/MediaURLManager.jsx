import { useState } from "react";
import { Image, Video, File, X, Link } from "lucide-react";
import useLanguage from "../../hook/useLanguage";

// Media URL Manager Component
const MediaURLManager = ({ mediaUrls, onAdd, onRemove }) => {
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const { lang } = useLanguage();
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const getMediaType = (url) => {
    const videoExtensions = ["mp4", "mov", "avi", "webm", "mkv"];
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    const extension = url.split(".").pop()?.toLowerCase();

    if (videoExtensions.includes(extension)) return "video";
    if (imageExtensions.includes(extension)) return "image";
    return "unknown";
  };

  const handleAdd = () => {
    if (newMediaUrl.trim() && isValidUrl(newMediaUrl)) {
      onAdd(newMediaUrl.trim());
      setNewMediaUrl("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="mb-6">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {lang === "en" ? "Media URLs" : "미디어 URL"}
      </label>

      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Link
              className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
              size={16}
            />
            <input
              type="url"
              value={newMediaUrl}
              onChange={(e) => setNewMediaUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                lang === "en"
                  ? "Paste image or video URL (https://...)"
                  : "이미지 또는 동영상 URL을 붙여넣으세요 (https://...)"
              }
              className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newMediaUrl.trim() || !isValidUrl(newMediaUrl)}
            className="px-4 py-2 text-white transition-colors rounded-md bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {lang === "en" ? "Add URL" : "URL 추가"}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          {lang === "en"
            ? " Supported formats: JPG, PNG, GIF, WEBP, MP4, MOV, AVI. Enter full URLs starting with https://"
            : "지원되는 형식: JPG, PNG, GIF, WEBP, MP4, MOV, AVI. https://로 시작하는 전체 URL을 입력하세요."}
        </p>
      </div>

      {mediaUrls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {lang === "en" ? "Added Media" : "추가된 미디어"} (
            {mediaUrls.length})
          </h4>
          {mediaUrls.map((url, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
            >
              <div className="flex items-center flex-1 min-w-0 space-x-3">
                <div
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium text-white ${
                    getMediaType(url) === "video"
                      ? "bg-red-500"
                      : getMediaType(url) === "image"
                      ? "bg-green-500"
                      : "bg-gray-500"
                  }`}
                >
                  {getMediaType(url) === "video" ? (
                    <Video size={16} />
                  ) : getMediaType(url) === "image" ? (
                    <Image size={16} />
                  ) : (
                    <File size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {url}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {getMediaType(url)} URL
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemove(index)}
                className="p-1 ml-2 text-red-500 rounded hover:text-red-700 hover:bg-red-50"
                title={lang === "en" ? "Remove URL" : "URL 제거"}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 mt-4 border border-[#4B7289] rounded-md bg-[#E6F4FA]">
        <p className="text-sm text-[#1A3C5A]">
          <strong>
            {lang === "en"
              ? "What Each Platform Needs"
              : "각 플랫폼에 필요한 사항"}
            :
          </strong>
        </p>
        <ul className="mt-1 space-y-2 text-xs text-[#2D3748]">
          <li>
            {lang === "en"
              ? "• Instagram: Add 1-10 images or 1 video (.jpg, .png, .mp4, or .mov). Images up to 8 MB, video up to 100 MB. Text up to 2200 characters. Don't mix images and video."
              : "• 인스타그램: 이미지 1~10개 또는 동영상 1개(.jpg, .png, .mp4, .mov)를 추가하세요. 이미지는 최대 8MB, 동영상은 최대 100MB까지 가능합니다. 텍스트는 최대 2200자까지 입력할 수 있으며, 이미지와 동영상을 혼합하지 마세요."}
          </li>
          <li>
            {lang === "en"
              ? "• Snapchat: Use 1 image or 1 video (.jpg, .png, or .mp4). Image up to 20 MB, video up to 500 MB. Text up to 500 characters (160 for Spotlight). Spotlight needs 1 video, no images."
              : "• 스냅챗: 이미지 1개 또는 동영상 1개(.jpg, .png, .mp4)를 사용하세요. 이미지는 최대 20MB, 동영상은 최대 500MB까지 가능합니다. 텍스트는 최대 500자까지 입력할 수 있으며, 스포트라이트의 경우 160자 제한이 있습니다. 스포트라이트에는 동영상만 사용 가능하며, 이미지는 사용할 수 없습니다."}
          </li>
          <li>
            {lang === "en"
              ? "• Pinterest: Add 1-5 images (.jpg or .png, up to 20 MB each). No videos. Text up to 500 characters."
              : "• 핀터레스트: 이미지 1~5개(.jpg 또는 .png, 각 최대 20MB)를 추가하세요. 동영상은 지원되지 않습니다. 텍스트는 최대 500자까지 입력할 수 있습니다."}
          </li>
          <li>
            {lang === "en"
              ? "• YouTube: Add 1 video (.mp4 or .mov, up to 4 GB). No images. Text up to 5000 characters."
              : "• 유튜브: 동영상 1개(.mp4 또는 .mov, 최대 4GB)를 추가하세요. 이미지는 지원되지 않습니다. 텍스트는 최대 5000자까지 입력할 수 있습니다."}
          </li>
          <li>
            {lang === "en"
              ? "• TikTok: Add 1 video (.mp4, .mov, or .webm, up to 1 GB). No images. Text up to 2200 characters."
              : "• 틱톡: 동영상 1개(.mp4, .mov, .webm, 최대 1GB)를 추가하세요. 이미지는 지원되지 않습니다. 텍스트는 최대 2200자까지 입력할 수 있습니다."}
          </li>
          <li>
            {lang === "en"
              ? "• Google Business: Add 1 image (.jpg or .png, up to 5 MB). No videos. Text up to 1500 characters."
              : "• 구글 비즈니스: 이미지 1개(.jpg 또는 .png, 최대 5MB)를 추가하세요. 동영상은 지원되지 않습니다. 텍스트는 최대 1500자까지 입력할 수 있습니다."}
          </li>
          <li>
            {lang === "en"
              ? "• Facebook: Include a title and text. Optional: 1-10 images or 1 video (.jpg, .png, .mp4, .mov, or .avi). Images up to 10 MB, video up to 2 GB. Don't mix images and video, Text up to 63206 characters."
              : "• 페이스북: 제목과 텍스트를 포함하세요. 선택적으로 이미지 1~10개 또는 동영상 1개(.jpg, .png, .mp4, .mov, .avi)를 추가할 수 있습니다. 이미지는 최대 10MB, 동영상은 최대 2GB까지 허용됩니다. 이미지와 동영상을 혼합하지 마세요. 텍스트는 최대 63206자까지 입력할 수 있습니다."}
          </li>
          <li>
            {lang === "en"
              ? "• LinkedIn: Include a title and text. Optional: 1-9 images or 1 video (.jpg, .png, or .mp4). Images up to 5 MB, video up to 200 MB. Text up to 3000 characters. Don't mix images and video."
              : "• 링크드인: 제목과 텍스트를 포함하세요. 선택적으로 이미지 1~9개 또는 동영상 1개(.jpg, .png, .mp4)를 추가할 수 있습니다. 이미지는 최대 5MB, 동영상은 최대 200MB까지 가능합니다. 이미지와 동영상을 혼합하지 마세요. 텍스트는 최대 3000자까지 입력할 수 있습니다."}
          </li>
          <li>
            {lang === "en"
              ? "• X (Twitter): Include a title and text. Optional: 1-4 images or 1-4 videos (.jpg, .png, .webp, .mp4, or .mov). Images up to 5 MB, videos up to 512 MB. Text up to 280 characters. Don't mix images and video."
              : "• X(트위터): 제목과 텍스트를 포함하세요. 선택적으로 이미지 1~4개 또는 동영상 1~4개(.jpg, .png, .webp, .mp4, .mov)를 추가할 수 있습니다. 이미지는 최대 5MB, 동영상은 최대 512MB까지 허용됩니다. 이미지와 동영상을 혼합하지 마세요. 텍스트는 최대 280자까지 입력할 수 있습니다."}
          </li>
          <li>
            {lang === "en"
              ? "• Telegram: Include a title and text. No images or videos. Text up to 1024 characters."
              : "• 텔레그램: 제목과 텍스트를 포함하세요. 이미지나 동영상은 지원되지 않습니다. 텍스트는 최대 1024자까지 입력할 수 있습니다."}
          </li>
          <li>
            {lang === "en"
              ? "• Bluesky: Include a title and text. Optional: 1-4 images or 1 video (.jpg, .png, or .mp4). Images up to 1 MB, video up to 100 MB. Text up to 299 characters. Don't mix images and video."
              : "• 블루스카이: 제목과 텍스트를 포함하세요. 선택적으로 이미지 1~4개 또는 동영상 1개(.jpg, .png, .mp4)를 추가할 수 있습니다. 이미지는 최대 1MB, 동영상은 최대 100MB까지 허용됩니다. 텍스트는 최대 299자까지 입력할 수 있으며, 이미지와 동영상을 혼합하지 마세요."}
          </li>
          <li>
            {lang === "en"
              ? "• Reddit: Include a title, text, and a Reddit link. Optional: 1 image (.jpg or .png, up to 10 MB). No videos. Text up to 5000 characters."
              : "• 레딧: 제목, 텍스트, 그리고 Reddit 링크를 포함하세요. 선택적으로 이미지 1개(.jpg 또는 .png, 최대 10MB)를 추가할 수 있습니다. 동영상은 지원되지 않습니다. 텍스트는 최대 5000자까지 입력할 수 있습니다."}
          </li>
          <li>
            {lang === "en"
              ? "• Threads: Optional: 1-20 images or 1 video (.jpg, .png, .mp4, or .mov). Images up to 8 MB, video up to 1 GB. Text up to 500 characters. Don't mix images and video."
              : "• 스레드: 선택적으로 이미지 1~20개 또는 동영상 1개(.jpg, .png, .mp4, .mov)를 추가할 수 있습니다. 이미지는 최대 8MB, 동영상은 최대 1GB까지 가능합니다. 텍스트는 최대 500자까지 입력할 수 있으며, 이미지와 동영상을 혼합하지 마세요."}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MediaURLManager;
