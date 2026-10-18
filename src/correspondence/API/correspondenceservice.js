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
  const orgId = filters.organizationId || getStoredOrgId();
  if (orgId) params.append('organizationId', orgId);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await api.get(`/correspondence/list${query}`);
  return res.data?.data || [];
};

export const createCorrespondenceApi = async (payload) => {
  const orgId = payload.organizationId || getStoredOrgId();
  const res = await api.post('/correspondence/new', {
    ...payload,
    ...(orgId ? { organizationId: orgId } : {}),
  });
  return res.data?.data;
};

export const batchCreateOutgoingApi = async ({ count = 1, remarks, departmentId, createdBy }) => {
  const generated = [];
  const orgId = getStoredOrgId();
  const safeCount = Math.min(Math.max(parseInt(count, 10) || 1, 1), 50);
  for (let i = 0; i < safeCount; i++) {
    const res = await createCorrespondenceApi({
      type: 'outgoing',
      remarks: remarks || null,
      departmentId: departmentId || null,
      organizationId: orgId,
      createdBy: createdBy || null,
    });
    if (res) generated.push(res);
  }
  return generated;
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

export const getUsersApi = async (orgId, departmentId) => {
  const resolvedOrgId = orgId || getStoredOrgId();
  try {
    const payload = {};
    if (resolvedOrgId) payload.OrganizationId = resolvedOrgId;
    if (departmentId) {
      payload.Department = departmentId;
      payload.DepartmentId = departmentId;
    }
    const res = await api.post(
      '/users/getUserList',
      payload
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

export const getFiscalYearsApi = async (orgId) => {
  const resolvedOrgId = orgId || getStoredOrgId();
  try {
    const res = await api.post(
      '/generic/getFiscalYearList',
      resolvedOrgId ? { OrganizationId: resolvedOrgId } : {}
    );
    return res.data?.data || [];
  } catch (err) {
    console.error('Failed to load fiscal years from API:', err);
    return [];
  }
};

