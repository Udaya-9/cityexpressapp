import axios from "axios";

const API_BASE_URL = "http://localhost:7869/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Optional: attach auth token if you have one
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const createVendorApi = async (payload) => {
    const response = await api.post("/vendor/new", payload);
    return response.data;
};