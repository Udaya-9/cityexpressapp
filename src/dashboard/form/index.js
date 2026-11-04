import React from "react";
import Dashboard from "./default"; 

const DashboardIndex = ({ children }) => {
  return (
    <Dashboard>
      {children}
    </Dashboard>
  );
};

export default DashboardIndex;