import { useState } from "react";
import { Image, Video, File, X, Link } from "lucide-react";

// Media URL Manager Component
const MediaURLManager = ({ mediaUrls, onAdd, onRemove }) => {
  const [newMediaUrl, setNewMediaUrl] = useState("");

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
        Media URLs
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
              placeholder="Paste image or video URL (https://...)"
              className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newMediaUrl.trim() || !isValidUrl(newMediaUrl)}
            className="px-4 py-2 text-white transition-colors rounded-md bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Add URL
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Supported formats: JPG, PNG, GIF, WEBP, MP4, MOV, AVI. Enter full URLs
          starting with https://
        </p>
      </div>

      {mediaUrls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Added Media ({mediaUrls.length})
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
                title="Remove URL"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-3 mt-4 border border-[#4B7289] rounded-md bg-[#E6F4FA]">
        <p className="text-sm text-[#1A3C5A]">
          <strong>What Each Platform Needs:</strong>
        </p>
        <ul className="mt-1 space-y-2 text-xs text-[#2D3748]">
          <li>
            • Instagram: Add 1-10 images or 1 video (.jpg, .png, .mp4, or .mov).
            Images up to 8 MB, video up to 100 MB. Text up to 2200 characters.
            Don't mix images and video.
          </li>
          <li>
            • Snapchat: Use 1 image or 1 video (.jpg, .png, or .mp4). Image up
            to 20 MB, video up to 500 MB. Text up to 500 characters (160 for
            Spotlight). Spotlight needs 1 video, no images.
          </li>
          <li>
            • Pinterest: Add 1-5 images (.jpg or .png, up to 20 MB each). No
            videos. Text up to 500 characters.
          </li>
          <li>
            • YouTube: Add 1 video (.mp4 or .mov, up to 4 GB). No images. Text
            up to 5000 characters.
          </li>
          <li>
            • TikTok: Add 1 video (.mp4, .mov, or .webm, up to 1 GB). No images.
            Text up to 2200 characters.
          </li>
          <li>
            • Google Business: Add 1 image (.jpg or .png, up to 5 MB). No
            videos. Text up to 1500 characters.
          </li>
          <li>
            • Facebook: Include a title and text. Optional: 1-10 images or 1
            video (.jpg, .png, .mp4, .mov, or .avi). Images up to 10 MB, video
            up to 2 GB. Don't mix images and video, Text up to 63206 characters.
          </li>
          <li>
            • LinkedIn: Include a title and text. Optional: 1-9 images or 1
            video (.jpg, .png, or .mp4). Images up to 5 MB, video up to 200 MB.
            Text up to 3000 characters. Don't mix images and video.
          </li>
          <li>
            • X (Twitter): Include a title and text. Optional: 1-4 images or 1-4
            videos (.jpg, .png, .webp, .mp4, or .mov). Images up to 5 MB, videos
            up to 512 MB. Text up to 280 characters. Don't mix images and video.
          </li>
          <li>
            • Telegram: Include a title and text. No images or videos. Text up
            to 1024 characters.
          </li>
          <li>
            • Bluesky: Include a title and text. Optional: 1-4 images or 1 video
            (.jpg, .png, or .mp4). Images up to 1 MB, video up to 100 MB. Text
            up to 299 characters. Don't mix images and video.
          </li>
          <li>
            • Reddit: Include a title, text, and a Reddit link. Optional: 1
            image (.jpg or .png, up to 10 MB). No videos. Text up to 5000
            characters.
          </li>
          <li>
            • Threads: Optional: 1-20 images or 1 video (.jpg, .png, .mp4, or
            .mov). Images up to 8 MB, video up to 1 GB. Text up to 500
            characters. Don't mix images and video.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MediaURLManager;
