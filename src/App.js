import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./login/loginpage";
import ForgetPassword from "./login/forgetpassword";
import DefaultPage from "./Default";
import Dashboard from "./Default/default";
import User from "./user";
import Vendor from "./vendor";  // ✅ Capitalized V

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/ResetPassword" element={<ForgetPassword />} />
        <Route path="/dashboard" element={<DefaultPage />} />  
        <Route path="/vendor/*" element={<Dashboard><Vendor /></Dashboard>} />
        <Route path="/User/*" element={<Dashboard><User /></Dashboard>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;