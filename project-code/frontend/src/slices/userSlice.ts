import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@responses/user";
import { RootState } from "@store/store";

interface UserState {
    user?: User
}


/**
 * Global state representing the current user
 */
export const userSlice = createSlice({
    name: 'user',
    initialState: {} as UserState,
    reducers: {
        setUser(state: UserState, action: PayloadAction<User | undefined>) {
            state.user = action.payload;
        }
    }
});

export const { setUser } = userSlice.actions;
export const selectUser = (state: RootState) => state.user.user;
export default userSlice.reducer;