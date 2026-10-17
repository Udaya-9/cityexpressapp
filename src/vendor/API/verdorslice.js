import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createVendorApi } from "./vendorservice";

// Helper: Map your form fields to the exact API payload structure
const buildVendorPayload = (formValues, createdBy) => {
    const { panVatType, panVat, ...rest } = formValues;

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

// Thunk: Create vendor
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

const initialState = {
    creating: false,
    createdVendor: null,
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
            });
    },
});

export const { resetVendorState } = vendorSlice.actions;
export const selectVendorCreating = (state) => state.vendor.creating;
export const selectVendorError = (state) => state.vendor.error;
export const selectVendorSuccess = (state) => state.vendor.success;

export default vendorSlice.reducer;