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
    // console.log("share: ", share);
    const platformConfig = {
      bluesky: {
        bg: share.postUrl
          ? "bg-sky-500"
          : share.status === "failed"
          ? "bg-rose-700"
          : "bg-red-600",
        icon: "🦋",
        text: "BS",
      },

      facebook: {
        bg: share.postUrl
          ? "bg-blue-600"
          : share.status === "failed"
          ? "bg-rose-700"
          : "bg-red-600",
        icon: "📘",
        text: "f",
        style: { backgroundColor: "#1877F2" },
      },

      gmb: {
        bg: share.postUrl
          ? "bg-blue-500"
          : share.status === "failed"
          ? "bg-rose-700"
          : "bg-red-600",
        icon: "🏢",
        text: "G",
        style: { backgroundColor: "#4285F4" },
      },

      instagram: {
        bg: !share.postUrl
          ? "bg-red-600"
          : share.status === "failed"
          ? "bg-rose-700"
          : "",
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
        bg: share.postUrl
          ? "bg-blue-500"
          : share.status === "failed"
          ? "bg-rose-700"
          : "bg-red-600",
        icon: "💼",
        text: "in",
        style: { backgroundColor: "#0A66C2" },
      },

      pinterest: {
        bg: share.postUrl
          ? "bg-red-600"
          : share.status === "failed"
          ? "bg-rose-700"
          : "bg-red-800",
        icon: "📌",
        text: "P",
        style: { backgroundColor: "#E60023" },
      },

      reddit: {
        bg: share.postUrl
          ? "bg-orange-600"
          : share.status === "failed"
          ? "bg-rose-700"
          : "bg-red-600",
        icon: "🤖",
        text: "r",
        style: { backgroundColor: "#FF4500" },
      },

      telegram: {
        bg: share.postUrl
          ? "bg-blue-500"
          : share.status === "failed"
          ? "bg-rose-700"
          : "bg-red-600",
        icon: "✈️",
        text: "T",
        style: { backgroundColor: "#0088cc" },
      },

      threads: {
        bg: share.postUrl
          ? "bg-black"
          : share.status === "failed"
          ? "bg-rose-700"
          : "bg-red-600",
        icon: "🧵",
        text: "@",
      },

      tiktok: {
        bg: share.postUrl
          ? "bg-black"
          : share.status === "failed"
          ? "bg-rose-700"
          : "bg-red-600",
        icon: "🎵",
        text: "TT",
      },

      twitter: {
        bg: share.postUrl
          ? "bg-black"
          : share.status === "failed"
          ? "bg-rose-700"
          : "bg-red-600",
        icon: "🐦",
        text: "𝕏",
      },

      youtube: {
        bg: share.postUrl
          ? "bg-red-600"
          : share.status === "failed"
          ? "bg-rose-700"
          : "bg-red-800",
        icon: "📺",
        text: "▶",
        style: { backgroundColor: "#FF0000" },
      },

      snapchat: {
        bg: share.postUrl
          ? "bg-yellow-400"
          : share.status === "failed"
          ? "bg-rose-700"
          : "bg-red-600",
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer">
      {/* Media Preview (if available) */}
      {post.media && post.media.length > 0 && (
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={post.media[0].url}
            alt="Post media"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 items-center justify-center hidden">
            <div className="text-center">
              <FileText size={32} className="text-blue-500 mx-auto mb-2" />
              <span className="text-sm font-medium text-blue-700">
                Media Content
              </span>
            </div>
          </div>
          {/* Media count badge */}
          {post.media.length > 1 && (
            <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-lg text-xs font-medium">
              +{post.media.length - 1} more
            </div>
          )}
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
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {getCreationTypeBadge(post.creationType)}
              </span>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
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
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
          {post.title}
        </h3>

        {/* Content Preview */}
        <p className="text-gray-600 text-sm line-clamp-4 mb-4 leading-relaxed">
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
                  className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md font-medium"
                >
                  {tag}
                </span>
              ))}
            {post.content.match(/#\w+/g).length > 3 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                +{post.content.match(/#\w+/g).length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Bottom Section - Platforms */}
        {post.socialMediaShares && post.socialMediaShares.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">
                  Published on:
                </span>
                <div className="flex gap-1">
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

              {/* Status indicator with timestamp */}
              <div className="text-xs text-gray-400">
                {post.socialMediaShares[0]?.publishedAt && (
                  <span>
                    Published{" "}
                    {formatTime(post.socialMediaShares[0].publishedAt)}
                  </span>
                )}
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
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Ready to create amazing content?
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          {/* <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Content Dashboard</h2>
          <p className="text-gray-600 text-lg">Manage and track your social media content performance</p> */}
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
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                    ? "bg-blue-600 text-white shadow-md"
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

        <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg whitespace-nowrap">
          {pagination.total} total posts • Page {pagination.page} of{" "}
          {pagination.pages}
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <EnhancedPostCard key={post._id} post={post} />
        ))}
      </div>

      {/* No Results */}
      {filteredPosts.length === 0 && (filter !== "all" || searchTerm) && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No posts found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? `No posts match "${searchTerm}"`
              : `No ${filter} posts found`}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilter("all");
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-3 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>

          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.pages}
            className="p-3 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PostsDashboard;
