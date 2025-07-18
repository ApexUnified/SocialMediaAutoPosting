import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: false,
    },
    media: [
      {
        url: String,
        type: {
          type: String,
          enum: ["image", "video", "document"],
          default: "image",
        },
      },
    ],

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    creationType: {
      type: String,
      enum: ["manual", "semi_auto", "ai_journalist"],
      required: true,
    },
    aiMetadata: {
      prompt: String,
      generatedContent: String,
      modifications: [
        {
          field: String,
          originalValue: String,
          newValue: String,
          timestamp: Date,
        },
      ],
    },
    translations: [
      {
        language: String,
        title: String,
        content: String,
        lastUpdated: Date,
      },
    ],

    socialMediaShares: [
      {
        platform: {
          type: String,
          enum: [
            "twitter",
            "facebook",
            "instagram",
            "linkedin",
            "pinterest",
            "youtube",
            "telegram",
            "threads",
            "tiktok",
            "bluesky",
            "reddit",
            "gmb",
            "snapchat",
          ],
          required: true,
        },
        postId: String,
        url: String,
        status: {
          type: String,
          enum: ["pending", "published", "failed"],
          default: "pending",
        },
        error: String,
        publishedAt: Date,
        analytics: {
          likes: { type: Number, default: 0 },
          shares: { type: Number, default: 0 },
          comments: { type: Number, default: 0 },
          reach: { type: Number, default: 0 },
        },
        postUrl: String,
        sharedContent: String,
      },
    ],
    exposure: {
      weight: {
        type: Number,
        default: 1,
      },
      views: {
        type: Number,
        default: 0,
      },
      engagement: {
        likes: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
      },
    },
    tags: [String],

    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      readingTime: Number,
      wordCount: Number,
      lastModified: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
blogSchema.index({ hospital: 1, status: 1 });
blogSchema.index({ "exposure.weight": -1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({
  "socialMediaShares.platform": 1,
  "socialMediaShares.status": 1,
});

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
