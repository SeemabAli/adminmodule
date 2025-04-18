import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthState = {
  userId: string;
  accessToken?: string;
  roles?: number[];
};

const initialState: AuthState = {
  userId: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthState>) => {
      state.accessToken = action.payload.accessToken;
      state.roles = action.payload.roles;
    },
  },
});

export const authActions = authSlice.actions;

export const authReducer = authSlice.reducer;
