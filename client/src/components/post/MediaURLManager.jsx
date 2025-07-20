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

      <div className="p-4 mt-4 border border-[#4B7289] rounded-md bg-[#E6F4FA]">
        <p className="text-lg font-bold text-[#1A3C5A]">
          {lang === "en"
            ? "What You Need for Each Platform"
            : "각 플랫폼에 필요한 것"}
        </p>
        <ul className="mt-2 space-y-3 text-base text-[#2D3748]">
          <li>
            {lang === "en"
              ? "• Instagram: Share 1-10 photos or 1 video. Photos should be small (up to 8 MB) and videos up to 100 MB (3-60 seconds long). Write up to 2200 characters of text. Don’t mix photos and videos in one post."
              : "• 인스타그램: 사진 1~10장 또는 동영상 1개를 올리세요. 사진은 최대 8MB, 동영상은 최대 100MB(3~60초)로 유지하세요. 텍스트는 최대 2200자까지 가능합니다. 사진과 동영상을 함께 올릴 수 없습니다."}
          </li>
          <li>
            {lang === "en"
              ? "• Snapchat: Use 1 photo (up to 20 MB) or 1 video (up to 500 MB, 5-60 seconds). Text up to 500 characters. For Spotlight, use 1 video (no photos) and keep text under 160 characters."
              : "• 스냅챗: 사진 1장(최대 20MB) 또는 동영상 1개(최대 500MB, 5~60초)를 올리세요. 텍스트는 최대 500자까지 가능합니다. 스포트라이트는 동영상 1개만 가능(사진 불가)하며, 텍스트는 160자 미만으로 유지하세요."}
          </li>
          <li>
            {lang === "en"
              ? "• Pinterest: Share 1-5 photos (up to 20 MB each). No videos. Keep text under 500 characters."
              : "• 핀터레스트: 사진 1~5장(각 최대 20MB)을 올리세요. 동영상은 지원되지 않습니다. 텍스트는 최대 500자까지 가능합니다."}
          </li>
          <li>
            {lang === "en"
              ? "• YouTube: Upload 1 video (up to 4 GB). No photos. Write up to 5000 characters of text."
              : "• 유튜브: 동영상 1개(최대 4GB)를 올리세요. 사진은 지원되지 않습니다. 텍스트는 최대 5000자까지 가능합니다."}
          </li>
          <li>
            {lang === "en"
              ? "• TikTok: Share 1 video (up to 1 GB, 3 seconds to 10 minutes). No photos. Text up to 2200 characters."
              : "• 틱톡: 동영상 1개(최대 1GB, 3초~10분)를 올리세요. 사진은 지원되지 않습니다. 텍스트는 최대 2200자까지 가능합니다."}
          </li>
          <li>
            {lang === "en"
              ? "• Google Business: Add 1 photo (up to 5 MB). No videos. Keep text under 1500 characters."
              : "• 구글 비즈니스: 사진 1장(최대 5MB)을 올리세요. 동영상은 지원되지 않습니다. 텍스트는 최대 1500자까지 가능합니다."}
          </li>
          <li>
            {lang === "en"
              ? "• Facebook: Include a title and text. You can add 1-10 photos (up to 10 MB each) or 1 video (up to 2 GB, up to 4 hours). Don’t mix photos and videos. Text can be up to 63,206 characters."
              : "• 페이스북: 제목과 텍스트를 추가하세요. 사진 1~10장(각 최대 10MB) 또는 동영상 1개(최대 2GB, 최대 4시간)를 추가할 수 있습니다. 사진과 동영상을 함께 올릴 수 없습니다. 텍스트는 최대 63,206자까지 가능합니다."}
          </li>
          <li>
            {lang === "en"
              ? "• LinkedIn: Add a title and text. Optionally include 1-9 photos (up to 5 MB each) or 1 video (up to 200 MB, 3 seconds to 30 minutes). Don’t mix photos and videos. Text up to 3000 characters."
              : "• 링크드인: 제목과 텍스트를 추가하세요. 선택적으로 사진 1~9장(각 최대 5MB) 또는 동영상 1개(최대 200MB, 3초~30분)를 올릴 수 있습니다. 사진과 동영상을 함께 올릴 수 없습니다. 텍스트는 최대 3000자까지 가능합니다."}
          </li>
          <li>
            {lang === "en"
              ? "• X (Twitter): Include a title and text. You can add 1-4 photos (up to 5 MB each) or 1-4 videos (up to 512 MB, 0.5-140 seconds). Don’t mix photos and videos. Text up to 280 characters."
              : "• X(트위터): 제목과 텍스트를 추가하세요. 사진 1~4장(각 최대 5MB) 또는 동영상 1~4개(최대 512MB, 0.5~140초)를 올릴 수 있습니다. 사진과 동영상을 함께 올릴 수 없습니다. 텍스트는 최대 280자까지 가능합니다."}
          </li>
          <li>
            {lang === "en"
              ? "• Telegram: Add a title and text. No photos or videos. Text up to 1024 characters."
              : "• 텔레그램: 제목과 텍스트를 추가하세요. 사진이나 동영상은 지원되지 않습니다. 텍스트는 최대 1024자까지 가능합니다."}
          </li>
          <li>
            {lang === "en"
              ? "• Bluesky: Include a title and text. You can add 1-4 photos (up to 1 MB each) or 1 video (up to 1 GB, 1-240 seconds). Don’t mix photos and videos. Text up to 299 characters."
              : "• 블루스카이: 제목과 텍스트를 추가하세요. 사진 1~4장(각 최대 1MB) 또는 동영상 1개(최대 1GB, 1~240초)를 올릴 수 있습니다. 사진과 동영상을 함께 올릴 수 없습니다. 텍스트는 최대 299자까지 가능합니다."}
          </li>
          <li>
            {lang === "en"
              ? "• Reddit: Add a title, text, and choose a subreddit. You can include 1 photo (up to 10 MB). No videos. Text up to 5000 characters."
              : "• 레딧: 제목, 텍스트, 서브레딧을 추가하세요. 사진 1장(최대 10MB)을 올릴 수 있습니다. 동영상은 지원되지 않습니다. 텍스트는 최대 5000자까지 가능합니다."}
          </li>
          <li>
            {lang === "en"
              ? "• Threads: You can share 1-20 photos (up to 8 MB each) or 1 video (up to 1 GB, 1-300 seconds). Don’t mix photos and videos. Text up to 500 characters."
              : "• 스레드: 사진 1~20장(각 최대 8MB) 또는 동영상 1개(최대 1GB, 1~300초)를 올릴 수 있습니다. 사진과 동영상을 함께 올릴 수 없습니다. 텍스트는 최대 500자까지 가능합니다."}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MediaURLManager;
