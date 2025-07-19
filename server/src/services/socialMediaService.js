import axios from "axios";

const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY;
const AYRSHARE_API_URL = "https://api.ayrshare.com/api/";

const ayrshareClient = axios.create({
  baseURL: AYRSHARE_API_URL,
  headers: {
    Authorization: `Bearer ${AYRSHARE_API_KEY}`,
    "Content-Type": "application/json",
  },
});

export const shareToSocialMedia = async ({
  title,
  post,
  platforms,
  mediaUrls,
  metadata,
  shortenLinks,
}) => {

  try {
    const results = await Promise.all(
      platforms.map(async (platform) => {

        let payload = {
          title,
          post: post,
          platforms: [platform],
          ...(mediaUrls && mediaUrls.length > 0 && { media_urls: mediaUrls }),
          youTubeVisibility: "public",
          ...(platform === "reddit" && { subreddit: metadata?.subreddit }),
          ...(platform === "reddit" && { reddit_link: metadata?.redditLink }),
          shortenLinks: shortenLinks,
        };
        if (platform === "snapchat") {
          if (metadata.snapchatPostType === "spotlight") {
            payload.snapChatOptions = { spotlight: true, title };
          }
          if (metadata.snapchatPostType === "saved_story") {
            payload.snapChatOptions = { savedStory: true, title };
          }
        }
        try {
          const response = await ayrshareClient.post("/post", payload);
          console.log(`Ayrshare response for ${platform}:`, response.data);
          const postUrl = response.data.postIds?.[0]?.postUrl || null;

          // Return Ayrshare post ID and platform along with other details
          return {
            platform,
            status: "success",
            data: response.data,
            postUrl,
            ayrsharePostId: response.data.id, // Get the main Ayrshare post ID
            message: `Successfully shared to ${platform}`,
          };
        } catch (error) {
          console.log("Catch Runs");
          // console.log("error social media", error.response.data.errors);
          // Enhanced error logging and response
          const errorDetails = error.response?.data || {};

          // console.log(errorDetails);
          const errorMessage = errorDetails.message || error.message;
          const errorCode = errorDetails.code || error.response?.status;

          let ayrsharePostId = errorDetails?.id || null;

          // Checking Post Id Exists Or Not
          console.log("error Details");
          console.log(error.response);
          console.log(ayrsharePostId);
          console.log("status Code: " + errorCode);


          // console.error(`Error sharing to ${platform}:`, {
          //   error: errorMessage,
          //   code: errorCode,
          //   details: errorDetails,
          // });

          return {
            platform,
            status: "error",
            message: errorDetails.errors?.[0]?.message || errorMessage,
            ayrsharePostId: ayrsharePostId,
          };
        }
      })
    );

    return results;
  } catch (error) {
    console.error("Error sharing to social media:", error);
    throw new Error(
      `Failed to share content to social media: ${error.message}`
    );
  }
};

// New function to poll Ayrshare for post status and updated content
export const pollAyrshareUpdate = async (ayrsharePostId, platform) => {
  const MAX_POLLING_ATTEMPTS = 20; // Increased attempts for content updates
  const POLLING_INTERVAL_MS = 5000; // Poll every 5 seconds

  for (let i = 0; i < MAX_POLLING_ATTEMPTS; i++) {
    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_MS));

    try {
      const response = await ayrshareClient.get(`/history/${ayrsharePostId}`);
      console.log(
        `Polling status for ${platform} (ID: ${ayrsharePostId}):`,
       response.data
     );

      const platformShare = response.data.postIds?.find(
        (share) => share.platform === platform
      );

      // Check if postUrl is available (for TikTok) or if post content has changed (for shortened links)
      if (platformShare && platformShare.status === "success") {
        const updatedPostUrl = platformShare.postUrl || null;
        const updatedContent = response.data.post || null; // Get updated content

        // Return if postUrl is found (TikTok) or if content is updated and has a link (for shortening)
        if (
          updatedPostUrl ||
          (updatedContent && updatedContent !== response.data.originalPost)
        ) {
          // Assuming response.data.originalPost exists or compare with initial content if needed
           console.log(
            `${platform} update found: URL - ${updatedPostUrl}, Content - ${updatedContent}`
           );
          return { postUrl: updatedPostUrl, sharedContent: updatedContent };
        }
      } else if (platformShare && platformShare.status === "failed") {
        console.error(`${platform} post failed:`, platformShare.message);
        throw new Error(`${platform} post failed: ${platformShare.message}`);
      }
    } catch (error) {
      console.error(`Error polling Ayrshare for ${platform} status:`, error);
      // Continue polling even if there's a temporary error
    }
  }

  console.warn(
    `Max polling attempts reached for ${platform} (ID: ${ayrsharePostId}). Post update not found.`
  );
  return null; // Return null if update is not found after max attempts
};

export const getPlatformStatus = async () => {
  try {
    const response = await ayrshareClient.get("/profiles");
    const profiles = response.data.profiles || [];

    // Create a map of platform statuses
    const status = {};
    platforms.forEach((platform) => {
      status[platform] = profiles.some(
        (profile) => profile.platform === platform
      );
    });

    return status;
  } catch (error) {
    console.error("Error getting platform status:", error);
    throw new Error("Failed to get platform status");
  }
};
