import React from "react";
import { Routes, Route } from "react-router-dom";
import AssetList from "./listassets";
import AssetDetail from "./assetdetails";
import CreateAsset from "./newasset";
import AssetReview from "./assetreview"; 

const Asset = () => {
    return (
        <Routes>
            <Route path="/" element={<AssetList />} />
            <Route path="create" element={<CreateAsset />} />
            <Route path="edit/:id" element={<CreateAsset />} />
            <Route path="detail/:id" element={<AssetDetail />} />
            <Route path="review/:id" element={<AssetReview />} />
        </Routes>
    );
};

export default Asset;