import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Button,
  Select,
  Input,
  Space,
  Row,
  Col,
  Tabs,
  Tag,
  Popconfirm,
  Modal,
  Switch,
  message,
  Empty,
  Tooltip,
  Segmented,
  Typography,
} from 'antd';
import {
  AppstoreOutlined,
  PlusOutlined,
  CopyOutlined,
  CalendarOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
  BranchesOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  getBudgetHeadingsApi,
  createBudgetHeadingApi,
  updateBudgetHeadingApi,
  deleteBudgetHeadingApi,
  getBudgetSubheadingsApi,
  createBudgetSubheadingApi,
  updateBudgetSubheadingApi,
  deleteBudgetSubheadingApi,
  copyBudgetStructureApi,
} from '../API/budgetservice';
import genericService from '../../API/generic/genericservice';

const { Text } = Typography;
const { Option } = Select;

const C = {
  darkNavy: '#002b49',
  brand: '#01519b',
  border: '#e2e8f0',
  filterBorder: '#d9e2ec',
  text: '#16202f',
  muted: '#667085',
  subtext: '#526071',
};

const getNextHeadingCode = (headings) => {
  const used = new Set(headings.map((h) => (h.code || '').trim().toUpperCase()));
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < alphabet.length; i += 1) {
    if (!used.has(alphabet[i])) return alphabet[i];
  }
  return 'A';
};

const BudgetHeading = () => {
  const [activeTab, setActiveTab] = useState('heading');

  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(undefined);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchText, setSearchText] = useState('');

  const [headings, setHeadings] = useState([]);
  const [subheadings, setSubheadings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Heading Form
  const [showHeadingForm, setShowHeadingForm] = useState(false);
  const [editingHeadingId, setEditingHeadingId] = useState(null);
  const [headingCode, setHeadingCode] = useState('');
  const [headingTitle, setHeadingTitle] = useState('');
  const [headingType, setHeadingType] = useState('Financial');
  const [headingFY, setHeadingFY] = useState(undefined);

  // Subheading Form
  const [showSubForm, setShowSubForm] = useState(false);
  const [editingSubId, setEditingSubId] = useState(null);
  const [subFY, setSubFY] = useState(undefined);
  const [subMainHeading, setSubMainHeading] = useState(undefined);
  const [subTitle, setSubTitle] = useState('');
  const [subType, setSubType] = useState('Financial');
  const [subRequestType, setSubRequestType] = useState('Annual Budget');

  // Copy Value Modal
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [copySourceFY, setCopySourceFY] = useState(undefined);
  const [copyTargetFY, setCopyTargetFY] = useState(undefined);
  const [copyIncludeSub, setCopyIncludeSub] = useState(true);
  const [copyBudgetType, setCopyBudgetType] = useState('ALL');
  const [copying, setCopying] = useState(false);
  const [staticBudgetTypes, setStaticBudgetTypes] = useState([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [list, sTypes] = await Promise.all([
          genericService.getFiscalYears(),
          genericService.getStaticData('Budget'),
        ]);
        if (!isMounted) return;
        setFiscalYears(list || []);
        if (sTypes?.length) setStaticBudgetTypes(sTypes);
        if (list?.length > 0) {
          const first = list[0]?.Value || list[0]?.FiscalYear || list[0]?.Label || list[0];
          setSelectedFiscalYear((prev) => prev || first);
          setHeadingFY((prev) => prev || first);
          setSubFY((prev) => prev || first);
          setCopySourceFY((prev) => prev || first);
          if (list.length > 1) {
            const second = list[1]?.Value || list[1]?.FiscalYear || list[1]?.Label || list[1];
            setCopyTargetFY((prev) => prev || second);
          }
        }
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadData = useCallback(async () => {
    if (!selectedFiscalYear) return;
    try {
      setLoading(true);
      const [hList, sList] = await Promise.all([
        getBudgetHeadingsApi(selectedFiscalYear),
        getBudgetSubheadingsApi(selectedFiscalYear),
      ]);
      setHeadings(Array.isArray(hList) ? hList : []);
      setSubheadings(Array.isArray(sList) ? sList : []);
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to load budget headings';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [selectedFiscalYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);



  // Save Heading
  const handleSaveHeading = async () => {
    const fy = headingFY || selectedFiscalYear;
    if (!fy) {
      message.warning('Please select a fiscal year');
      return;
    }
    const trimmedCode = headingCode.trim().toUpperCase();
    if (!trimmedCode || !headingTitle.trim()) {
      message.warning('Please enter heading code and title');
      return;
    }

    const existing = headings.find(
      (h) => (h.code || '').trim().toUpperCase() === trimmedCode && (h.id || h.BudgetHeadId) !== editingHeadingId
    );
    if (existing) {
      message.error(
        `Heading code "${trimmedCode}" is already in use by "${existing.heading || existing.title}". Please choose a different code.`
      );
      return;
    }

    const isEditing = Boolean(editingHeadingId);

    try {
      if (isEditing) {
        await updateBudgetHeadingApi(editingHeadingId, {
          fiscalYear: fy,
          code: headingCode.trim().toUpperCase(),
          heading: headingTitle.trim(),
          budgetType: headingType,
        });
        message.success('Budget heading updated successfully');
      } else {
        await createBudgetHeadingApi({
          fiscalYear: fy,
          code: headingCode.trim().toUpperCase(),
          heading: headingTitle.trim(),
          budgetType: headingType,
        });
        message.success('Budget heading created successfully');
      }

      setHeadingTitle('');
      setEditingHeadingId(null);

      if (isEditing) {
        setHeadingCode('');
        setShowHeadingForm(false);
      } else {
        setHeadingCode(getNextHeadingCode([...headings, { code: trimmedCode }]));
      }

      if (fy !== selectedFiscalYear) {
        setSelectedFiscalYear(fy);
      } else {
        loadData();
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to save budget heading';
      message.error(errMsg);
    }
  };

  const handleEditHeading = (record) => {
    if (Number(record?.isUsed) === 1) {
      message.warning('Cannot edit: this heading is already used in budget requests');
      return;
    }
    setEditingHeadingId(record.id || record.BudgetHeadId || record.code);
    setHeadingFY(record.fiscalYear || selectedFiscalYear);
    setHeadingCode(record.code || '');
    setHeadingTitle(record.heading || record.title || '');
    setHeadingType(record.budgetType || 'Financial');
    setShowHeadingForm(true);
  };

  const handleDeleteHeading = async (record) => {
    if (Number(record?.isUsed) === 1) {
      message.warning('Cannot delete: this heading is already used in budget requests');
      return;
    }
    try {
      const id = typeof record === 'object' ? (record.id || record.BudgetHeadId) : record;
      const fy = (typeof record === 'object' ? record.fiscalYear : null) || selectedFiscalYear;
      await deleteBudgetHeadingApi(id, fy);
      message.success('Heading deleted successfully');
      loadData();
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to delete heading';
      message.error(errMsg);
    }
  };

  // Save Subheading
  const handleSaveSubheading = async () => {
    const fy = subFY || selectedFiscalYear;
    if (!fy) {
      message.warning('Please select a fiscal year');
      return;
    }
    if (!subMainHeading) {
      message.warning('Please select a parent heading');
      return;
    }
    if (!subTitle.trim()) {
      message.warning('Please enter subheading title');
      return;
    }

    const selectedHead = headings.find(
      (h) => h.code === subMainHeading || h.heading === subMainHeading || h.id === subMainHeading
    );
    const headCode = selectedHead ? selectedHead.code : subMainHeading;
    const headTitle = selectedHead ? (selectedHead.heading || selectedHead.title) : subMainHeading;
    const headId = selectedHead ? (selectedHead.BudgetHeadId || selectedHead.id) : null;
    const resolvedBudgetType = selectedHead?.budgetType || subType || 'Financial';
    const isEditing = Boolean(editingSubId);

    try {
      if (isEditing) {
        await updateBudgetSubheadingApi(editingSubId, {
          fiscalYear: fy,
          headingCode: headCode,
          headingTitle: headTitle,
          BudgetHeadId: headId,
          subHeadingTitle: subTitle.trim(),
          budgetType: resolvedBudgetType,
          requestType: subRequestType,
        });
        message.success('Subheading updated successfully');
      } else {
        await createBudgetSubheadingApi({
          fiscalYear: fy,
          headingCode: headCode,
          headingTitle: headTitle,
          BudgetHeadId: headId,
          subHeadingTitle: subTitle.trim(),
          budgetType: resolvedBudgetType,
          requestType: subRequestType,
        });
        message.success('Subheading created successfully');
      }

      setSubTitle('');
      setEditingSubId(null);

      if (isEditing) {
        setShowSubForm(false);
      }

      if (fy !== selectedFiscalYear) {
        setSelectedFiscalYear(fy);
      } else {
        loadData();
      }
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to save subheading';
      message.error(errMsg);
    }
  };

  const handleEditSubheading = (record) => {
    if (Number(record?.isUsed) === 1) {
      message.warning('Cannot edit: this subheading is already used in budget requests');
      return;
    }
    setEditingSubId(record.id || record.BudgetSubHeadId || record.code);
    setSubFY(record.fiscalYear || selectedFiscalYear);
    setSubMainHeading(record.headingCode || record.headingTitle || record.heading);
    setSubTitle(record.subHeadingTitle || record.title || '');
    setSubType(record.budgetType || 'Financial');
    setSubRequestType(record.requestType || 'Annual Budget');
    setShowSubForm(true);
  };

  const handleDeleteSubheading = async (record) => {
    if (Number(record?.isUsed) === 1) {
      message.warning('Cannot delete: this subheading is already used in budget requests');
      return;
    }
    try {
      const id = typeof record === 'object' ? (record.id || record.BudgetSubHeadId) : record;
      const headId = typeof record === 'object' ? (record.BudgetHeadId || record.budgetHeadId) : null;
      const fy = (typeof record === 'object' ? record.fiscalYear : null) || selectedFiscalYear;
      await deleteBudgetSubheadingApi(id, headId, fy);
      message.success('Subheading deleted successfully');
      loadData();
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to delete subheading';
      message.error(errMsg);
    }
  };

  // Handle Copy Value
  const handleConfirmCopy = async () => {
    if (!copySourceFY || !copyTargetFY) {
      message.warning('Please select both source and target fiscal years');
      return;
    }
    if (copySourceFY === copyTargetFY) {
      message.warning('Source and Target fiscal years cannot be the same');
      return;
    }

    try {
      setCopying(true);
      await copyBudgetStructureApi({
        sourceFiscalYear: copySourceFY,
        targetFiscalYear: copyTargetFY,
        budgetType: copyBudgetType,
        includeSubheadings: copyIncludeSub,
      });

      message.success(`Budget structure copied from ${copySourceFY} to ${copyTargetFY} successfully!`);
      setCopyModalVisible(false);
      setSelectedFiscalYear(copyTargetFY);
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to copy budget structure';
      message.error(errMsg);
    } finally {
      setCopying(false);
    }
  };

  // Filtered Data
  const filteredHeadings = useMemo(() => {
    return headings.filter((h) => {
      const matchType = typeFilter === 'ALL' || (h.budgetType || 'Financial') === typeFilter;
      const matchSearch =
        !searchText.trim() ||
        (h.heading || h.title || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (h.code || '').toLowerCase().includes(searchText.toLowerCase());
      return matchType && matchSearch;
    });
  }, [headings, typeFilter, searchText]);

  const filteredSubheadings = useMemo(() => {
    return subheadings.filter((s) => {
      const matchType = typeFilter === 'ALL' || (s.budgetType || 'Financial') === typeFilter;
      const matchSearch =
        !searchText.trim() ||
        (s.subHeadingTitle || s.title || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (s.code || '').toLowerCase().includes(searchText.toLowerCase()) ||
        (s.headingTitle || '').toLowerCase().includes(searchText.toLowerCase());
      return matchType && matchSearch;
    });
  }, [subheadings, typeFilter, searchText]);

  const headingColumns = [
    {
      title: 'CODE',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (val) => (
        <span
          style={{
            fontWeight: 700,
            color: C.brand,
            background: '#e8f0fe',
            padding: '2px 10px',
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {val || '—'}
        </span>
      ),
    },
    {
      title: 'HEADING TITLE',
      dataIndex: 'heading',
      key: 'heading',
      render: (val, record) => (
        <span style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>
          {val || record.title || '—'}
        </span>
      ),
    },
    {
      title: 'BUDGET TYPE',
      dataIndex: 'budgetType',
      key: 'budgetType',
      width: 160,
      render: (val) => {
        const isFinancial = (val || 'Financial') === 'Financial';
        return (
          <Tag
            color={isFinancial ? 'blue' : 'purple'}
            style={{ fontWeight: 600, borderRadius: 4, padding: '2px 8px' }}
          >
            {isFinancial ? 'Financial' : 'Non-Financial'}
          </Tag>
        );
      },
    },
    {
      title: 'SUBHEADINGS',
      key: 'subheadingsCount',
      width: 140,
      align: 'center',
      render: (_, record) => {
        const count = subheadings.filter((s) => s.headingCode === record.code).length;
        return (
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>
            {count} configured
          </span>
        );
      },
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const isLocked = Number(record.isUsed) === 1;
        return (
          <Space size="small">
            <Tooltip title={isLocked ? 'Cannot edit: this heading is used in budget requests' : 'Edit Heading'}>
              <Button
                type="primary"
                size="small"
                disabled={isLocked}
                icon={<EditOutlined />}
                onClick={() => !isLocked && handleEditHeading(record)}
                style={{
                  background: isLocked ? '#cbd5e1' : '#1a73e8',
                  borderColor: isLocked ? '#cbd5e1' : '#1a73e8',
                  borderRadius: 4,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                }}
              />
            </Tooltip>
            <Tooltip title={isLocked ? 'Cannot delete: this heading is used in budget requests' : 'Delete Heading'}>
              {isLocked ? (
                <Button
                  danger
                  type="primary"
                  size="small"
                  disabled
                  icon={<DeleteOutlined />}
                  style={{
                    borderRadius: 4,
                    background: '#cbd5e1',
                    borderColor: '#cbd5e1',
                    cursor: 'not-allowed',
                  }}
                />
              ) : (
                <Popconfirm
                  title="Delete Heading"
                  description="Are you sure you want to delete this heading?"
                  onConfirm={() => handleDeleteHeading(record)}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    danger
                    type="primary"
                    size="small"
                    icon={<DeleteOutlined />}
                    style={{ borderRadius: 4 }}
                  />
                </Popconfirm>
              )}
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const subheadingColumns = [
    {
      title: 'CODE',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (val) => (
        <span
          style={{
            fontWeight: 700,
            color: C.brand,
            background: '#e8f0fe',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {val || '—'}
        </span>
      ),
    },
    {
      title: 'SUBHEADING TITLE',
      dataIndex: 'subHeadingTitle',
      key: 'subHeadingTitle',
      render: (val, record) => (
        <span style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>
          {val || record.title || '—'}
        </span>
      ),
    },
    {
      title: 'PARENT HEADING',
      dataIndex: 'headingTitle',
      key: 'headingTitle',
      render: (val, record) => (
        <span style={{ color: C.muted, fontWeight: 500 }}>
          {val || record.headingCode || '—'}
        </span>
      ),
    },
    {
      title: 'BUDGET TYPE',
      dataIndex: 'budgetType',
      key: 'budgetType',
      width: 150,
      render: (val) => {
        const isFinancial = (val || 'Financial') === 'Financial';
        return (
          <Tag
            color={isFinancial ? 'blue' : 'purple'}
            style={{ fontWeight: 600, borderRadius: 4, padding: '2px 8px' }}
          >
            {isFinancial ? 'Financial' : 'Non-Financial'}
          </Tag>
        );
      },
    },
    {
      title: 'REQUEST TYPE',
      dataIndex: 'requestType',
      key: 'requestType',
      width: 160,
      render: (val) => (
        <Tag
          color={val === 'Annual Budget' ? 'green' : 'orange'}
          style={{ fontWeight: 600, borderRadius: 4, padding: '2px 8px' }}
        >
          {val || 'Annual Budget'}
        </Tag>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const isLocked = Number(record.isUsed) === 1;
        return (
          <Space size="small">
            <Tooltip title={isLocked ? 'Cannot edit: this subheading is used in budget requests' : 'Edit Subheading'}>
              <Button
                type="primary"
                size="small"
                disabled={isLocked}
                icon={<EditOutlined />}
                onClick={() => !isLocked && handleEditSubheading(record)}
                style={{
                  background: isLocked ? '#cbd5e1' : '#1a73e8',
                  borderColor: isLocked ? '#cbd5e1' : '#1a73e8',
                  borderRadius: 4,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                }}
              />
            </Tooltip>
            <Tooltip title={isLocked ? 'Cannot delete: this subheading is used in budget requests' : 'Delete Subheading'}>
              {isLocked ? (
                <Button
                  danger
                  type="primary"
                  size="small"
                  disabled
                  icon={<DeleteOutlined />}
                  style={{
                    borderRadius: 4,
                    background: '#cbd5e1',
                    borderColor: '#cbd5e1',
                    cursor: 'not-allowed',
                  }}
                />
              ) : (
                <Popconfirm
                  title="Delete Subheading"
                  description="Are you sure you want to delete this subheading?"
                  onConfirm={() => handleDeleteSubheading(record)}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    danger
                    type="primary"
                    size="small"
                    icon={<DeleteOutlined />}
                    style={{ borderRadius: 4 }}
                  />
                </Popconfirm>
              )}
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          
       
        </div>

        <Space size="middle">
          <Button
            icon={<CopyOutlined />}
            onClick={() => setCopyModalVisible(true)}
            style={{
              fontWeight: 600,
              height: 38,
              borderRadius: 6,
              borderColor: C.border,
              color: C.brand,
            }}
          >
            Copy to Fiscal Year
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              if (activeTab === 'heading') {
                setEditingHeadingId(null);
                setHeadingCode(getNextHeadingCode(headings));
                setHeadingTitle('');
                setHeadingType('Financial');
                setShowHeadingForm(!showHeadingForm);
              } else {
                setEditingSubId(null);
                setSubTitle('');
                setSubType('Financial');
                setShowSubForm(!showSubForm);
              }
            }}
            style={{
              background: '#01519b',
              borderColor: '#01519b',
              fontWeight: 600,
              height: 38,
              borderRadius: 6,
              padding: '0 18px',
            }}
          >
            {activeTab === 'heading'
              ? showHeadingForm ? 'Close Form' : '+ Create Heading'
              : showSubForm ? 'Close Form' : '+ Create Subheading'}
          </Button>
        </Space>
      </div>

      {/* Filter and Control Bar */}
      <div
        style={{
          background: '#ffffff',
          border: `1px solid ${C.filterBorder}`,
          borderRadius: 8,
          padding: '14px 18px',
          marginBottom: 20,
          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        <Row gutter={[16, 12]} align="middle" justify="space-between">
          <Col xs={24} sm={12} md={7}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                <CalendarOutlined style={{ marginRight: 6 }} />
                FISCAL YEAR:
              </div>
              <Select
                value={selectedFiscalYear}
                onChange={setSelectedFiscalYear}
                style={{ width: 170, height: 36 }}
              >
                {fiscalYears.map((fy) => {
                  const val = fy.Value || fy.FiscalYear || fy.Label || fy;
                  const lbl = fy.Label || fy.FiscalYear || fy.Value || fy;
                  return (
                    <Option key={val} value={val}>
                      {lbl}
                    </Option>
                  );
                })}
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={9}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', textTransform: 'uppercase' }}>
                TYPE:
              </span>
              <Segmented
                value={typeFilter}
                onChange={setTypeFilter}
                options={[
                  { label: 'All', value: 'ALL' },
                  { label: 'Financial', value: 'Financial' },
                  { label: 'Non-Financial', value: 'Non-Financial' },
                ]}
              />
            </div>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <Input
              prefix={<SearchOutlined style={{ color: C.muted }} />}
              placeholder="Search code or title..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ height: 36, borderRadius: 6 }}
            />
          </Col>
        </Row>
      </div>

      {/* Main Tabs Container */}
      <div
        style={{
          background: '#ffffff',
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setShowHeadingForm(false);
            setShowSubForm(false);
          }}
          tabBarStyle={{ padding: '0 18px', background: '#f8fafc', margin: 0, borderBottom: `1px solid ${C.border}` }}
          items={[
            {
              key: 'heading',
              label: (
                <span style={{ fontWeight: 600, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 0' }}>
                  <UnorderedListOutlined />
                  Heading Codes ({filteredHeadings.length})
                </span>
              ),
              children: (
                <div style={{ padding: '18px 20px' }}>
                  {showHeadingForm && (
                    <div
                      style={{
                        background: '#fafbfd',
                        border: `1px solid #bfdbfe`,
                        borderRadius: 8,
                        padding: '16px 18px',
                        marginBottom: 20,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: C.darkNavy, marginBottom: 12, fontSize: 13 }}>
                        {editingHeadingId ? 'Edit Heading' : 'Add New Budget Heading'}
                      </div>
                      <Row gutter={[12, 12]} align="bottom">
                        <Col xs={24} sm={12} md={4}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 4 }}>
                            Fiscal Year
                          </div>
                          <Select
                            value={headingFY || selectedFiscalYear}
                            onChange={setHeadingFY}
                            style={{ width: '100%', height: 36 }}
                          >
                            {fiscalYears.map((fy) => {
                              const val = fy.Value || fy.FiscalYear || fy.Label || fy;
                              const lbl = fy.Label || fy.FiscalYear || fy.Value || fy;
                              return (
                                <Option key={val} value={val}>
                                  {lbl}
                                </Option>
                              );
                            })}
                          </Select>
                        </Col>

                        <Col xs={24} sm={12} md={5}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 4 }}>
                            Budget Type
                          </div>
                          <Select
                            value={headingType}
                            onChange={setHeadingType}
                            style={{ width: '100%', height: 36 }}
                          >
                            {(staticBudgetTypes.length ? staticBudgetTypes : [{ Label: 'Financial' }, { Label: 'Non-Financial' }]).map((bt) => {
                              const val = bt.Label?.replace(/\s+Budget$/i, '');
                              return (
                                <Option key={bt.Value || bt.Label || val} value={val}>
                                  {val}
                                </Option>
                              );
                            })}
                          </Select>
                        </Col>

                        <Col xs={24} sm={12} md={4}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 4 }}>
                            Heading Code
                          </div>
                          <Input
                            placeholder="e.g. A, B, C"
                            value={headingCode}
                            onChange={(e) => setHeadingCode(e.target.value)}
                            style={{ height: 36, borderRadius: 6 }}
                          />
                        </Col>

                        <Col xs={24} sm={12} md={7}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 4 }}>
                            Heading Title
                          </div>
                          <Input
                            placeholder="e.g. AMC COST"
                            value={headingTitle}
                            onChange={(e) => setHeadingTitle(e.target.value)}
                            style={{ height: 36, borderRadius: 6 }}
                          />
                        </Col>

                        <Col xs={24} sm={24} md={4}>
                          <Space>
                            <Button
                              type="primary"
                              onClick={handleSaveHeading}
                              style={{
                                background: '#12805c',
                                borderColor: '#12805c',
                                fontWeight: 600,
                                height: 36,
                                borderRadius: 6,
                              }}
                            >
                              {editingHeadingId ? 'Update' : 'Save'}
                            </Button>
                            <Button
                              onClick={() => {
                                setShowHeadingForm(false);
                                setEditingHeadingId(null);
                              }}
                              style={{ height: 36, borderRadius: 6 }}
                            >
                              Cancel
                            </Button>
                          </Space>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {filteredHeadings.length > 0 ? (
                    <Table scroll={{ x: 'max-content' }}
                      dataSource={filteredHeadings}
                      columns={headingColumns}
                      rowKey={(record) => record.id || record.code}
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                      size="middle"
                    />
                  ) : (
                    <div style={{ padding: '40px 0', textAlign: 'center' }}>
                      <Empty description="No headings found for the selected filter." />
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'subheading',
              label: (
                <span style={{ fontWeight: 600, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 0' }}>
                  <BranchesOutlined />
                  Subheading Codes ({filteredSubheadings.length})
                </span>
              ),
              children: (
                <div style={{ padding: '18px 20px' }}>
                  {showSubForm && (
                    <div
                      style={{
                        background: '#fafbfd',
                        border: `1px solid #bfdbfe`,
                        borderRadius: 8,
                        padding: '16px 18px',
                        marginBottom: 20,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: C.darkNavy, marginBottom: 12, fontSize: 13 }}>
                        {editingSubId ? 'Edit Subheading' : 'Add New Subheading'}
                      </div>
                      <Row gutter={[12, 12]} align="bottom">
                        <Col xs={24} sm={12} md={4}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 4 }}>
                            Fiscal Year
                          </div>
                          <Select
                            value={subFY || selectedFiscalYear}
                            onChange={setSubFY}
                            style={{ width: '100%', height: 36 }}
                          >
                            {fiscalYears.map((fy) => {
                              const val = fy.Value || fy.FiscalYear || fy.Label || fy;
                              const lbl = fy.Label || fy.FiscalYear || fy.Value || fy;
                              return (
                                <Option key={val} value={val}>
                                  {lbl}
                                </Option>
                              );
                            })}
                          </Select>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 4 }}>
                            Main Heading
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <Select
                              value={subMainHeading}
                              onChange={setSubMainHeading}
                              placeholder="--Select Heading--"
                              style={{ width: '100%', height: 36 }}
                            >
                              {headings.map((h) => (
                                <Option key={h.code} value={h.code}>
                                  {h.code} - {h.heading || h.title}
                                </Option>
                              ))}
                            </Select>
                            <Tooltip title="Refresh Headings">
                              <Button
                                icon={<ReloadOutlined />}
                                onClick={loadData}
                                style={{ height: 36, borderRadius: 6 }}
                              />
                            </Tooltip>
                          </div>
                        </Col>

                        <Col xs={24} sm={12} md={5}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 4 }}>
                            Request Type
                          </div>
                          <Select
                            value={subRequestType}
                            onChange={setSubRequestType}
                            style={{ width: '100%', height: 36 }}
                          >
                            <Option value="Annual Budget">Annual Budget</Option>
                            <Option value="onDemand Budget">onDemand Budget</Option>
                          </Select>
                        </Col>

                        <Col xs={24} sm={12} md={6}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b556e', marginBottom: 4 }}>
                            Subheading Title
                          </div>
                          <Input
                            placeholder="e.g. AMC SQL HELPS"
                            value={subTitle}
                            onChange={(e) => setSubTitle(e.target.value)}
                            style={{ height: 36, borderRadius: 6 }}
                          />
                        </Col>

                        <Col xs={24} sm={12} md={3}>
                          <Space>
                            <Button
                              type="primary"
                              onClick={handleSaveSubheading}
                              style={{
                                background: '#12805c',
                                borderColor: '#12805c',
                                fontWeight: 600,
                                height: 36,
                                borderRadius: 6,
                              }}
                            >
                              {editingSubId ? 'Update' : 'Save'}
                            </Button>
                            <Button
                              onClick={() => {
                                setShowSubForm(false);
                                setEditingSubId(null);
                              }}
                              style={{ height: 36, borderRadius: 6 }}
                            >
                              Cancel
                            </Button>
                          </Space>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {filteredSubheadings.length > 0 ? (
                    <Table scroll={{ x: 'max-content' }}
                      dataSource={filteredSubheadings}
                      columns={subheadingColumns}
                      rowKey={(record) => record.id || record.code}
                      loading={loading}
                      pagination={{ pageSize: 10 }}
                      size="middle"
                    />
                  ) : (
                    <div style={{ padding: '40px 0', textAlign: 'center' }}>
                      <Empty description="No subheadings found for the selected filter." />
                    </div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Copy Value Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.darkNavy, fontWeight: 700 }}>
            <CopyOutlined style={{ color: C.brand }} />
            <span>Copy Budget Structure to Fiscal Year</span>
          </div>
        }
        open={copyModalVisible}
        onCancel={() => setCopyModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setCopyModalVisible(false)} style={{ borderRadius: 6 }}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={copying}
            onClick={handleConfirmCopy}
            style={{ background: '#01519b', borderColor: '#01519b', fontWeight: 600, borderRadius: 6 }}
          >
            Confirm & Copy
          </Button>,
        ]}
      >
        <div style={{ padding: '12px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#3b556e', marginBottom: 6 }}>
              SOURCE FISCAL YEAR
            </div>
            <Select
              value={copySourceFY}
              onChange={setCopySourceFY}
              style={{ width: '100%', height: 38 }}
            >
              {fiscalYears.map((fy) => {
                const val = fy.Value || fy.FiscalYear || fy.Label || fy;
                const lbl = fy.Label || fy.FiscalYear || fy.Value || fy;
                return (
                  <Option key={val} value={val}>
                    {lbl}
                  </Option>
                );
              })}
            </Select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#3b556e', marginBottom: 6 }}>
              TARGET FISCAL YEAR (NEXT FISCAL YEAR)
            </div>
            <Select
              value={copyTargetFY}
              onChange={setCopyTargetFY}
              placeholder="--Select Target Fiscal Year--"
              style={{ width: '100%', height: 38 }}
            >
              {fiscalYears.map((fy) => {
                const val = fy.Value || fy.FiscalYear || fy.Label || fy;
                const lbl = fy.Label || fy.FiscalYear || fy.Value || fy;
                return (
                  <Option key={val} value={val}>
                    {lbl}
                  </Option>
                );
              })}
            </Select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#3b556e', marginBottom: 6 }}>
              BUDGET TYPE TO COPY
            </div>
            <Select
              value={copyBudgetType}
              onChange={setCopyBudgetType}
              style={{ width: '100%', height: 38 }}
            >
              <Option value="ALL">All (Financial & Non-Financial)</Option>
              <Option value="Financial">Financial Only</Option>
              <Option value="Non-Financial">Non-Financial Only</Option>
            </Select>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: '#f8fafc',
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Include Subheadings</div>
              <div style={{ fontSize: 11, color: C.muted }}>
                Copy all subheadings linked to the selected headings
              </div>
            </div>
            <Switch checked={copyIncludeSub} onChange={setCopyIncludeSub} />
          </div>

          <div
            style={{
              padding: '10px 12px',
              background: '#eff6ff',
              border: `1px solid #bfdbfe`,
              borderRadius: 6,
              color: '#1e40af',
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            <strong>Notice:</strong> This action will duplicate the budget classification schema from{' '}
            <strong>{copySourceFY || 'source'}</strong> into <strong>{copyTargetFY || 'target'}</strong>.
            Existing duplicate codes in the target year will be skipped or updated.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BudgetHeading;
