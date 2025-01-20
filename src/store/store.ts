import { configureStore } from "@reduxjs/toolkit";
import statsReducer from "./statsSlice";

export const store = configureStore({
  reducer: {
    stats: statsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;