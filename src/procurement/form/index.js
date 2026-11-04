import React from "react";
import { Routes, Route } from "react-router-dom";
import ProcurementList from "./list"; 
import CreateProcurement from "./create"; 
import ProcurementDetails from "./details"; 

const Procurement = () => {
    return (
        <Routes>
            {/* Default route: /procurement */}
            <Route index element={<ProcurementList />} />
            
            {/* Route: /procurement/create */}
            <Route path="create" element={<CreateProcurement />} />
            
            {/* Route: /procurement/:id */}
            <Route path=":id" element={<ProcurementDetails />} />
        </Routes>
    );
};

export default Procurement;