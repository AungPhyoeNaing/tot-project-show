import axios from "axios";

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  const host = typeof window !== "undefined" && window.location.hostname ? window.location.hostname : "127.0.0.1";
  if (host === "totumdy.com" || host.endsWith(".totumdy.com")) {
    const proto = window.location.protocol || "https:";
    return `${proto}//api.totumdy.com/api`;
  }
  return `http://${host}:8000/api`;
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;