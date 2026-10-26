import api from '../api';

const fetchGenericList = async (payload, label) => {
  try {
    const res = await api.post('/list/getGenericList', payload);
    return res.data?.data || [];
  } catch (err) {
    console.error(`Failed to fetch ${label}:`, err);
    return [];
  }
};

export class GenericService {
  async getFiscalYears() {
    const list = await fetchGenericList({ FilterType: 'FiscalYear' }, 'fiscal years');
    return list
      .map((f) => {
        const year = (f.Label || f.FiscalYear || f.Value || '').toString().trim();
        return { Value: year, Label: year, FiscalYear: year, FiscalId: f.Value };
      })
      .sort((a, b) => b.FiscalYear.localeCompare(a.FiscalYear, undefined, { numeric: true, sensitivity: 'base' }));
  }

  async getDepartments() {
    const list = await fetchGenericList({ FilterType: 'Department' }, 'departments');
    return list.map((d) => ({
      Value: d.Value,
      Label: (d.Label || '').trim(),
      DepartmentId: d.Value,
      DepartmentName: (d.Label || '').trim(),
    }));
  }

  async getUsers(departmentId) {
    const list = await fetchGenericList(
      { FilterType: 'User', DepartmentId: departmentId || undefined },
      'users'
    );
    return list.map((u) => ({
      Value: u.Value,
      Label: (u.Label || '').trim(),
      Id: u.Value,
      FullName: (u.Label || '').trim(),
      DepartmentId: u.DepartmentId || null,
      departmentId: u.DepartmentId || null,
    }));
  }

  async getVendors() {
    const list = await fetchGenericList({ FilterType: 'Vendor' }, 'vendors');
    return list.map((v) => ({
      Value: v.Value,
      Label: (v.Label || '').trim(),
      VendorId: v.Value,
      VendorName: (v.Label || '').trim(),
    }));
  }

  async getStaticData(module) {
    return fetchGenericList(
      { FilterType: 'StaticData', module: module || null },
      `static data${module ? ` for ${module}` : ''}`
    );
  }

  async getOptions(filterType) {
    if (!filterType) return [];
    const [type, module] = String(filterType).split(':');
    return fetchGenericList(
      { FilterType: type, ...(module ? { module } : {}) },
      `options for ${filterType}`
    );
  }
}

export const genericService = new GenericService();
export default genericService;
