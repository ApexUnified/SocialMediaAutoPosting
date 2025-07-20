import axios from "axios";
import { imageSize } from "image-size";
import ffmpeg from "fluent-ffmpeg";


export const validateMediaSize = async (req, res) => {
  const {
    url,
    maxSizeMB,
    platformName,
    mediaType,
    validateDimensions = false,
    validateDuration = false,
    validateAspectRatio = false,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    minDuration,
    maxDuration,
    minAspectRatio,
    maxAspectRatio,
    lang
  } = req.body;


  if (!url || !maxSizeMB || !platformName || !mediaType) {
    return res.status(400).json({
      success: false,
      message:
        lang === "en" ? "Missing required fields: url, maxSizeMB, platformName, mediaType" : "필수 필드가 누락되었습니다: url, maxSizeMB, platformName, mediaType"
    });
  }

  const maxBytes = maxSizeMB * 1024 * 1024;

  try {
    // 1️⃣ Validate File Size
    const headRes = await axios.head(url);
    const sizeHeader = headRes.headers["content-length"];

    if (!sizeHeader) {
      return res.status(400).json({
        success: false,
        message: `${lang === "en" ? "No content-length header for" : "콘텐츠 길이 헤더가 없습니다"} ${platformName}.`,
      });
    }

    const sizeInBytes = parseInt(sizeHeader, 10);
    if (sizeInBytes > maxBytes) {
      return res.status(400).json({
        success: false,
        message: `${platformName} ${lang === "en" ? "Media is too large" : "미디어 파일이 너무 큽니다"} (${(
          sizeInBytes /
          1024 /
          1024
        ).toFixed(2)} MB). ${lang === "en" ? "Max allowed" : "최대 허용"}: ${maxSizeMB} MB.`,
      });
    }

    // 2️⃣ Validate Image
    if (mediaType === "image" && validateDimensions) {
      const bufferRes = await axios.get(url, { responseType: "arraybuffer" });
      const dimensions = imageSize(Buffer.from(bufferRes.data));

      const { width, height, type } = dimensions;

      if (
        (minWidth && width < minWidth) ||
        (maxWidth && width > maxWidth) ||
        (minHeight && height < minHeight) ||
        (maxHeight && height > maxHeight)
      ) {
        return res.status(400).json({
          success: false,
          message: lang === "en"
            ? `${platformName}: Current Image resolution (${width}x${height}) is invalid. Allowed Resolution Range:\n Width  ${minWidth}-${maxWidth}px, Height ${minHeight}-${maxHeight}px.`
            : `${platformName}: 현재 이미지 해상도 (${width}x${height})는 유효하지 않습니다. 허용된 해상도 범위:\n 너비 ${minWidth}-${maxWidth}px, 높이 ${minHeight}-${maxHeight}px.`
          ,
        });
      }

    }

    // 3️⃣ Validate Video
    if (mediaType === "video" && (validateDimensions || validateDuration)) {
      const videoMetadata = await new Promise((resolve, reject) => {
        ffmpeg.ffprobe(url, (err, metadata) => {
          if (err) reject(err);
          else resolve(metadata);
        });
      });

      const videoStream = videoMetadata.streams.find(
        (s) => s.width && s.height
      );
      const { width, height, duration } = {
        width: videoStream?.width,
        height: videoStream?.height,
        duration: videoMetadata.format.duration,
      };

      // Duration check
      if (validateDuration) {
        if (
          (minDuration && duration < minDuration) ||
          (maxDuration && duration > maxDuration)
        ) {
          return res.status(400).json({
            success: false,
            message: lang === "en"
              ? `${platformName}: Video duration is ${secondsToReadable(duration)}, which is outside the allowed range of ${secondsToReadable(minDuration)} to ${secondsToReadable(maxDuration)}.`
              : `${platformName}: 동영상 길이 ${secondsToReadable(duration)}는 허용된 범위(${secondsToReadable(minDuration)} ~ ${secondsToReadable(maxDuration)})를 벗어났습니다.`
            ,
          });
        }
      }


      // Dimensions check
      if (validateDimensions) {
        if (
          (minWidth && width < minWidth) ||
          (maxWidth && width > maxWidth) ||
          (minHeight && height < minHeight) ||
          (maxHeight && height > maxHeight)
        ) {
          return res.status(400).json({
            success: false,
            message: lang === "en"
              ? `${platformName}: Video dimensions are ${width}x${height}px, which are outside the allowed range of ${minWidth}–${maxWidth}px width and ${minHeight}–${maxHeight}px height.`
              : `${platformName}: 비디오 해상도 ${width}x${height}px는 허용된 범위인 너비 ${minWidth}~${maxWidth}px, 높이 ${minHeight}~${maxHeight}px를 벗어났습니다.`
            ,
          });
        }
      }


      // ✅ Optional Aspect Ratio Check
      if (validateAspectRatio) {
        const aspectRatio = width / height;
        if (
          (minAspectRatio && aspectRatio < minAspectRatio) ||
          (maxAspectRatio && aspectRatio > maxAspectRatio)
        ) {
          return res.status(400).json({
            success: false,
            message: lang === "en"
              ? `${platformName}: Video aspect ratio (${aspectRatio.toFixed(2)}) is not within allowed range (${minAspectRatio} to ${maxAspectRatio}).`
              : `${platformName}: 비디오 가로세로 비율 (${aspectRatio.toFixed(2)})이 허용된 범위 (${minAspectRatio} ~ ${maxAspectRatio})를 벗어났습니다.`
            ,
          });
        }
      }


    }

    // ✅ All validations passed
    return res.status(200).json({
      success: true,
      message: lang === "en"
        ? `${platformName}: Media Validation Passed ✅`
        : `${platformName}: 미디어 검증 통과 ✅`
      ,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: lang === "en"
        ? `Media validation failed for ${platformName}: "Please Make Sure This Is A Valid URL. And accessible. Via Browser"`
        : `${platformName}에 대한 미디어 검증 실패: "유효한 URL인지 확인하고, 브라우저에서 접근 가능한지 확인하세요."`
      ,
    });
  }
};


const secondsToReadable = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return remainingSeconds === 0
    ? `${minutes}m`
    : `${minutes}m ${remainingSeconds}s`;
}