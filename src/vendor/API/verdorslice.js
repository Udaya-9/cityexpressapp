import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createVendorApi, listvendorsApi } from "./vendorservice";

// Helper: Map your form fields to the exact API payload structure
const buildVendorPayload = (formValues, createdBy) => {
    const { panVatType, panVat, ...rest } = formValues || {};

    return {
        VendorName: rest.vendorName?.trim() || "",
        ContactPerson: rest.contactPerson?.trim() || "",
        Address: rest.address?.trim() || "",
        MobileNo: rest.mobileNo?.trim() || "",
        PhoneNo: rest.phoneNo?.trim() || "",
        eMailAddress: rest.email?.trim() || "",
        PAN: panVatType === "PAN" ? panVat : "",
        VAT: panVatType === "VAT" ? panVat : "",
        RegistrationNo: rest.registrationNo?.trim() || "",
        Createdby: createdBy || ""
    };
};


export const createVendor = createAsyncThunk(
    "vendor/createVendor",
    async ({ formValues, createdBy }, { rejectWithValue }) => {
        try {
            const payload = buildVendorPayload(formValues, createdBy);
            const data = await createVendorApi(payload);
            return data;
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.title ||
                error?.message ||
                "Failed to create vendor";
            return rejectWithValue(message);
        }
    }
);

// Thunk: List vendors
// Thunk: List vendors
export const listvendor = createAsyncThunk(
    "vendor/listVendor",
    async (createdBy, { rejectWithValue }) => {
        try {
            // Send only the parameter required for listing
            const payload = { Createdby: createdBy || "" };
            const data = await listvendorsApi(payload);
            return data;
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.response?.data?.title ||
                error?.message ||
                "Failed to list vendors";
            return rejectWithValue(message);
        }
    }
);

const initialState = {
    creating: false,
    createdVendor: null,
    loadingVendors: false,
    vendors: [],
    listError: null,
    error: null,
    success: false,
};

const vendorSlice = createSlice({
    name: "vendor",
    initialState,
    reducers: {
        resetVendorState: (state) => {
            state.creating = false;
            state.createdVendor = null;
            state.error = null;
            state.success = false;
        },
        resetVendorListState: (state) => {
            state.loadingVendors = false;
            state.vendors = [];
            state.listError = null;
        },
    },
    extraReducers: (builder) => {
        builder
           
            .addCase(createVendor.pending, (state) => {
                state.creating = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createVendor.fulfilled, (state, action) => {
                state.creating = false;
                state.success = true;
                state.createdVendor = action.payload;
            })
            .addCase(createVendor.rejected, (state, action) => {
                state.creating = false;
                state.success = false;
                state.error = action.payload || "Something went wrong";
            })
            // --- List Vendors Handlers ---
            .addCase(listvendor.pending, (state) => {
                state.loadingVendors = true;
                state.listError = null;
            })
            .addCase(listvendor.fulfilled, (state, action) => {
                state.loadingVendors = false;               
                state.vendors = action.payload?.data || action.payload || [];
            })
            .addCase(listvendor.rejected, (state, action) => {
                state.loadingVendors = false;
                state.listError = action.payload || "Failed to fetch vendors";
            });
    },
});

export const { resetVendorState, resetVendorListState } = vendorSlice.actions;

// Selectors for Create
export const selectVendorCreating = (state) => state.vendor.creating;
export const selectVendorError = (state) => state.vendor.error;
export const selectVendorSuccess = (state) => state.vendor.success;

// Selectors for List
export const selectLoadingVendors = (state) => state.vendor.loadingVendors;
export const selectVendorList = (state) => state.vendor.vendors;
export const selectVendorListError = (state) => state.vendor.listError;

export default vendorSlice.reducer;