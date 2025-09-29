// src/app/store/slices/notificationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: string; // Unique ID for each notification
  duration?: number; // How long it shows in ms (default 3000)
}

interface NotificationsState {
  notifications: NotificationState[];
}

const initialState: NotificationsState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; duration?: number }>) => {
      const newNotification: NotificationState = {
        ...action.payload,
        id: Math.random().toString(36).substring(2, 9), // Simple unique ID
      };
      state.notifications.push(newNotification);
    },
    hideNotification: (state, action: PayloadAction<string>) => {
      // Action payload is the ID of the notification to remove
      state.notifications = state.notifications.filter(
        (notif) => notif.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { showNotification, hideNotification, clearAllNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;