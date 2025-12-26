import axios from 'axios';
import { tokenStorage } from './token';

// TODO: Replace with your actual backend URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Token Refresh Logic
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handle Errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        const accessToken = await tokenStorage.getAccessToken(); // Get expired access token

        if (!refreshToken || !accessToken) {
          throw new Error('No tokens available');
        }

        // Call refresh endpoint
        // Using axios directly to avoid interceptor loops
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          accessToken: accessToken,
          refreshToken: refreshToken,
        });

        // Check response structure based on user's spec
        const { item, type } = response.data;

        if (type === 'FAIL' || !item) {
          throw new Error('Token refresh failed on server');
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          item;

        await tokenStorage.setAccessToken(newAccessToken);
        if (newRefreshToken) {
          await tokenStorage.setRefreshToken(newRefreshToken);
        }

        apiClient.defaults.headers.common['Authorization'] =
          'Bearer ' + newAccessToken;
        processQueue(null, newAccessToken);

        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await tokenStorage.clearTokens();
        // Redirect logic would go here, usually handled by React Context or Router redirecting when token is missing
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
