import { createSlice } from "@reduxjs/toolkit";
import {RootState} from "@store/store";

export enum AuthenticatedStatus {
    AUTHENTICATED,
    NOT_AUTHENTICATED,
    UNKNOWN
}

interface AuthenticatedState {
    status: AuthenticatedStatus
}

const initialAuthenticatedState: AuthenticatedState = {
    status: AuthenticatedStatus.UNKNOWN
};

/**
 * Global state representing whether a given user is authenticated
 */
export const authenticatedSlice = createSlice({
    name: 'authorization',
    initialState: initialAuthenticatedState,
    reducers: {
        setAuthenticated: (state, action) => {
            state.status = action.payload === true
                ? AuthenticatedStatus.AUTHENTICATED
                : AuthenticatedStatus.NOT_AUTHENTICATED;
        }
    }
});

export const { setAuthenticated } = authenticatedSlice.actions;
export const selectAuthenticatedStatus = (state: RootState) => state.authenticated.status;
export default authenticatedSlice.reducer;