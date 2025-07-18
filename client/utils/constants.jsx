// const platforms = [
//     { id: "bluesky", label: "Bluesky", color: "bg-sky-500 hover:bg-sky-600", enabled: true },
//     { id: "facebook", label: "Facebook", color: "bg-[#1877F2] hover:bg-[#166FE5]", enabled: true },
//     { id: "gmb", label: "Google Business", color: "bg-[#4285F4] hover:bg-[#3367D6]", enabled: true },
//     { id: "instagram", label: "Instagram", color: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:from-[#6B2F94] hover:via-[#D91818] hover:to-[#D66630]", enabled: true },
//     { id: "linkedin", label: "LinkedIn", color: "bg-[#0A66C2] hover:bg-[#004182]", enabled: true },
//     { id: "pinterest", label: "Pinterest", color: "bg-[#E60023] hover:bg-[#AD081B]", enabled: true },
//     { id: "reddit", label: "Reddit", color: "bg-[#FF4500] hover:bg-[#FF5700]", enabled: true },
//     { id: "telegram", label: "Telegram", color: "bg-[#0088cc] hover:bg-[#0077B5]", enabled: true },
//     { id: "threads", label: "Threads", color: "bg-black hover:bg-gray-900", enabled: true },
//     { id: "tiktok", label: "TikTok", color: "bg-black hover:bg-gray-900", enabled: true },
//     { id: "twitter", label: "X/Twitter", color: "bg-black hover:bg-gray-900", enabled: true },
//     { id: "youtube", label: "YouTube", color: "bg-[#FF0000] hover:bg-[#CC0000]", enabled: true },
//     { id: "snapchat", label: "Snapchat", color: "bg-[#FFFC00] hover:bg-[#FFE600]", enabled: true },
//   ];


//   export { platforms };



const platforms = [
  { 
    id: "bluesky", 
    label: "Bluesky", 
    baseColor: "bg-sky-500", 
    hoverColor: "hover:bg-sky-600", 
    enabled: true 
  },
  { 
    id: "facebook", 
    label: "Facebook", 
    baseColor: "bg-blue-600", 
    style: { backgroundColor: '#1877F2' },
    enabled: true 
  },
  { 
    id: "gmb", 
    label: "Google Business", 
    baseColor: "bg-blue-500",
    style: { backgroundColor: '#4285F4' },
    enabled: true 
  },
  { 
    id: "instagram", 
    label: "Instagram", 
    baseColor: "",
    style: { background: 'linear-gradient(45deg, #833AB4, #FD1D1D, #F77737)' },
    enabled: true 
  },
  { 
    id: "linkedin", 
    label: "LinkedIn", 
    baseColor: "bg-blue-700",
    style: { backgroundColor: '#0A66C2' },
    enabled: true 
  },
  { 
    id: "pinterest", 
    label: "Pinterest", 
    baseColor: "bg-red-600",
    style: { backgroundColor: '#E60023' },
    enabled: true 
  },
  { 
    id: "reddit", 
    label: "Reddit", 
    baseColor: "bg-orange-600",
    style: { backgroundColor: '#FF4500' },
    enabled: true 
  },
  { 
    id: "telegram", 
    label: "Telegram", 
    baseColor: "bg-blue-500",
    style: { backgroundColor: '#0088cc' },
    enabled: true 
  },
  { 
    id: "threads", 
    label: "Threads", 
    baseColor: "bg-black", 
    enabled: true 
  },
  { 
    id: "tiktok", 
    label: "TikTok", 
    baseColor: "bg-black", 
    enabled: true 
  },
  { 
    id: "twitter", 
    label: "X/Twitter", 
    baseColor: "bg-black", 
    enabled: true 
  },
  { 
    id: "youtube", 
    label: "YouTube", 
    baseColor: "bg-red-600",
    style: { backgroundColor: '#FF0000' },
    enabled: true 
  },
  { 
    id: "snapchat", 
    label: "Snapchat", 
    baseColor: "bg-yellow-400",
    style: { backgroundColor: '#FFFC00' },
    enabled: true 
  },
];

export { platforms };