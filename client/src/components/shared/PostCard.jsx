import { CheckCircle, Clock, Edit, ExternalLink, Eye, Image, Sparkles, Trash2 } from "lucide-react";

import { platforms } from "../../../utils/constants";

// const PostCard = ({ post }) => {
//     const formatDate = (dateString) => {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     };
  
//     const getPlatformInfo = (platformId) => {
//       return platforms.find(p => p.id === platformId) || { label: platformId, color: 'bg-gray-500' };
//     };
  
//     const getSharedPlatforms = () => {
//       return post.socialMediaShares?.map(share => share.platform) || [];
//     };
  
//     return (
//       <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
//         <div className="flex items-start justify-between mb-3">
//           <div className="flex-1">
//             <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{post.title}</h3>
//             <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
//           </div>
//           <div className="flex items-center space-x-2 ml-3">
//             <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
//               post.status === 'published' ? 'bg-green-100 text-green-800' :
//               post.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
//               'bg-gray-100 text-gray-800'
//             }`}>
//               {post.status === 'published' ? <CheckCircle size={12} /> : <Clock size={12} />}
//               <span className="capitalize">{post.status}</span>
//             </div>
//             {post.creationType === 'ai_journalist' && (
//               <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
//                 <Sparkles size={12} />
//                 <span>AI</span>
//               </div>
//             )}
//           </div>
//         </div>
  
//         {/* Platforms */}
//         <div className="flex flex-wrap gap-1 mb-3">
//           {getSharedPlatforms().map(platformId => {
//             const platform = getPlatformInfo(platformId);
//             return (
//               <span
//                 key={platformId}
//                 className={`${platform.color} text-white px-2 py-1 rounded-full text-xs font-medium`}
//               >
//                 {platform.label}
//               </span>
//             );
//           })}
//         </div>
  
//         {/* Media Count */}
//         {post.media && post.media.length > 0 && (
//           <div className="flex items-center space-x-1 text-sm text-gray-500 mb-3">
//             <Image size={14} />
//             <span>{post.media.length} media file{post.media.length !== 1 ? 's' : ''}</span>
//           </div>
//         )}
  
//         {/* Stats and Date */}
//         <div className="flex items-center justify-between text-sm text-gray-500">
//           <span>{formatDate(post.createdAt)}</span>
//           {post.exposure?.engagement && (
//             <div className="flex space-x-3">
//               <span className="flex items-center space-x-1">
//                 <Eye size={12} />
//                 <span>{post.exposure.views || 0}</span>
//               </span>
//               <span>{post.exposure.engagement.likes || 0} likes</span>
//               <span>{post.exposure.engagement.comments || 0} comments</span>
//             </div>
//           )}
//         </div>
  
//         {/* Action Buttons */}
//         <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
//           <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
//             <Edit size={16} />
//           </button>
//           <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
//             <Trash2 size={16} />
//           </button>
//           <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
//             <ExternalLink size={16} />
//           </button>
//         </div>
//       </div>
//     );
//   };
const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformInfo = (platformId) => {
    return platforms.find(p => p.id === platformId) || { label: platformId, color: 'bg-gray-500' };
  };

  const getSharedPlatforms = () => {
    return post.socialMediaShares?.map(share => share.platform) || [];
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 overflow-hidden">
      {/* Main Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
              {post.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
              {post.content}
            </p>
          </div>
        </div>

        {/* Status and Type Badges */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            post.status === 'published' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : post.status === 'scheduled' 
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}>
            {post.status === 'published' ? <CheckCircle size={12} /> : <Clock size={12} />}
            <span className="capitalize">{post.status}</span>
          </div>
          
          {post.creationType === 'ai_journalist' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200">
              <Sparkles size={12} />
              <span>AI</span>
            </div>
          )}
        </div>

        {/* Platforms */}
        <div className="flex flex-wrap gap-2 mb-4">
          {getSharedPlatforms().slice(0, 4).map(platformId => {
            const platform = getPlatformInfo(platformId);
            return (
              <span
                key={platformId}
                className={`${platform.color} text-white px-2.5 py-1 rounded-md text-xs font-medium shadow-sm`}
              >
                {platform.label}
              </span>
            );
          })}
          {getSharedPlatforms().length > 4 && (
            <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium">
              +{getSharedPlatforms().length - 4}
            </span>
          )}
        </div>

        {/* Media Indicator */}
        {post.media && post.media.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
              <Image size={14} />
              <span>{post.media.length} media</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50">
        <span className="text-xs text-gray-500 font-medium">
          {formatDate(post.createdAt)}
        </span>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
            <Edit size={16} />
          </button>
          <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
            <ExternalLink size={16} />
          </button>
          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default PostCard;