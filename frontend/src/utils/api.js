import axios from "axios";
import { ACCESS_TOKEN, API_URL } from "./constants";

const APIURL = API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: APIURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
