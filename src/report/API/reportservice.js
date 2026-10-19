import api from '../../API/api';

export const getReportListApi = async () => {
  const res = await api.post('/report/list', {});
  return res.data?.data || [];
};

export const getReportFiltersApi = async (reportConfigId) => {
  const res = await api.post('/report/filters', { reportConfigId });
  return res.data?.data || [];
};

export const getGenericOptionsApi = async (filterType) => {
  if (!filterType) return [];
  try {
    const res = await api.post('/list/getGenericList', { FilterType: filterType });
    return res.data?.data || [];
  } catch (err) {
    console.error(`Failed to fetch options for ${filterType}:`, err);
    return [];
  }
};

export const executeReportApi = async ({ procedureName, params }) => {
  const res = await api.post('/report/execute', {
    procedureName,
    params: params || {},
  });
  return res.data || { data: [], columns: [], total: 0 };
};
