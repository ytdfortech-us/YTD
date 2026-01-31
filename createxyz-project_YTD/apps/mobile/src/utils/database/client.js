import * as SecureStore from 'expo-secure-store';
import fetchToWeb from '../../__create/fetch';

const API_KEY_STORAGE_KEY = 'mobile-db-api-key';
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || '';

class DatabaseClient {
  constructor() {
    this.apiKey = null;
  }

  /**
   * Initialize the client with API key
   */
  async initialize() {
    try {
      this.apiKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
      if (!this.apiKey) {
        throw new Error('API key not found. Please configure your API key.');
      }
    } catch (error) {
      console.error('Failed to initialize database client:', error);
      throw error;
    }
  }

  /**
   * Set API key for authentication
   */
  async setApiKey(apiKey) {
    try {
      await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
      this.apiKey = apiKey;
    } catch (error) {
      console.error('Failed to store API key:', error);
      throw error;
    }
  }

  /**
   * Make authenticated request to database API
   */
  async request(endpoint, options = {}) {
    if (!this.apiKey) {
      await this.initialize();
    }

    const url = `${BASE_URL}/api/mobile${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetchToWeb(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Database API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // User Profile Methods
  async getUserProfile(userId) {
    return this.request(`/profile/${userId}`);
  }

  async createUserProfile(profileData) {
    return this.request('/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async updateUserProfile(userId, updates) {
    return this.request(`/profile/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Fatigue Check Methods
  async submitFatigueCheck(checkData) {
    return this.request('/fatigue-check', {
      method: 'POST',
      body: JSON.stringify(checkData),
    });
  }

  async getFatigueCheckHistory(userId, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    
    const queryString = params.toString();
    const endpoint = `/fatigue-check/history/${userId}${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  // Wellness Methods
  async getWellnessActivities(category = null) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    
    const queryString = params.toString();
    const endpoint = `/wellness/activities${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async completeWellnessActivity(completionData) {
    return this.request('/wellness/complete', {
      method: 'POST',
      body: JSON.stringify(completionData),
    });
  }

  async getWellnessStats(userId, period = 'all') {
    return this.request(`/wellness/stats/${userId}?period=${period}`);
  }

  // Community Methods
  async getCommunityPosts(options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    if (options.category) params.append('category', options.category);
    if (options.search) params.append('search', options.search);
    
    const queryString = params.toString();
    const endpoint = `/community/posts${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async createCommunityPost(postData) {
    return this.request('/community/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async getCommunityPost(postId) {
    return this.request(`/community/posts/${postId}`);
  }

  async addCommunityComment(postId, commentData) {
    return this.request(`/community/posts/${postId}`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  // Parking Methods
  async searchParkingLocations(options = {}) {
    const params = new URLSearchParams();
    if (options.lat) params.append('lat', options.lat);
    if (options.lng) params.append('lng', options.lng);
    if (options.radius) params.append('radius', options.radius);
    if (options.limit) params.append('limit', options.limit);
    if (options.search) params.append('search', options.search);
    
    const queryString = params.toString();
    const endpoint = `/parking/locations${queryString ? `?${queryString}` : ''}`;
    return this.request(endpoint);
  }

  async createParkingLocation(locationData) {
    return this.request('/parking/locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async getParkingLocation(locationId) {
    return this.request(`/parking/locations/${locationId}`);
  }

  async addParkingReview(locationId, reviewData) {
    return this.request(`/parking/locations/${locationId}`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }
}

// Export singleton instance
export const databaseClient = new DatabaseClient();
export default databaseClient;


