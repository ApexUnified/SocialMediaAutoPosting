import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
// const AYRSHARE_API_KEY = import.meta.env.VITE_AYRSHARE_API_KEY;

class SocialMediaService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Get connection status for all platforms
  async getPlatformStatus() {
    try {
      const response = await this.api.get('/social-media/status');
      return response.data;
    } catch (error) {
      console.error('Error getting platform status:', error);
      throw error;
    }
  }

  // Generate content using AI
  async generateContent({ prompt, platforms }) {
    try {
      const response = await this.api.post('/social-media/generate', {
        prompt,
        platforms,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  // Create a new blog post
  async createBlogPost({ content, author, mediaFiles }) {
    try {
      const formData = new FormData();
      formData.append('content', JSON.stringify(content));
      formData.append('author', author);
      
      mediaFiles.forEach((file, index) => {
        formData.append(`media${index}`, file.file);
      });

      const response = await this.api.post('/blog/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  // Distribute content to selected platforms
  async distributeContent({ blogPostId, platforms, content, mediaFiles }) {
    try {
      const formData = new FormData();
      formData.append('blogPostId', blogPostId);
      formData.append('platforms', JSON.stringify(platforms));
      formData.append('content', JSON.stringify(content));
      
      mediaFiles.forEach((file, index) => {
        formData.append(`media${index}`, file.file);
      });

      const response = await this.api.post('/social-media/distribute', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error distributing content:', error);
      throw error;
    }
  }

  // Schedule a post for later
  async schedulePost({ blogPostId, platforms, scheduledTime }) {
    try {
      const response = await this.api.post('/social-media/schedule', {
        blogPostId,
        platforms,
        scheduledTime,
      });
      return response.data;
    } catch (error) {
      console.error('Error scheduling post:', error);
      throw error;
    }
  }

  // Get analytics for distributed posts
  async getPostAnalytics(blogPostId) {
    try {
      const response = await this.api.get(`/social-media/analytics/${blogPostId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting post analytics:', error);
      throw error;
    }
  }
}

export const socialMediaService = new SocialMediaService(); 