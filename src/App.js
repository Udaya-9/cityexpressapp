import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./login/form/index";
import ForgetPassword from "./login/form/forgetpassword";
import DefaultPage from './Default/form';
import Dashboard from "./Default/form/default";
import User from "./user/form";
import Vendor from "./vendor/form";
import Asset from "./assets/form"; 
import Memo from "./memo/form";
import Correspondence from "./correspondence/form";
import Budget from "./budget/form";
import Report from "./report/form";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/ResetPassword" element={<ForgetPassword />} />
        <Route path="/dashboard" element={<DefaultPage />} />
        <Route path="/vendor/*" element={<Dashboard><Vendor /></Dashboard>} />
        <Route path="/User/*" element={<Dashboard><User /></Dashboard>} />
        <Route path="/asset/*" element={<Dashboard><Asset /></Dashboard>} />
        <Route path="/memo/*" element={<Dashboard><Memo /></Dashboard>} />
        <Route path="/correspondence/*" element={<Dashboard><Correspondence /></Dashboard>} />
        <Route path="/budget/*" element={<Dashboard><Budget /></Dashboard>} />
        <Route path="/report/*" element={<Dashboard><Report /></Dashboard>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

//action -> reference id 