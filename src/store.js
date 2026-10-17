// src/store.js
import { configureStore } from "@reduxjs/toolkit";
import vendorReducer from "./vendor/API/verdorslice"; 
export const store = configureStore({
    reducer: {
        vendor: vendorReducer,
    },
});