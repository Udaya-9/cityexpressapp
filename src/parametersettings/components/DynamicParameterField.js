import React, { useEffect, useMemo, useState } from 'react';
import { Checkbox, Input, Radio, Select, TimePicker } from 'antd';
import dayjs from 'dayjs';
import NepaliDatePicker from '../../correspondence/components/NepaliDatePicker';
import genericService from '../../API/generic/genericservice';

const parseStaticOptions = (options) => {
  const text = String(options || '').trim();
  if (!/^static:/i.test(text)) return null;
  return text
    .slice(7)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => ({ label: value, value }));
};

const normalizeOptions = (items) =>
  (items || [])
    .map((item) => {
      const value =
        item?.Value ?? item?.value ?? item?.DepartmentId ?? item?.id ?? item?.Label ?? item?.label;
      const label = item?.Label ?? item?.label ?? item?.Value ?? item?.value ?? value;
      return { label: String(label ?? ''), value: String(value ?? '') };
    })
    .filter((option) => option.value !== '' && option.label !== '');

const DynamicParameterField = ({ field, value, onChange, disabled = false }) => {
  const staticOptions = useMemo(() => parseStaticOptions(field.options), [field.options]);
  const [options, setOptions] = useState(staticOptions || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (staticOptions) {
      setOptions(staticOptions);
      setLoading(false);
      return undefined;
    }

    if (!field.options) {
      setOptions([]);
      setLoading(false);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    genericService.getOptions(field.options)
      .then((items) => {
        if (alive) setOptions(normalizeOptions(items));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [field.options, staticOptions]);

  const placeholder = field.placeholder || '';

  if (field.fieldType === 'date-picker') {
    return (
      <NepaliDatePicker
        value={value || ''}
        onChange={(next) => onChange?.(next || '')}
        placeholder={placeholder || 'YYYY-MM-DD'}
        allowClear
        disabled={disabled}
        showEquivalent
      />
    );
  }

  if (field.fieldType === 'datetimepicker') {
    const [datePart = '', timePart = ''] = String(value || '').split(/[ T]/);
    const timeValue = /^\d{2}:\d{2}/.test(timePart)
      ? dayjs(`2000-01-01T${timePart}`)
      : null;
    const emit = (nextDate, nextTime) =>
      onChange?.([nextDate, nextTime].filter(Boolean).join(' '));

    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <NepaliDatePicker
            value={datePart}
            onChange={(next) => emit(next || '', timePart)}
            placeholder={placeholder || 'YYYY-MM-DD'}
            allowClear
            disabled={disabled}
            showEquivalent
          />
        </div>
        <TimePicker
          value={timeValue}
          onChange={(time) => emit(datePart, time ? time.format('HH:mm') : '')}
          format="HH:mm"
          allowClear
          disabled={disabled}
          placeholder="HH:mm"
          style={{ width: 104 }}
        />
      </div>
    );
  }

  if (field.fieldType === 'select') {
    return (
      <Select
        value={value ?? undefined}
        onChange={onChange}
        options={options}
        loading={loading}
        showSearch
        allowClear
        optionFilterProp="label"
        placeholder={placeholder || 'Select'}
        disabled={disabled}
        style={{ width: '100%' }}
      />
    );
  }

  if (field.fieldType === 'radio') {
    return (
      <Radio.Group
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        options={options}
        disabled={disabled}
      />
    );
  }

  if (field.fieldType === 'checkbox') {
    if (String(field.options || '').trim()) {
      return (
        <Checkbox.Group
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          options={options}
          disabled={disabled}
        />
      );
    }

    return (
      <Checkbox
        checked={Boolean(value)}
        onChange={(event) => onChange?.(event.target.checked)}
        disabled={disabled}
      />
    );
  }

  return (
    <Input
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value)}
      placeholder={placeholder}
      allowClear
      disabled={disabled}
    />
  );
};

export default DynamicParameterField;
