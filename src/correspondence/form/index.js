import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CorrespondenceList from './correspondencelist';
import NewCorrespondenceEntry from './newentry';
import CorrespondenceReport from '../../report/form/correspondencereport';

const Correspondence = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="incoming" replace />} />
      <Route path="incoming" element={<CorrespondenceList type="incoming" />} />
      <Route path="incoming/new" element={<NewCorrespondenceEntry type="incoming" />} />
      <Route path="outgoing" element={<CorrespondenceList type="outgoing" />} />
      <Route path="outgoing/new" element={<NewCorrespondenceEntry type="outgoing" />} />
      <Route path="report" element={<CorrespondenceReport />} />
      <Route path="*" element={<Navigate to="incoming" replace />} />
    </Routes>
  );
};

export default Correspondence;