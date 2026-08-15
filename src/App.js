import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "./login/loginpage";
import ForgetPassword from "./login/forgetpassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/ResetPassword" element={<ForgetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;