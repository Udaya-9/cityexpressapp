import React from "react";
import { Routes, Route } from "react-router-dom";
import UserList from "./listuser";
import CreateUser from "./newuser";
import UpdateUser from "./updateuser";  

const User = () => {
    return (
        <Routes>
            <Route path="/" element={<UserList />} />
            <Route path="create" element={<CreateUser />} />
            <Route path="edit/:id" element={<UpdateUser />} />  
        </Routes>
    );
};

export default User;