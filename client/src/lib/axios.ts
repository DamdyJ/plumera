import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000",
  timeout: 15_000,
});

api.interceptors.request.use(
  async (config) => {
    const { getToken } = useAuth(); 
    if (getToken) {
      const token = await getToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;