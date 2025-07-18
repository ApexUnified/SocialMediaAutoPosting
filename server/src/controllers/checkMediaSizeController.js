// blogController.js
import axios from "axios";

export const validateMediaSize = async (req, res) => {
  const { url, maxSizeMB, platformName } = req.body;

  if (!url || !maxSizeMB || !platformName) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: url, maxSizeMB, platformName",
    });
  }

  const maxBytes = maxSizeMB * 1024 * 1024;

  try {
    const response = await axios.head(url);
    const sizeHeader = response.headers["content-length"];

    if (!sizeHeader) {
      return res.status(400).json({
        success: false,
        message: `No content-length header for ${platformName}.`,
      });
    }

    const sizeInBytes = parseInt(sizeHeader, 10);

    if (isNaN(sizeInBytes)) {
      return res.status(400).json({
        success: false,
        message: "Invalid content-length value.",
      });
    }

    if (sizeInBytes > maxBytes) {
      return res.status(400).json({
        success: false,
        message: `${platformName} media is too large (${(
          sizeInBytes /
          1024 /
          1024
        ).toFixed(2)} MB). Max allowed: ${maxSizeMB} MB.`,
      });
    }

    // ✅ Passed
    return res.status(200).json({
      success: true,
      message: "Media size is valid.",
      sizeMB: (sizeInBytes / 1024 / 1024).toFixed(2),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Media validation failed for ${platformName}: ${error.message}. Please ensure the file is accessible via URL.`,
    });
  }
};
