import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import notificationsService from '../../services/notifications.service.mjs';
import { getErrorMessage, getStatusCode } from '../../utils/errors.js';

const reject = (error, fallback) => ({
  message: getErrorMessage(error, fallback),
  status: getStatusCode(error),
});

function createInitialState() {
  return {
    items: [],
    unreadCount: 0,
    status: 'idle',
    error: null,
    unreadStatus: 'idle',
    markingAll: false,
    pendingIds: [],
  };
}

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await notificationsService.getNotifications();
      return data.notifications || [];
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not load your notifications.'));
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnread',
  async (_, { rejectWithValue }) => {
    try {
      const data = await notificationsService.getUnreadCount();
      return data.unreadCount ?? 0;
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not check notifications.'));
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (notification, { rejectWithValue }) => {
    if (notification?.isRead) {
      return { notification, skipped: true };
    }

    try {
      const data = await notificationsService.markAsRead(notification._id);
      return { notification: data.notification, skipped: false };
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not update this notification.'));
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      const data = await notificationsService.markAllAsRead();
      return data;
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not mark notifications as read.'));
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: createInitialState(),
  reducers: {
    resetNotifications: () => createInitialState(),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Could not load your notifications.';
      })
      .addCase(fetchUnreadCount.pending, (state) => {
        state.unreadStatus = 'loading';
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
        state.unreadStatus = 'succeeded';
      })
      .addCase(fetchUnreadCount.rejected, (state) => {
        state.unreadStatus = 'failed';
      })
      .addCase(markNotificationRead.pending, (state, action) => {
        state.pendingIds.push(action.meta.arg._id);
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const { notification, skipped } = action.payload;
        state.pendingIds = state.pendingIds.filter((id) => id !== notification._id);

        if (skipped) return;

        const item = state.items.find((entry) => entry._id === notification._id);
        const wasUnread = item ? !item.isRead : false;

        if (item) {
          item.isRead = true;
        }

        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.pendingIds = state.pendingIds.filter((id) => id !== action.meta.arg._id);
      })
      .addCase(markAllNotificationsRead.pending, (state) => {
        state.markingAll = true;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.markingAll = false;
        state.items = state.items.map((item) => ({ ...item, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsRead.rejected, (state) => {
        state.markingAll = false;
      })
      .addCase('auth/logout/fulfilled', () => createInitialState())
      .addCase('auth/sessionExpired', () => createInitialState());
  },
});

export const { resetNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
