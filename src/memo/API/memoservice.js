import api from "../../API/api";

export const getMemosApi = async () => {
    const res = await api.get("/memo/listmemo");
    return res.data?.data || [];
};

export const createMemoApi = async (payload) => {
    const res = await api.post("/memo/new", payload);
    return res.data?.data;
};

export const updateMemoStatusApi = async (key, status) => {
    const res = await api.put("/memo/update-status", { key, status });
    return res.data?.data;
};
