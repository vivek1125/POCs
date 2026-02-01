import axios, { InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'https://localhost:7210';

const apiService = axios.create({
  baseURL: API_BASE_URL,
});

apiService.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    console.log('Adding token to request:', token.substring(0, 20) + '...');
    // Build a plain record for headers, set Authorization, then assign back (cast to any)
    const headers = (config.headers as Record<string, string> | undefined) ?? {};
    headers['Authorization'] = `Bearer ${token}`;
    // cast to any to satisfy Axios internal headers type
    config.headers = headers as any;
  } else {
    console.log('No token found in localStorage for request');
  }
  return config;
}, (error: any) => {
  return Promise.reject(error);
});

// Response interceptor to handle 401 errors
apiService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('401 Unauthorized - clearing auth data and redirecting to login');
      // Clear authentication data
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userData');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiService;
