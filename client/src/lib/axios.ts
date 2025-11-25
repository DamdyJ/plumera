import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL ?? "http://localhost:3000",
  timeout: 15_000,
  withCredentials: true,
});
