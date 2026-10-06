import axios from "axios";

const MODE = process.env.NODE_ENV;   // "development" | "production"

const API_URLS = {
    development: process.env.REACT_APP_API_URL_DEV,
    production:  process.env.REACT_APP_API_URL_PROD,
};

const baseURL = API_URLS[MODE] || API_URLS.development;

console.log(`[API] MODE=${MODE}, URL=${baseURL}`);

const api = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err.response?.status;
        const url = err.config?.url || "";
        const isLoginRequest = url.includes("/user/login");
        if (status === 401 && !isLoginRequest) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/";
        }

        return Promise.reject(err);
    }
);

export default api;