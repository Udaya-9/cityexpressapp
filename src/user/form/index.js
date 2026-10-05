import React from "react";
import { Routes, Route } from "react-router-dom";
import UserList from "./listuser";
import CreateUser from "./newuser";

const User = () => {
    return (
        <Routes>
            <Route path="/" element={<UserList />} />
            <Route path="create" element={<CreateUser />} />
        </Routes>
    );
};

export default User;