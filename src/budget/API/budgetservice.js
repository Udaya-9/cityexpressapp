import api from '../../API/api';

export const getStoredUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id || user?.Id || user?.userId || user?.sys_user_id) {
      return user.id || user.Id || user.userId || user.sys_user_id;
    }
  } catch {}
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      return payload?.id || payload?.Id || payload?.userId || null;
    }
  } catch {}
  return null;
};

export const getFiscalYearsApi = async () => {
  try {
    const res = await api.post('/list/getGenericList', { FilterType: 'FiscalYear' });
    const list = (res.data?.data || []).map((f) => {
      const yearName = (f.Label || f.FiscalYear || f.Value || '').toString().trim();
      return {
        Value: yearName,
        Label: yearName,
        FiscalYear: yearName,
        FiscalId: f.Value,
      };
    });
    return list.sort((a, b) => b.FiscalYear.localeCompare(a.FiscalYear, undefined, { numeric: true, sensitivity: 'base' }));
  } catch {
    return [];
  }
};

export const getDepartmentsApi = async () => {
  try {
    const res = await api.post('/list/getGenericList', { FilterType: 'Department' });
    return (res.data?.data || []).map((d) => ({
      Value: d.Value,
      Label: d.Label,
      DepartmentId: d.Value,
      DepartmentName: d.Label,
    }));
  } catch {
    return [];
  }
};

export const getStaticDataApi = async (module) => {
  try {
    const res = await api.post('/list/getGenericList', { FilterType: 'StaticData', module: module || null });
    return res.data?.data || [];
  } catch {
    return [];
  }
};

export const getBudgetHeadingsApi = async (fiscalYear) => {
  const payload = {
    sys_user_id: getStoredUserId(),
    fiscalyear: fiscalYear || null,
    filtertype: 'heading',
  };
  const res = await api.post('/budgeting/list', payload);
  const data = res.data?.data || [];
  return data.map((item) => ({
    id: item.BudgetHeadId,
    BudgetHeadId: item.BudgetHeadId,
    code: (item.HeadingCode || '').trim(),
    headingCode: (item.HeadingCode || '').trim(),
    heading: item.Heading,
    title: item.Heading,
    budgetType: item.BudgetType || 'Financial',
    BudgetType: item.BudgetType || 'Financial',
    fiscalYear: item.Fiscalyear,
    Fiscalyear: item.Fiscalyear,
  }));
};

export const createBudgetHeadingApi = async (payload) => {
  const body = {
    sys_user_id: getStoredUserId(),
    fiscalyear: payload.fiscalYear || payload.Fiscalyear || null,
    filtertype: 'heading',
    heading: payload.heading || payload.title,
    headingCode: payload.code || payload.headingCode,
    BudgetType: payload.budgetType || payload.BudgetType || 'Annual',
    BudgetHeadId: payload.BudgetHeadId || payload.id || null,
  };
  const res = await api.post('/budgeting/new', body);
  return res.data;
};

export const updateBudgetHeadingApi = async (id, payload) => {
  const body = {
    sys_user_id: getStoredUserId(),
    fiscalyear: payload.fiscalYear || payload.Fiscalyear || null,
    filtertype: 'heading',
    heading: payload.heading || payload.title,
    headingCode: payload.code || payload.headingCode,
    BudgetType: payload.budgetType || payload.BudgetType || 'Annual',
    BudgetHeadId: id || payload.BudgetHeadId || payload.id || null,
  };
  const res = await api.post('/budgeting/new', body);
  return res.data;
};

export const deleteBudgetHeadingApi = async (id, fiscalYear) => {
  const body = {
    sys_user_id: getStoredUserId(),
    fiscalyear: fiscalYear || null,
    filtertype: 'heading',
    BudgetHeadId: id,
  };
  const res = await api.post('/budgeting/delete', body);
  return res.data;
};

export const copyBudgetStructureApi = async ({
  sourceFiscalYear,
  targetFiscalYear,
  budgetType = 'ALL',
  includeSubheadings = true,
}) => {
  const headings = await getBudgetHeadingsApi(sourceFiscalYear);
  const filteredHeadings =
    budgetType === 'ALL'
      ? headings
      : headings.filter((h) => (h.budgetType || '').toUpperCase() === budgetType.toUpperCase());

  for (const h of filteredHeadings) {
    await createBudgetHeadingApi({
      fiscalYear: targetFiscalYear,
      heading: h.heading,
      code: h.code,
      budgetType: h.budgetType,
    });
  }

  if (includeSubheadings) {
    const subheadings = await getBudgetSubheadingsApi(sourceFiscalYear);
    for (const s of subheadings) {
      if (budgetType !== 'ALL' && (s.budgetType || '').toUpperCase() !== budgetType.toUpperCase()) {
        continue;
      }
      await createBudgetSubheadingApi({
        fiscalYear: targetFiscalYear,
        headingTitle: s.headingTitle,
        subHeadingTitle: s.subHeadingTitle,
        headingCode: s.headingCode,
        budgetType: s.budgetType,
        requestType: s.requestType,
      });
    }
  }

  return { success: true };
};

export const getBudgetSubheadingsApi = async (fiscalYear, headingCode) => {
  const payload = {
    sys_user_id: getStoredUserId(),
    fiscalyear: fiscalYear || null,
    filtertype: 'subheading',
  };
  const res = await api.post('/budgeting/list', payload);
  const data = res.data?.data || [];
  const list = data.map((item) => ({
    id: item.BudgetSubHeadId,
    BudgetSubHeadId: item.BudgetSubHeadId,
    BudgetHeadId: item.BudgetHeadId,
    headingCode: (item.HeadingCode || '').trim(),
    headingTitle: item.Heading,
    heading: item.Heading,
    code: (item.SubHeadingCode || '').trim(),
    subHeadingCode: (item.SubHeadingCode || '').trim(),
    subHeadingTitle: item.SubHeading,
    subheading: item.SubHeading,
    title: item.SubHeading,
    budgetType: item.BudgetType || 'Financial',
    requestType: item.RequestType || 'Annual Budget',
    fiscalYear: item.Fiscalyear,
    Fiscalyear: item.Fiscalyear,
  }));
  if (headingCode) {
    return list.filter((s) => s.headingCode === headingCode.trim());
  }
  return list;
};

export const createBudgetSubheadingApi = async (payload) => {
  const body = {
    sys_user_id: getStoredUserId(),
    fiscalyear: payload.fiscalYear || payload.Fiscalyear || null,
    filtertype: 'subheading',
    heading: payload.headingTitle || payload.heading,
    subheading: payload.subHeadingTitle || payload.subheading || payload.title,
    headingCode: payload.headingCode || null,
    BudgetType: payload.budgetType || 'Annual',
    RequestType: payload.requestType || 'Annual',
    BudgetHeadId: payload.BudgetHeadId || payload.budgetHeadId || null,
    BudgetSubHeadId: payload.BudgetSubHeadId || payload.id || null,
  };
  const res = await api.post('/budgeting/new', body);
  return res.data;
};

export const updateBudgetSubheadingApi = async (id, payload) => {
  const body = {
    sys_user_id: getStoredUserId(),
    fiscalyear: payload.fiscalYear || payload.Fiscalyear || null,
    filtertype: 'subheading',
    heading: payload.headingTitle || payload.heading,
    subheading: payload.subHeadingTitle || payload.subheading || payload.title,
    headingCode: payload.headingCode || null,
    BudgetType: payload.budgetType || 'Annual',
    RequestType: payload.requestType || 'Annual',
    BudgetHeadId: payload.BudgetHeadId || payload.budgetHeadId || null,
    BudgetSubHeadId: id || payload.BudgetSubHeadId || payload.id || null,
  };
  const res = await api.post('/budgeting/new', body);
  return res.data;
};

export const deleteBudgetSubheadingApi = async (id, budgetHeadId, fiscalYear) => {
  const body = {
    sys_user_id: getStoredUserId(),
    filtertype: 'subheading',
    BudgetSubHeadId: id,
    BudgetHeadId: budgetHeadId || null,
    fiscalyear: fiscalYear || null,
  };
  const res = await api.post('/budgeting/delete', body);
  return res.data;
};

export const getBudgetRequestsApi = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.fiscalYear) params.append('fiscalYear', filters.fiscalYear);
  if (filters.departmentId) params.append('departmentId', filters.departmentId);
  if (filters.requestType) params.append('requestType', filters.requestType);
  const query = params.toString() ? `?${params.toString()}` : '';
  try {
    const res = await api.get(`/budget/request/list${query}`);
    return res.data?.data || [];
  } catch {
    return [];
  }
};

export const submitBudgetRequestApi = async (payload) => {
  const res = await api.post('/budget/request/submit', {
    sys_user_id: getStoredUserId(),
    ...payload,
  });
  return res.data?.data;
};

export const updateBudgetApprovalStatusApi = async (payload) => {
  const res = await api.put('/budget/request/approve', {
    sys_user_id: getStoredUserId(),
    ...payload,
  });
  return res.data?.data;
};

export const bulkUpdateBudgetApprovalStatusApi = async (requests) => {
  const res = await api.post('/budget/request/approve-bulk', {
    sys_user_id: getStoredUserId(),
    requests,
  });
  return res.data;
};
