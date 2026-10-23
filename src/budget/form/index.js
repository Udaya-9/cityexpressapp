import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BudgetHeading from './budgetheading';
import BudgetManagement from './budgetmanagement';
import BudgetApproval from './budgetapproval';
import BudgetReport from '../../report/form/budgetreport';

const Budget = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="heading" replace />} />
      <Route path="heading" element={<BudgetHeading />} />
      <Route path="management" element={<BudgetManagement />} />
      <Route path="approve" element={<BudgetApproval />} />
      <Route path="report" element={<BudgetReport />} />
      <Route path="*" element={<Navigate to="heading" replace />} />
    </Routes>
  );
};

export default Budget;
