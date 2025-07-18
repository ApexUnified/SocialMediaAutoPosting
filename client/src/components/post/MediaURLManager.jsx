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
      const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
      const extension = url.split('.').pop()?.toLowerCase();
      
      if (videoExtensions.includes(extension)) return 'video';
      if (imageExtensions.includes(extension)) return 'image';
      return 'unknown';
    };
  
    const handleAdd = () => {
      if (newMediaUrl.trim() && isValidUrl(newMediaUrl)) {
        onAdd(newMediaUrl.trim());
        setNewMediaUrl("");
      }
    };
  
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    };
  
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Media URLs
        </label>
  
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="url"
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Paste image or video URL (https://...)"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newMediaUrl.trim() || !isValidUrl(newMediaUrl)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Add URL
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: JPG, PNG, GIF, WEBP, MP4, MOV, AVI. Enter full URLs starting with https://
          </p>
        </div>
  
        {mediaUrls.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Added Media ({mediaUrls.length})</h4>
            {mediaUrls.map((url, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium text-white ${
                    getMediaType(url) === 'video' ? 'bg-red-500' :
                    getMediaType(url) === 'image' ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    {getMediaType(url) === 'video' ? <Video size={16} /> :
                     getMediaType(url) === 'image' ? <Image size={16} /> : <File size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{url}</p>
                    <p className="text-xs text-gray-500 capitalize">{getMediaType(url)} URL</p>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(index)}
                  className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  title="Remove URL"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
  
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Platform Requirements:</strong>
          </p>
          <ul className="text-xs text-yellow-700 mt-1 space-y-1">
            <li>• Instagram, TikTok, Pinterest: Require at least one media URL</li>
            <li>• YouTube: Requires a video URL</li>
            <li>• Other platforms: Media URLs are optional</li>
          </ul>
        </div>
      </div>
    );
  };

export default MediaURLManager;