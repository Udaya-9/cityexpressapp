import api, { getFiscalYearsApi } from '../../API/api';

export { getFiscalYearsApi };

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

export const getDepartmentsApi = async () => {
  try {
    const res = await api.post('/list/getGenericList', { FilterType: 'Department' });
    const list = res.data?.data || [];
    if (Array.isArray(list) && list.length > 0) {
      return list.map((d) => ({
        Value: d.Value,
        Label: (d.Label || '').trim(),
        DepartmentId: d.Value,
        DepartmentName: (d.Label || '').trim(),
      }));
    }
  } catch (err) {
    console.error('Failed to load departments from API:', err);
  }
  return [];
};

export const getUsersApi = async (orgId, departmentId) => {
  try {
    const res = await api.post('/list/getGenericList', {
      FilterType: 'User',
      DepartmentId: departmentId || undefined,
    });
    const list = res.data?.data || [];
    if (Array.isArray(list) && list.length > 0) {
      return list.map((u) => ({
        Value: u.Value,
        Label: (u.Label || '').trim(),
        Id: u.Value,
        FullName: (u.Label || '').trim(),
        DepartmentId: u.DepartmentId || null,
        departmentId: u.DepartmentId || null,
      }));
    }
  } catch (err) {
    console.error('Failed to load users from API:', err);
  }
  return [];
};

export const getVendorsApi = async () => {
  try {
    const res = await api.post('/list/getGenericList', { FilterType: 'Vendor' });
    const list = res.data?.data || [];
    if (Array.isArray(list) && list.length > 0) {
      return list.map((v) => ({
        Value: v.Value,
        Label: (v.Label || '').trim(),
        VendorId: v.Value,
        VendorName: (v.Label || '').trim(),
      }));
    }
  } catch (err) {
    console.error('Failed to load vendors from API:', err);
  }
  return [];
};


