import React from "react";
import { Routes, Route } from "react-router-dom";
import VendorList from "./listvendor";
import CreateVendor from "./addnewvendor";

const Vendor = () => {
    return (
        <Routes>
            <Route path="/" element={<VendorList />} />
            <Route path="create" element={<CreateVendor />} />
        </Routes>
    );
};

export default Vendor;