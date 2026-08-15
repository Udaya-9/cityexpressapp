import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./login/loginpage";
import ForgetPassword from "./login/forgetpassword";
import DefaultPage from "./Default";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/ResetPassword" element={<ForgetPassword />} />
         <Route path="/default" element={<DefaultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;