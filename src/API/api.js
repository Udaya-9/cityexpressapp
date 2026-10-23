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

    const orgId = localStorage.getItem("organizationId") || (() => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user?.organizationId || user?.OrganizationId) {
                return user.organizationId || user.OrganizationId;
            }
        } catch {}
        try {
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(atob(base64));
                return payload?.organizationId || payload?.OrganizationId || "";
            }
        } catch {}
        return "";
    })();
    if (orgId && !config.headers["organization-id"]) {
        config.headers["organization-id"] = orgId;
    }

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
            localStorage.removeItem("organizationId");
            window.location.href = "/";
        }

        return Promise.reject(err);
    }
);

export const getStaticDataApi = async (module) => {
    try {
        const res = await api.post("/list/getGenericList", {
            FilterType: "StaticData",
            module: module || null,
        });
        return res.data?.data || [];
    } catch (err) {
        console.error(`Failed to fetch static data for ${module}:`, err);
        return [];
    }
};

export const getFiscalYearsApi = async () => {
    try {
        const res = await api.post("/list/getGenericList", { FilterType: "FiscalYear" });
        return (res.data?.data || [])
            .map((f) => {
                const year = (f.Label || f.FiscalYear || f.Value || "").toString().trim();
                return { Value: year, Label: year, FiscalYear: year, FiscalId: f.Value };
            })
            .sort((a, b) => b.FiscalYear.localeCompare(a.FiscalYear, undefined, { numeric: true, sensitivity: "base" }));
    } catch {
        return [];
    }
};

export default api;