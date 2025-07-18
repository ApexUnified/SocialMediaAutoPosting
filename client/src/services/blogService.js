import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class BlogService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async create(blogData) {
    try {
      // console.log(blogData);
      const response = await this.api.post("/blogs", {
        ...blogData,
        autoShare: true, // Enable automatic sharing by default
        autoPublish: true,
        platforms: blogData.platforms || [], // Social media platforms to share to
        autoTranslate: blogData.autoTranslate || false, // Optional translation
        creationType: blogData.aiGenerated ? "ai_journalist" : "manual",
      });

      return response.data;
    } catch (error) {
      console.error("Error creating blog:", error);
      throw error.response.data;
    }
  }

  async generateContent(prompt, platforms) {
    try {
      const response = await this.api.post("/blogs/generate", {
        prompt,
        platforms,
      });
      return response.data;
    } catch (error) {
      console.error("Error generating content:", error);
      throw new Error(
        error.response?.data?.message || "Failed to generate content"
      );
    }
  }

  async shareToSocialMedia(blogId, platforms, mediaUrls) {
    try {
      const response = await this.api.post(`/blogs/${blogId}/share`, {
        platforms,
        mediaUrls,
      });
      return response.data;
    } catch (error) {
      console.error("Error sharing blog:", error);
      throw new Error(
        error.response?.data?.message || "Failed to share blog post"
      );
    }
  }

  async getAll({ page = 1, limit = 10 }) {
    try {
      const response = await this.api.get("/blogs", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching blogs:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await this.api.get(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching blog:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch blog");
    }
  }

  async update(id, updates) {
    try {
      const response = await this.api.put(`/blogs/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error("Error updating blog:", error);
      throw new Error(error.response?.data?.message || "Failed to update blog");
    }
  }

  async delete(id) {
    try {
      const response = await this.api.delete(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting blog:", error);
      throw new Error(error.response?.data?.message || "Failed to delete blog");
    }
  }

  async uploadImage(imageFile) {
    const formData = new FormData();
    formData.append("image", imageFile);
    const response = await this.api.post("/blogs/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async getSocialMediaShares(blogId) {
    try {
      const response = await this.api.get(`/blogs/${blogId}/shares`);
      return response.data;
    } catch (error) {
      console.error("Error fetching social media shares:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch social media shares"
      );
    }
  }

  async getTranslations(blogId) {
    try {
      const response = await this.api.get(`/blogs/${blogId}/translations`);
      return response.data;
    } catch (error) {
      console.error("Error fetching translations:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch translations"
      );
    }
  }

  async getBlogTranslations(blogId) {
    try {
      const response = await this.api.get(`/blogs/${blogId}/translations`);
      return response.data;
    } catch (error) {
      console.error("Error fetching translations:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch translations"
      );
    }
  }
}

export const blogService = new BlogService();
