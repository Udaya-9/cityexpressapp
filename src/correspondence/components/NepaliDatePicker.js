import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Input, DatePicker, Segmented, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import NepaliDate from 'nepali-date-converter';
import '@sajanm/nepali-date-picker/dist/nepali.datepicker.v5.0.6.min.js';
import '@sajanm/nepali-date-picker/dist/nepali.datepicker.v5.0.6.min.css';

// Helper: Convert BS string (YYYY-MM-DD) to AD string (YYYY-MM-DD)
export const bsToAdString = (bsStr) => {
  if (!bsStr) return '';
  try {
    const parts = String(bsStr).trim().split(/[-/ :]/);
    if (parts.length >= 3) {
      const yr = parseInt(parts[0], 10);
      const mo = parseInt(parts[1], 10) - 1;
      const dy = parseInt(parts[2], 10);
      if (yr >= 2000 && yr <= 2090) {
        const nd = new NepaliDate(yr, mo, dy);
        const jsDate = nd.toJsDate();
        if (!isNaN(jsDate.getTime())) {
          const y = jsDate.getFullYear();
          const m = String(jsDate.getMonth() + 1).padStart(2, '0');
          const d = String(jsDate.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }
      }
    }
  } catch (e) {
    // Return empty on error
  }
  return '';
};

// Helper: Convert AD date/string to BS string (YYYY-MM-DD)
export const adToBsString = (adInput) => {
  if (!adInput) return '';
  try {
    const d = adInput instanceof Date ? adInput : new Date(adInput);
    if (!isNaN(d.getTime())) {
      const nd = new NepaliDate(d);
      return nd.format('YYYY-MM-DD');
    }
  } catch (e) {
    // Return empty on error
  }
  return '';
};

// Detect if a date string is likely a BS date (starting with 207x, 208x, 209x)
const isBsDate = (str) => /^20[789]\d/.test(str ? String(str).trim() : '');

const NepaliDatePicker = ({
  value,
  onChange,
  placeholder,
  style,
  allowClear = true,
  disabled = false,
  size = 'middle',
  id,
  showEquivalent = true,
}) => {
  const [calendarMode, setCalendarMode] = useState('BS'); // 'BS' | 'AD'
  const inputRef = useRef(null);

  // Derive current BS and AD representations from value
  const { bsValue, adValue } = useMemo(() => {
    if (!value) return { bsValue: '', adValue: '' };
    const str = String(value).trim();
    if (isBsDate(str)) {
      return {
        bsValue: str.split(' ')[0],
        adValue: bsToAdString(str),
      };
    }
    return {
      bsValue: adToBsString(str),
      adValue: str.split('T')[0].split(' ')[0],

    };
  }, [value]);

  // Handle BS change
  const handleBsChange = useCallback((newBs) => {
    if (!newBs) {
      if (onChange) onChange('');
      return;
    }
    if (onChange) onChange(newBs);
  }, [onChange]);

  // Handle AD change
  const handleAdChange = useCallback((dateObj, dateString) => {
    if (!dateString) {
      if (onChange) onChange('');
      
      return;
    }
    const bsEquivalent = adToBsString(dateString);
    if (onChange) {
      // Provide BS date as primary format to preserve Nepali Date registry
      onChange(bsEquivalent || dateString);
    }
  }, [onChange]);

  // Initialize or re-initialize Nepali calendar popup on BS input
  useEffect(() => {
    if (calendarMode !== 'BS') return;
    const el = inputRef.current?.input || inputRef.current;
    if (el && typeof el.nepaliDatePicker === 'function') {
      el.nepaliDatePicker({
        dateFormat: 'YYYY-MM-DD',
        closeOnDateSelect: true,
        container: 'body',
        miniEnglishDates: true,
        onSelect: (selected) => {
          if (selected && selected.value) {
            handleBsChange(selected.value);
          }
        },
      });
    }

    return () => {
      if (el && typeof el.nepaliDatePicker === 'function') {
        try {
          el.nepaliDatePicker('destroy');
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, [calendarMode, handleBsChange]);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', width: '100%', ...style }}>
      <Space.Compact style={{ width: '100%' }}>
        <Segmented
          options={[
            { label: 'B.S.', value: 'BS' },
            { label: 'A.D.', value: 'AD' },
          ]}
          value={calendarMode}
          onChange={setCalendarMode}
          size={size}
          style={{
            background: '#edf2f7',
            fontWeight: 700,
            fontSize: 11,
            color: '#013b73',
          }}
        />

        {calendarMode === 'BS' ? (
          <Input
            ref={inputRef}
            id={id}
            value={bsValue}
            onChange={(e) => handleBsChange(e.target.value)}
            placeholder={placeholder || 'YYYY-MM-DD (B.S.)'}
            prefix={<CalendarOutlined style={{ color: '#01519b' }} />}
            style={{ borderRadius: 4, width: '100%' }}
            allowClear={allowClear}
            disabled={disabled}
            size={size}
          />
        ) : (
          <DatePicker
            id={id}
            value={adValue && dayjs(adValue).isValid() ? dayjs(adValue) : null}
            onChange={handleAdChange}
            format="YYYY-MM-DD"
            placeholder={placeholder || 'YYYY-MM-DD (A.D.)'}
            style={{ borderRadius: 4, width: '100%' }}
            allowClear={allowClear}
            disabled={disabled}
            size={size}
          />
        )}
      </Space.Compact>

      {showEquivalent && (bsValue || adValue) && (
        <div
          style={{
            fontSize: 10,
            color: '#64748b',
            marginTop: 3,
            paddingLeft: 2,
            display: 'flex',
            justifyContent: 'space-between',
            lineHeight: '13px',
          }}
        >
          {calendarMode === 'BS' ? (
            <span>
              A.D. Equivalent: <strong style={{ color: '#0f172a' }}>{adValue || '—'}</strong>
            </span>
          ) : (
            <span>
              B.S. Equivalent: <strong style={{ color: '#0f172a' }}>{bsValue || '—'}</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default NepaliDatePicker;
