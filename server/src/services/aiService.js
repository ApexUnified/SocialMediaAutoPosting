import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateAIContent = async (prompt, platforms) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables.");
  }

  const socialMediaPlatforms = platforms.join(", ");
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a professional social media content creator. Create engaging, high-quality content optimized for the following platforms: ${socialMediaPlatforms}.
      
          Generate the content in the same language as the user's prompt.

          Return the response in the following strict JSON format:
          {
            "title": "string",
            "content": "string",
            "mediaUrls": ["string"]
          }

        Important rules for "mediaUrls":
        - Only include **real, working URLs** pointing directly to media files.
        - Each URL must point to a real publicly accessible image or video that can be **previewed directly** in a browser.
        - File must end with one of the following extensions: **.jpg**, **.jpeg**, **.png**, or **.mp4** only.
        - DO NOT generate placeholder URLs like "example.com" or imaginary domains.
        - DO NOT include Dropbox, Google Drive, Unsplash, or similar hosts that require authentication or do not support direct file access.
        - Each URL must be publicly accessible and embed-friendly (e.g., usable in AyrShare or when pasted in a browser).
        - Absolutely no documents (PDFs, DOCs, etc.), shortened links, or temporary URLs.

        If no valid media URL is available, return an empty array for "mediaUrls".`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const rawResponse = completion.choices[0].message.content;

    try {
      const parsedResponse = JSON.parse(rawResponse);

      console.log("Parsed response", parsedResponse);
      if (
        typeof parsedResponse.title === "string" &&
        typeof parsedResponse.content === "string" &&
        Array.isArray(parsedResponse.mediaUrls) &&
        parsedResponse.mediaUrls.every((url) => typeof url === "string")
      ) {
        return parsedResponse;
      } else {
        console.error(
          "OpenAI returned JSON with unexpected structure:",
          parsedResponse
        );
        throw new Error("OpenAI returned JSON with unexpected structure.");
      }
    } catch (parseError) {
      console.error(
        "Failed to parse JSON from OpenAI response:",
        rawResponse,
        parseError
      );
      throw new Error("Failed to parse JSON response from OpenAI.");
    }
  } catch (error) {
    console.error("Error generating AI content:", error);
    throw new Error("Failed to generate content");
  }
};

export const generateRedditPostInfo = async (prompt) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables.");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant designed to output JSON. Your task is to process the user's request and generate information about a hypothetical or real Reddit post in the following JSON format:
{
  "Post Title": "string",
  "Subreddit": "string",
  "Reddit Link": "string",
  "Post Text": "string",
  "mediaUrls": ["string"]
}

The 'mediaUrls' field should be an array of strings, even if there's only one URL or no URLs. Ensure the output is ONLY the JSON object and is valid JSON.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawResponse = completion.choices[0].message.content;

    try {
      const parsedResponse = JSON.parse(rawResponse);
      if (
        typeof parsedResponse["Post Title"] === "string" &&
        typeof parsedResponse["Subreddit"] === "string" &&
        typeof parsedResponse["Reddit Link"] === "string" &&
        typeof parsedResponse["Post Text"] === "string" &&
        Array.isArray(parsedResponse["mediaUrls"]) &&
        parsedResponse["mediaUrls"].every((url) => typeof url === "string")
      ) {
        return parsedResponse;
      } else {
        console.error(
          "OpenAI returned JSON with unexpected structure:",
          parsedResponse
        );
        throw new Error("OpenAI returned JSON with unexpected structure.");
      }
    } catch (parseError) {
      console.error(
        "Failed to parse JSON from OpenAI response:",
        rawResponse,
        parseError
      );
      throw new Error("Failed to parse JSON response from OpenAI.");
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
};
