// Platform Selection Component
import { platforms } from "../../../utils/constants";

const PlatformSelector = ({ selectedPlatforms, onToggle }) => {
  // Platform-specific color mappings
  const platformColors = {
    bluesky: 'bg-sky-500',
    facebook: 'bg-blue-600',
    gmb: 'bg-blue-500', 
    instagram: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400',
    linkedin: 'bg-blue-700',
    pinterest: 'bg-red-600',
    reddit: 'bg-orange-500',
    telegram: 'bg-blue-500',
    threads: 'bg-gray-900',
    tiktok: 'bg-black',
    twitter: 'bg-black',
    youtube: 'bg-red-600',
    snapchat: 'bg-yellow-400'
  };

  // Special handling for platforms that need custom colors
  const getCustomStyle = (platformId) => {
    switch(platformId) {
      case 'facebook':
        return { backgroundColor: '#1877F2' };
      case 'gmb':
        return { backgroundColor: '#4285F4' };
      case 'linkedin':
        return { backgroundColor: '#0A66C2' };
      case 'pinterest':
        return { backgroundColor: '#E60023' };
      case 'reddit':
        return { backgroundColor: '#FF4500' };
      case 'telegram':
        return { backgroundColor: '#0088cc' };
      case 'youtube':
        return { backgroundColor: '#FF0000' };
      case 'snapchat':
        return { backgroundColor: '#FFFC00' };
      case 'instagram':
        return { 
          background: 'linear-gradient(45deg, #833AB4, #FD1D1D, #F77737)' 
        };
      default:
        return  { backgroundColor: '#000000' };
    }
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Select Platforms</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {platforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          const customStyle = getCustomStyle(platform.id);
          const hasCustomStyle = Object.keys(customStyle).length > 0;
          
          return (
            <label 
              key={platform.id} 
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition-colors"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(platform.id)}
                  className="sr-only"
                />
                <div 
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? hasCustomStyle
                        ? 'border-transparent'
                        : `${platformColors[platform.id]} border-transparent`
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  style={isSelected && hasCustomStyle ? customStyle : {}}
                >
                  {isSelected && (
                    <svg 
                      className="w-4 h-4 text-white" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">{platform.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformSelector;