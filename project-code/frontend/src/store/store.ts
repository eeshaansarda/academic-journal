import { configureStore } from '@reduxjs/toolkit';
import authenticatedSlice from "@slices/authenticatedSlice";
import userSlice from '@slices/userSlice';
import errorSlice from '@slices/errorSlice';

export const store = configureStore({
    reducer: {
        authenticated: authenticatedSlice,
        user: userSlice,
        error: errorSlice
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;