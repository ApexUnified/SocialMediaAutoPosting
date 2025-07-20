import Blog from "../models/Blog.js";
import {
  generateAIContent,
  generateRedditPostInfo,
} from "../services/aiService.js";
import {
  shareToSocialMedia,
  pollAyrshareUpdate,
} from "../services/socialMediaService.js";
import { translateContent } from "../services/translationService.js";

// Helper function to calculate reading time and word count
const calculateMetadata = (content) => {
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
  return { wordCount, readingTime };
};

// Generate AI content
export const generateContent = async (req, res) => {
  try {
    const { prompt, platforms, contentType = "general" } = req.body.prompt;
    let generatedContent;

    // Generate content based on content type
    if (contentType === "reddit") {
      const redditContent = await generateRedditPostInfo(prompt);
      generatedContent = {
        title: redditContent["Post Title"],
        content: redditContent["Post Text"],
        mediaUrls: redditContent.mediaUrls,
        metadata: {
          subreddit: redditContent.Subreddit,
          redditLink: redditContent["Reddit Link"],
        },
      };
    } else {
      generatedContent = await generateAIContent(prompt, platforms);
    }
    console.log("Generated content", generatedContent);

    res.status(201).json(generatedContent);
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({
      message: "Error generating content",
      error: error.message,
    });
  }
};

// Get all blog posts
export const getAllBlogs = async (req, res) => {
  try {
    const { hospital, tag, page = 1, limit = 10 } = req.query;
    const query = { status: "published", isActive: true };

    if (hospital) query.hospital = hospital;
    if (tag) query.tags = tag;

    const blogs = await Blog.find(query)
      .populate("hospital", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog posts" });
  }
};

// Get blog post by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("hospital", "name")
      .populate("author", "firstName lastName");

    if (!blog) {
      return res.status(404).json({ message: "Blog post not found Please Refresh The Page" });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blog post" });
  }
};

// Create new blog post
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      tags,
      mediaUrls,
      autoPublish,
      autoShare,
      aiGenerated,
      platforms,
      autoTranslate,
      metadata,
      lang
    } = req.body;
    console.log("mediaUrls: ", mediaUrls);
    // Calculate metadata
    const postMetadata = calculateMetadata(content);
    // console.log(req.body);
    console.log(req.aiGenerated);

    let blog;

    if (req.body.blogId) {
      blog = await Blog.findById(req.body.blogId);

      if (!blog) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      // ✅ Properly update the blog fields
      blog.title = title;
      blog.content = content;
      blog.tags = tags;
      blog.media = mediaUrls.map((m) => ({
        url: m,
        type:
          m.endsWith(".jpg") ||
            m.endsWith(".png") ||
            m.endsWith(".gif") ||
            m.endsWith(".webp")
            ? "image"
            : m.endsWith(".mp4") || m.endsWith(".mov") || m.endsWith(".avi")
              ? "video"
              : "document",
      }));
      blog.author = req.user._id;
      blog.hospital = req.user.hospitalId;
      blog.status = autoPublish ? "published" : "draft";
      blog.creationType = aiGenerated ? "ai_journalist" : "manual";
      blog.metadata = {
        ...postMetadata,
        lastModified: new Date(),
      };

    } else {
      // Create blog post
      blog = new Blog({
        title,
        content,
        tags,
        media: mediaUrls.map((m) => ({
          url: m,
          type:
            m.endsWith(".jpg") ||
              m.endsWith(".png") ||
              m.endsWith(".gif") ||
              m.endsWith(".webp")
              ? "image"
              : m.endsWith(".mp4") || m.endsWith(".mov") || m.endsWith(".avi")
                ? "video"
                : "document",
        })),
        author: req.user._id,
        hospital: req.user.hospitalId,
        status: autoPublish ? "published" : "draft",
        creationType: aiGenerated ? "ai_journalist" : "manual",
        metadata: {
          ...postMetadata,
          lastModified: new Date(),
        },
      });
    }

    await blog.save();


    // Handle auto-sharing if enabled
    let socialMediaResults = null;
    if (autoShare && autoPublish && platforms?.length > 0) {
      try {
        socialMediaResults = await shareToSocialMedia({
          title: title,
          post: content,
          platforms,
          mediaUrls: mediaUrls || [],
          metadata,
          shortenLinks: metadata?.shortenLinks || false,
          lang: lang
        });

        // console.log("Social media results:", socialMediaResults);

        // Update blog post with initial social media share results
        blog.socialMediaShares = socialMediaResults.map((result) => ({
          platform: result.platform,
          postUrl: result?.postUrl || null, // Use initial postUrl (null for TikTok)
          status: result.status === "success" ? "published" : "failed", // Mark as published or failed based on initial status
          publishedAt: result.status === "success" ? new Date() : null,
          sharedContent: result.data?.post || content, // Store initial post content
          postId: result.ayrsharePostId || null, // Store Ayrshare post ID for polling
        }));

        await blog.save(); // Save the blog post with initial share results

        // Initiate polling for platforms that need updates (TikTok for URL, others for shortened links)
        socialMediaResults.forEach(async (result) => {
          if (result.status === "success" && result.ayrsharePostId) {
            const updateResult = await pollAyrshareUpdate(
              result.ayrsharePostId,
              result.platform
            );
            if (updateResult) {
              // Update the blog post in the database with the retrieved update (postUrl and/or sharedContent)
              const updateFields = {};
              if (updateResult.postUrl) {
                updateFields["socialMediaShares.$[elem].postUrl"] =
                  updateResult.postUrl;
              }
              if (updateResult.sharedContent) {
                updateFields["socialMediaShares.$[elem].sharedContent"] =
                  updateResult.sharedContent;
              }

              if (Object.keys(updateFields).length > 0) {
                await Blog.findByIdAndUpdate(
                  blog._id,
                  { $set: updateFields },
                  { arrayFilters: [{ "elem.platform": result.platform }] }
                );
                // console.log(
                //   `Updated blog post ${blog._id} for platform ${result.platform} with:`,
                //   updateFields
                // );
              }
            }
          }

          return socialMediaResults;

        });
      } catch (error) {
        console.error("Error sharing to social media:", error);
        // Although sharing failed for some platforms, the blog post might still be created.
        // Return an error response indicating which platforms failed.
        const failedPlatforms =
          socialMediaResults?.filter((result) => result.status === "error") ||
          [];
        if (failedPlatforms.length > 0) {
          return res.status(400).json({
            success: false,
            message:
              "Blog post created, but failed to share to some social media platforms.",
            blog,
            failedShares: failedPlatforms.map((result) => ({
              platform: result.platform,
              message: result.message,
            })),
          });
        }

        // If the error was not a platform-specific failure captured in socialMediaResults
        return res.status(500).json({
          success: false,
          message: "Error sharing to social media",
          error: error.message,
        });
      }
    }

    // If auto-sharing was not enabled or completed successfully
    res.status(201).json({
      success: true,
      blog,
      socialMediaStatus: socialMediaResults
        ? {
          success: socialMediaResults.every(
            (result) => result.status === "success"
          ),
          message: socialMediaResults.every(
            (result) => result.status === "success"
          )
            ? "Blog created and shared successfully"
            : "Blog created, but some shares failed",
          results: socialMediaResults,
        }
        : null,
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ message: "Error creating blog post" });
  }
};

// Update blog post
export const updateBlog = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "title",
      "content",
      "tags",
      "media",
      "status",
      "isActive",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).json({ message: "Invalid updates" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    // Track modifications if blog was AI-generated
    if (blog.creationType === "ai_journalist") {
      blog.aiMetadata = blog.aiMetadata || {};
      blog.aiMetadata.modifications = blog.aiMetadata.modifications || [];
      blog.aiMetadata.modifications.push({
        field: updates.join(", "),
        originalValue: JSON.stringify(updates.map((u) => blog[u])),
        newValue: JSON.stringify(updates.map((u) => req.body[u])),
        timestamp: new Date(),
      });
    }

    // Update metadata if content is being updated
    if (updates.includes("content")) {
      const metadata = calculateMetadata(req.body.content);
      blog.metadata = {
        ...metadata,
        lastModified: new Date(),
      };
    }

    updates.forEach((update) => (blog[update] = req.body[update]));
    await blog.save();

    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Error updating blog post" });
  }
};

// Share blog post to social media
export const shareBlog = async (req, res) => {
  try {
    const { platforms, shortenLinks } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res
        .status(400)
        .json({ message: "Please specify platforms to share to" });
    }

    try {
      const socialMediaResults = await shareToSocialMedia({
        title: blog.title,
        post: blog.content,
        platforms,
        mediaUrls: blog.media?.map((m) => m.url) || [],
        shortenLinks: shortenLinks || false,
      });

      console.log("Social media share results:", socialMediaResults);

      // Update social media shares in the blog post
      const newShares = socialMediaResults.map((result) => ({
        platform: result.platform,
        postId: result.data.postIds?.[0]?.id || null, // Use the platform-specific post ID if available
        url: result.postUrl || null, // Use initial postUrl (null for TikTok)
        status: result.status === "success" ? "published" : "failed", // Mark as published or failed based on initial status
        error: result.status === "error" ? result.message : null,
        publishedAt: result.status === "success" ? new Date() : null,
        postUrl: result.postUrl || null, // Use initial postUrl
        sharedContent: result.data?.post || blog.content, // Store initial post content
        ayrsharePostId: result.ayrsharePostId || null, // Store Ayrshare post ID for polling
        // analytics will be updated later, start with defaults
        analytics: {
          // ... existing analytics initialization
        },
      }));

      blog.socialMediaShares = [
        ...(blog.socialMediaShares || []),
        ...newShares,
      ];
      await blog.save();

      // Initiate polling for platforms that need updates
      newShares.forEach(async (result) => {
        if (result.status === "success" && result.ayrsharePostId) {
          const updateResult = await pollAyrshareUpdate(
            result.ayrsharePostId,
            result.platform
          );
          if (updateResult) {
            // Update the blog post in the database with the retrieved update (postUrl and/or sharedContent)
            const updateFields = {};
            if (updateResult.postUrl) {
              updateFields["socialMediaShares.$[elem].postUrl"] =
                updateResult.postUrl;
            }
            if (updateResult.sharedContent) {
              updateFields["socialMediaShares.$[elem].sharedContent"] =
                updateResult.sharedContent;
            }

            if (Object.keys(updateFields).length > 0) {
              await Blog.findByIdAndUpdate(
                blog._id,
                { $set: updateFields },
                { arrayFilters: [{ "elem.platform": result.platform }] }
              );
              console.log(
                `Updated blog post ${blog._id} for platform ${result.platform} with:`,
                updateFields
              );
            }
          }
        }
      });

      res.json({
        message: "Blog post shared successfully",
        shares: newShares,
      });
    } catch (error) {
      console.error("Error sharing to social media:", error);
      res.status(500).json({
        message: "Error sharing to social media",
        error: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error sharing blog post" });
  }
};

// Get blog post translations
export const getBlogTranslations = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).select("translations");

    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    res.json(blog.translations || {});
  } catch (error) {
    res.status(500).json({ message: "Error fetching translations" });
  }
};

// Get blog post social media shares
export const getBlogShares = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).select("socialMediaShares");

    if (!blog) {
      return res.status(404).json({ message: "Blog post not found" });
    }

    res.json(blog.socialMediaShares || []);
  } catch (error) {
    res.status(500).json({ message: "Error fetching social media shares" });
  }
};
