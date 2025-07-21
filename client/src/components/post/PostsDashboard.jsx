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
  X,
} from "lucide-react";
import { blogService } from "../../services/blogService";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { platforms } from "../../../utils/constants";
import imageThumbnail from "../../assets/image-thumbnail-blog.jpg";
import videoThumbnail from "../../assets/video-thumbnail-blog.jpg";
import useLanguage from "../../hook/useLanguage";
import Swal from "sweetalert2";

// Enhanced Post Card Component
const EnhancedPostCard = ({ post }) => {
  const { lang } = useLanguage();
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
    return type === "ai_journalist"
      ? lang === "en"
        ? "AI Generated"
        : "AI 생성"
      : lang === "en"
      ? "Manual"
      : "수동 생성";
  };

  const handleDelete = (id) => {
    Swal.fire({
      title:
        lang === "en"
          ? "Do You Really Want to Delete This Post?"
          : "정말 이 게시물을 삭제하시겠습니까?",
      showCancelButton: true,
      cancelButtonColor: "#d33",
      cancelButtonText: lang === "en" ? "Cancel" : "죽기",
      confirmButtonText: lang === "en" ? "Delete it" : "삭제",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await blogService.delete(id, lang);

          if (response.status) {
            Swal.fire({
              icon: "success",
              title: lang === "en" ? "Deleted!" : "삭제됨!",
              text: response.message,
              confirmButtonText: lang === "en" ? "OK" : "확인",
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload();
              }
            });
          } else {
            Swal.fire({
              icon: "error",
              title: lang === "en" ? "Oops..." : "이런...",
              text: response.message,
              confirmButtonText: lang === "en" ? "OK" : "확인",
            });
          }
        } catch (error) {
          console.log(error);
          Swal.fire({
            icon: "error",
            title: lang === "en" ? "Oops..." : "이런...",
            text: error || "Something went wrong!",
          });
        }
      }
    });
  };

  const getPlatformIcon = (share) => {
    const platform = share.platform;

    const platformConfig = {
      bluesky: {
        bg:
          share.status === "failed"
            ? "bg-pink-800"
            : share.postUrl
            ? "bg-sky-500"
            : "bg-neutral-300",
        icon: "🦋",
        text: "BS",
      },

      facebook: {
        bg:
          share.status === "failed"
            ? "bg-pink-800"
            : share.postUrl
            ? "bg-blue-600"
            : "bg-neutral-300",
        icon: "📘",
        text: "f",
      },

      gmb: {
        bg:
          share.status === "failed"
            ? "bg-pink-800"
            : share.postUrl
            ? "bg-blue-500"
            : "bg-neutral-300",
        icon: "🏢",
        text: "G",
      },

      instagram: {
        bg:
          share.status === "failed"
            ? "bg-pink-800"
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
            ? "bg-pink-800"
            : share.postUrl
            ? "bg-blue-500"
            : "bg-neutral-300",
        icon: "💼",
        text: "in",
      },

      pinterest: {
        bg:
          share.status === "failed"
            ? "bg-pink-800"
            : share.postUrl
            ? "bg-red-600"
            : "bg-neutral-300",
        icon: "📌",
        text: "P",
      },

      reddit: {
        bg:
          share.status === "failed"
            ? "bg-pink-800"
            : share.postUrl
            ? "bg-orange-600"
            : "bg-neutral-300",
        icon: "🤖",
        text: "r",
      },

      telegram: {
        bg:
          share.status === "failed"
            ? "bg-pink-800"
            : share.postUrl
            ? "bg-blue-500"
            : "bg-neutral-300",
        icon: "✈️",
        text: "T",
      },

      threads: {
        bg:
          share.status === "failed"
            ? "bg-pink-800"
            : share.postUrl
            ? "bg-black"
            : "bg-neutral-300",
        icon: "🧵",
        text: "@",
      },

      tiktok: {
        bg:
          share.status === "failed"
            ? "bg-pink-800"
            : share.postUrl
            ? "bg-black"
            : "bg-neutral-300",
        icon: "🎵",
        text: "TT",
      },

      twitter: {
        bg:
          share.status === "failed"
            ? "bg-pink-800"
            : share.postUrl
            ? "bg-black"
            : "bg-neutral-300",
        icon: "🐦",
        text: "𝕏",
      },

      youtube: {
        bg:
          share.status === "failed"
            ? "bg-pink-800"
            : share.postUrl
            ? "bg-red-600"
            : "bg-neutral-300",
        icon: "📺",
        text: "▶",
      },

      snapchat: {
        bg:
          share.status === "failed"
            ? "bg-pink-800"
            : share.postUrl
            ? "bg-yellow-400"
            : "bg-neutral-300",
        icon: "👻",
        text: "👻",
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
            loading="lazy"
          />
          <div className="items-center justify-center hidden w-full h-full bg-gradient-to-br from-blue-800 to-pink-200">
            <img
              src={videoThumbnail}
              alt="Post media"
              className="object-cover w-full h-full"
              loading="lazy"
            />
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
            <img
              src={imageThumbnail}
              alt="Post media"
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-6 ">
        <button
          onClick={() => handleDelete(post._id)}
          className="absolute text-gray-400 transition-colors bg-slate-950 top-3 right-3"
          title="Delete Post"
        >
          <X size={20} />
        </button>

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
                {lang === "en"
                  ? post.status
                  : post.status === "published"
                  ? lang === "en"
                    ? "Published"
                    : "게시됨"
                  : post.status === "draft"
                  ? lang === "en"
                    ? "Draft"
                    : "초안"
                  : post.status === "scheduled"
                  ? lang === "en"
                    ? "Scheduled"
                    : "예약됨"
                  : ""}
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
                  {lang === "en" ? "Published" : "게시됨"}{" "}
                  {formatTime(post.socialMediaShares[0].publishedAt)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white">
                  {lang === "en" ? "Published on" : "게시된 날짜"}:
                </span>
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
  const { lang } = useLanguage();
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
            {lang === "en"
              ? "Ready to create amazing content?"
              : "멋진 콘텐츠를 만들 준비가 되었나요?"}
          </h3>
          <p className="mb-8 leading-relaxed text-gray-600">
            {lang === "en"
              ? " Get started by creating your first post and sharing it across multiple platforms to reach your audience."
              : "첫 번째 게시물을 만들어 여러 플랫폼에 공유하여 청중에 도달하세요."}
          </p>
          <button
            onClick={onCreatePost}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-3 mx-auto font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            <span>
              {lang === "en"
                ? "Create Your First Post"
                : "첫 번째 게시물 만들기"}
            </span>
          </button>
        </div>
      </div>
    );
  }

  const getVisiblePages = (currentPage, totalPages, maxPagesToShow = 5) => {
    const half = Math.floor(maxPagesToShow / 2);
    let start = Math.max(currentPage - half, 1);
    let end = start + maxPagesToShow - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxPagesToShow + 1, 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

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
          <span>{lang === "en" ? "Create Post" : "게시물 만들기"}</span>
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
              placeholder={lang === "en" ? "Search posts..." : "게시물 검색..."}
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
                  ? lang === "en"
                    ? "AI Generated"
                    : "AI 생성"
                  : status === "manual"
                  ? lang === "en"
                    ? "Manual"
                    : "수동 생성"
                  : status === "published"
                  ? lang === "en"
                    ? "Published"
                    : "게시됨"
                  : status === "all"
                  ? lang === "en"
                    ? "All"
                    : "모두"
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
          {pagination.total} {lang === "en" ? "total posts" : "총 게시물"} •{" "}
          {lang === "en" ? "Page" : "페이지"} {pagination.page}{" "}
          {lang === "en" ? "of" : "의"} {pagination.pages}
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
            {lang === "en" ? "No posts found" : "게시물이 없습니다"}
          </h3>
          <p className="mb-4 text-gray-600">
            {searchTerm
              ? `${
                  lang === "en"
                    ? "No posts match"
                    : "일치하는 게시물이 없습니다"
                } "${searchTerm}"`
              : `${lang === "en" ? "No" : "아니요"} ${filter}  ${
                  lang === "en" ? "Posts Found" : "게시물 발견됨"
                }`}
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilter("all");
            }}
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            {lang === "en" ? "Clear filters" : "필터 초기화"}
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            className="p-3 mt-10 transition-colors border border-gray-300 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ArrowLeft size={16} className="text-white" />
          </button>

          <div className="hidden md:flex">
            {getVisiblePages(currentPage, pagination.pages, 10).map((page) => (
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
            ))}
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
