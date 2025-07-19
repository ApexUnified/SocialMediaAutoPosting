import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  FileText,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Clock,
  TrendingUp,
  Filter,
  Search,
  BarChart3,
  Users,
  Globe,
  XIcon,
} from "lucide-react";
import { blogService } from "../../services/blogService";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { platforms } from "../../../utils/constants";

// Enhanced Post Card Component
const EnhancedPostCard = ({ post }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getTotalEngagement = () => {
    return (
      (post.exposure?.engagement?.likes || 0) +
      (post.exposure?.engagement?.shares || 0) +
      (post.exposure?.engagement?.comments || 0)
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCreationTypeIcon = (type) => {
    return type === "ai_journalist" ? "🤖" : "✍️";
  };

  const getCreationTypeBadge = (type) => {
    return type === "ai_journalist" ? "AI Generated" : "Manual";
  };

  const getPlatformIcon = (share) => {
    const platform = share.platform;

    const platformConfig = {
      bluesky: {
        bg:
          share.status === "failed"
            ? "bg-rose-700"
            : share.postUrl
            ? "bg-sky-500"
            : "bg-neutral-300",
        icon: "🦋",
        text: "BS",
      },

      facebook: {
        bg:
          share.status === "failed"
            ? "bg-rose-700"
            : share.postUrl
            ? "bg-blue-600"
            : "bg-neutral-300",
        icon: "📘",
        text: "f",
        style: { backgroundColor: "#1877F2" },
      },

      gmb: {
        bg:
          share.status === "failed"
            ? "bg-rose-700"
            : share.postUrl
            ? "bg-blue-500"
            : "bg-neutral-300",
        icon: "🏢",
        text: "G",
        style: { backgroundColor: "#4285F4" },
      },

      instagram: {
        bg:
          share.status === "failed"
            ? "bg-rose-900"
            : share.postUrl
            ? "bg-red-600"
            : "bg-neutral-300",
        icon: "📷",
        text: "ig",
        ...(share.postUrl &&
          share.status !== "failed" && {
            style: {
              background: "linear-gradient(45deg, #833AB4, #FD1D1D, #F77737)",
            },
          }),
      },

      linkedin: {
        bg:
          share.status === "failed"
            ? "bg-rose-700"
            : share.postUrl
            ? "bg-blue-500"
            : "bg-neutral-300",
        icon: "💼",
        text: "in",
        style: { backgroundColor: "#0A66C2" },
      },

      pinterest: {
        bg:
          share.status === "failed"
            ? "bg-rose-700"
            : share.postUrl
            ? "bg-red-600"
            : "bg-neutral-300",
        icon: "📌",
        text: "P",
        style: { backgroundColor: "#E60023" },
      },

      reddit: {
        bg:
          share.status === "failed"
            ? "bg-rose-700"
            : share.postUrl
            ? "bg-orange-600"
            : "bg-neutral-300",
        icon: "🤖",
        text: "r",
        style: { backgroundColor: "#FF4500" },
      },

      telegram: {
        bg:
          share.status === "failed"
            ? "bg-rose-700"
            : share.postUrl
            ? "bg-blue-500"
            : "bg-neutral-300",
        icon: "✈️",
        text: "T",
        style: { backgroundColor: "#0088cc" },
      },

      threads: {
        bg:
          share.status === "failed"
            ? "bg-rose-700"
            : share.postUrl
            ? "bg-black"
            : "bg-neutral-300",
        icon: "🧵",
        text: "@",
      },

      tiktok: {
        bg:
          share.status === "failed"
            ? "bg-rose-700"
            : share.postUrl
            ? "bg-black"
            : "bg-neutral-300",
        icon: "🎵",
        text: "TT",
      },

      twitter: {
        bg:
          share.status === "failed"
            ? "bg-rose-700"
            : share.postUrl
            ? "bg-black"
            : "bg-neutral-300",
        icon: "🐦",
        text: "𝕏",
      },

      youtube: {
        bg:
          share.status === "failed"
            ? "bg-rose-700"
            : share.postUrl
            ? "bg-red-600"
            : "bg-neutral-300",
        icon: "📺",
        text: "▶",
        style: { backgroundColor: "#FF0000" },
      },

      snapchat: {
        bg:
          share.status === "failed"
            ? "bg-rose-700"
            : share.postUrl
            ? "bg-yellow-400"
            : "bg-neutral-300",
        icon: "👻",
        text: "👻",
        style: { backgroundColor: "#FFFC00" },
      },
    };

    const config = platformConfig[platform] || {
      bg: "bg-gray-500",
      icon: "🌐",
      text: platform.charAt(0).toUpperCase(),
    };
    // console.log("config: ", config);

    return (
      <div
        className={`w-6 h-6 rounded text-white flex items-center justify-center text-xs font-bold ${config.bg}`}
        style={config.style}
        title={platform.charAt(0).toUpperCase() + platform.slice(1)}
      >
        <span>{config.text}</span>
      </div>
    );
  };

  return (
    <div className="overflow-hidden font-bold text-white transition-all duration-300 shadow-2xl cursor-pointer shadow-black bg-gradient-to-t from-blue-800 to-pink-200 rounded-2xl hover:scale-105 group">
      {/* Media Preview (if available) */}
      {post.media && post.media.length > 0 ? (
        <div className="relative h-48">
          <img
            src={post.media[0].url}
            alt="Post media"
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className="items-center justify-center hidden w-full h-full bg-gradient-to-br from-blue-800 to-pink-200">
            <div className="text-center">
              <FileText size={32} className="mx-auto mb-2 text-white" />
              <span className="text-sm font-medium text-white">
                Media Content
              </span>
            </div>
          </div>
          {/* Media count badge */}
          {post.media.length > 1 && (
            <div className="absolute px-2 py-1 text-xs font-medium text-white bg-black rounded-lg top-3 right-3 bg-opacity-60">
              +{post.media.length - 1} more
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-48">
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-blue-800 to-pink-200">
            <div className="text-center">
              <XIcon size={40} className="mx-auto mb-2 text-white" />
              <span className="text-sm font-medium text-white">
                No Media Content
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-6">
        {/* Header with badges and date */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {getCreationTypeIcon(post.creationType)}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  post.status
                )}`}
              >
                {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
              </span>
              <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                {getCreationTypeBadge(post.creationType)}
              </span>
            </div>
          </div>
          <div className="text-xs text-right text-gray-500">
            <div className="flex items-center gap-1 mb-1">
              <Calendar size={12} />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={10} />
              <span>{formatTime(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="mb-3 text-xl font-bold leading-tight text-gray-900 transition-colors line-clamp-2 group-hover:text-white/70">
          {post.title}
        </h3>

        {/* Content Preview */}
        <p className="mb-4 text-sm leading-relaxed text-gray-600 line-clamp-4">
          {post.socialMediaShares?.[0]?.sharedContent ||
            post.content
              .replace(/[#@]\w+/g, "")
              .replace(/🌟|🍂|🌐|🤝|✨|💼|🚀|📈|💡/g, "")
              .trim()}
        </p>

        {/* Tags/Hashtags Preview */}
        {post.content.match(/#\w+/g) && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.content
              .match(/#\w+/g)
              .slice(0, 3)
              .map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium text-white rounded-md bg-slate-800"
                >
                  {tag}
                </span>
              ))}
            {post.content.match(/#\w+/g).length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-md">
                +{post.content.match(/#\w+/g).length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Bottom Section - Platforms */}
        {post.socialMediaShares && post.socialMediaShares.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            {/* Status indicator with timestamp */}
            <div className="my-1 text-sm text-white ">
              {post.socialMediaShares[0]?.publishedAt && (
                <span>
                  Published {formatTime(post.socialMediaShares[0].publishedAt)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white">Published on:</span>
                <div className="flex flex-wrap items-start gap-1">
                  {post.socialMediaShares.map((share, index) => (
                    <a
                      key={index}
                      href={share.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getPlatformIcon(share)}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Stats Card Component
const StatsCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="p-6 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-gray-600">{title}</p>
          <p className="mb-1 text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}
        >
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
};

// Main Posts Dashboard Component
const PostsDashboard = ({ onCreatePost }) => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Your existing fetchPosts function
  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await blogService.getAll({ page, limit: 6 });
      setPosts(response.blogs || []);
      setPagination(response.pagination || { total: 0, page: 1, pages: 1 });
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate stats from actual posts data
  const calculateStats = () => {
    const totalViews = posts.reduce(
      (sum, post) => sum + (post.exposure?.views || 0),
      0
    );
    const totalEngagement = posts.reduce(
      (sum, post) =>
        sum +
        (post.exposure?.engagement?.likes || 0) +
        (post.exposure?.engagement?.shares || 0) +
        (post.exposure?.engagement?.comments || 0),
      0
    );
    const aiGeneratedPosts = posts.filter(
      (post) => post.creationType === "ai_journalist"
    ).length;
    const publishedPosts = posts.filter(
      (post) => post.status === "published"
    ).length;

    return { totalViews, totalEngagement, aiGeneratedPosts, publishedPosts };
  };

  const stats = calculateStats();

  const filteredPosts = posts.filter((post) => {
    const matchesFilter = (() => {
      if (filter === "all") return true;
      if (filter === "ai") return post.creationType === "ai_journalist";
      if (filter === "manual") return post.creationType === "manual";
      return post.status === filter;
    })();

    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
            <FileText className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-gray-900">
            Ready to create amazing content?
          </h3>
          <p className="mb-8 leading-relaxed text-gray-600">
            Get started by creating your first post and sharing it across
            multiple platforms to reach your audience.
          </p>
          <button
            onClick={onCreatePost}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-3 mx-auto font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            <span>Create Your First Post</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {/* <h2 className="mb-2 text-3xl font-bold text-gray-900 lg:text-4xl">Content Dashboard</h2>
          <p className="text-lg text-gray-600">Manage and track your social media content performance</p> */}
        </div>
        <button
          onClick={onCreatePost}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-fit"
        >
          <Plus size={18} />
          <span>Create Post</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col flex-1 gap-4 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={20}
              className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
            />
            <input
              type="search"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-10 pr-4 transition-all duration-200 border border-slate-500 rounded-xl"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {["all", "published", "ai", "manual"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  filter === status
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {status === "ai"
                  ? "AI Generated"
                  : status === "manual"
                  ? "Manual"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
                {status === "all" && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {posts.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-2 text-sm text-gray-600 rounded-lg bg-gray-50 whitespace-nowrap">
          {pagination.total} total posts • Page {pagination.page} of{" "}
          {pagination.pages}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredPosts.map((post) => (
          <EnhancedPostCard key={post._id} post={post} />
        ))}
      </div>

      {/* No Results */}
      {filteredPosts.length === 0 && (filter !== "all" || searchTerm) && (
        <div className="py-12 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No posts found
          </h3>
          <p className="mb-4 text-gray-600">
            {searchTerm
              ? `No posts match "${searchTerm}"`
              : `No ${filter} posts found`}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilter("all");
            }}
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            className="p-3 mt-10 transition-colors border border-gray-300 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ArrowLeft size={16} className="text-white" />
          </button>

          <div className="hidden md:flex">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-3 mt-10 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            className="p-3 mt-10 transition-colors rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.pages}
          >
            <ArrowRight size={16} className="text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PostsDashboard;
