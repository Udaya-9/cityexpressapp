import api from '../../API/api';

export const getStoredOrgId = () => {
  const direct = localStorage.getItem('organizationId');
  if (direct) return direct;
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.organizationId || user?.OrganizationId) {
      return user.organizationId || user.OrganizationId;
    }
  } catch {}
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return payload?.organizationId || payload?.OrganizationId || null;
    }
  } catch {}
  return null;
};

export const getCorrespondenceApi = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.type) params.append('type', filters.type);
  if (filters.fiscalYear) params.append('fiscalYear', filters.fiscalYear);
  if (filters.department) params.append('department', filters.department);
  if (filters.user) params.append('user', filters.user);
  const orgId = filters.organizationId || filters.orgid || getStoredOrgId();

  if (orgId) {
    params.append('organizationId', orgId);
    params.append('orgid', orgId);
  }
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await api.get(`/correspondence/list${query}`);
  return res.data?.data || [];
};

export const createCorrespondenceApi = async (payload) => {
  const orgId = payload.organizationId || payload.orgid || getStoredOrgId();
  const res = await api.post('/correspondence/new', {
    ...payload,
    ...(orgId ? { organizationId: orgId, orgid: orgId } : {}),
  });
  return res.data?.data;
};

export const updateHandoverStatusApi = async ({ key, referenceId, handoverStatus, handoverBy, handoverDate }) => {
  const res = await api.put('/correspondence/update-status', {
    key,
    referenceId,
    handoverStatus,
    handoverBy,
    handoverDate,
  });
  return res.data?.data;
};

export const getDepartmentsApi = async (orgId) => {
  const resolvedOrgId = orgId || getStoredOrgId();
  try {
    const res = await api.post(
      '/department/getDepartmentList',
      resolvedOrgId ? { OrganizationId: resolvedOrgId } : {}
    );
    return res.data?.data || [];
  } catch (err) {
    console.error('Failed to load departments from API:', err);
    return [];
  }
};

export const getUsersApi = async (orgId) => {
  const resolvedOrgId = orgId || getStoredOrgId();
  try {
    const res = await api.post(
      '/users/getUserList',
      resolvedOrgId ? { OrganizationId: resolvedOrgId } : {}
    );
    return res.data?.data || [];
  } catch (err) {
    console.error('Failed to load users from API:', err);
    return [];
  }
};

export const getVendorsApi = async (orgId) => {
  const resolvedOrgId = orgId || getStoredOrgId();
  try {
    const res = await api.post(
      '/generic/getVendorList',
      resolvedOrgId ? { OrganizationId: resolvedOrgId } : {}
    );
    return res.data?.data || [];
  } catch (err) {
    console.error('Failed to load vendors from API:', err);
    return [];
  }
};

