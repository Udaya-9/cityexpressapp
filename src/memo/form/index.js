import React from "react";
import { Routes, Route } from "react-router-dom";
import MemoDashboard from "./memodashboard";
import MemoList from "./listmemo";
import CreateMemo from "./creatememo";

const Memo = () => {
    return (
        <Routes>
            <Route path="/" element={<MemoDashboard />} />
            <Route path="dashboard" element={<MemoDashboard />} />
            <Route path="inbox" element={<MemoList mode="inbox" />} />
            <Route path="sent" element={<MemoList mode="sent" />} />
            <Route path="create" element={<CreateMemo />} />
        </Routes>
    );
};

export default Memo;
