import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "@store/store";

export enum Level {
    ERROR
}

export interface Error {
    status?: number;
    message: string;
}

export interface ErrorStatus {
    error: Error | null;
}

const initialErrorStatus : ErrorStatus = {
    error: null
}

/**
 * Global state indicating whether or not to display an error
 */
export const errorSlice = createSlice(({
    name: 'error',
    initialState: initialErrorStatus,
    reducers: {
        setError: (state, action: PayloadAction<Error>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        }
    }
}));

export const { setError, clearError } = errorSlice.actions;
export const selectError = (state: RootState) => state
export default errorSlice.reducer;