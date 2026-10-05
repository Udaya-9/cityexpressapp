import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./login/form/index";
import ForgetPassword from "./login/form/forgetpassword";
import DefaultPage from './Default/form';
import Dashboard from "./Default/form/default";
import User from "./user/form";
import Vendor from "./vendor/form";
import Asset from "./assets/form"; 

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;