import api from '../../API/api';

export const listParameterSettingsApi = async () => {
  const res = await api.post('/parameter-settings/list', {});
  return res.data?.data || [];
};

export const listParameterMenusApi = async () => {
  const res = await api.post('/parameter-settings/menus', {});
  return res.data?.data || [];
};

export const getParameterSettingApi = async (paramterId) => {
  const res = await api.post('/parameter-settings/detail', { paramterId });
  return res.data?.data || null;
};

export const saveParameterSettingApi = async (payload) => {
  const res = await api.post('/parameter-settings/save', payload);
  return res.data;
};

export const deleteParameterSettingApi = async (paramterId) => {
  const res = await api.post('/parameter-settings/delete', { paramterId });
  return res.data;
};

export const listProceduresApi = async () => {
  const res = await api.post('/parameter-settings/procedures', {});
  return res.data?.data || [];
};

export const getProcedureParametersApi = async (procedureName) => {
  const res = await api.post('/parameter-settings/procedure-parameters', { procedureName });
  return res.data?.data || [];
};

export const runParameterSettingApi = async ({ paramterId, params }) => {
  const res = await api.post('/parameter-settings/run', { paramterId, params: params || {} });
  return res.data || { data: [], columns: [], total: 0 };
};
