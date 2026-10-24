import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authService from '../../services/auth.service.mjs';
import { TOKEN_KEY } from '../../utils/constants.js';
import { getErrorMessage, getStatusCode } from '../../utils/errors.js';

function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    id: user.id || user._id,
  };
}

export const bootstrapAuth = createAsyncThunk(
  'auth/bootstrap',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return { user: null, token: null };
    }

    try {
      const data = await authService.getCurrentUser();
      return { user: normalizeUser(data.user), token };
    } catch (error) {
      return rejectWithValue({
        message: getErrorMessage(error, 'Could not restore your session.'),
        status: getStatusCode(error),
      });
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);

      if (!data?.token) {
        throw new Error('The server did not return an authentication token.');
      }

      localStorage.setItem(TOKEN_KEY, data.token);

      let user = normalizeUser(data.user);

      try {
        const me = await authService.getCurrentUser();
        if (me?.user) user = normalizeUser(me.user);
      } catch {
        // The login itself succeeded. The basic user payload is enough until
        // the next session refresh.
      }

      return { user, token: data.token, message: data.message };
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      return rejectWithValue(getErrorMessage(error, 'Sign in failed. Please try again.'));
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.signup(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not create your account.'));
    }
  }
);

export const verifyEmailOtp = createAsyncThunk(
  'auth/verifyEmail',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.verifyEmail(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'We could not verify that code.'));
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/forgotPassword',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.forgotPassword(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not send a reset code.'));
    }
  }
);

export const resetPasswordWithOtp = createAsyncThunk(
  'auth/resetPassword',
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.resetPassword(payload);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not reset your password.'));
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem(TOKEN_KEY);

  try {
    await authService.logout();
  } catch {
    // Logging out locally is what matters; the endpoint is stateless.
  }

  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem(TOKEN_KEY),
    initialized: false,
    status: 'idle',
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = normalizeUser(action.payload);
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    sessionExpired: (state) => {
      localStorage.removeItem(TOKEN_KEY);
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = 'Your session has expired. Please sign in again.';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.status = 'idle';
        state.initialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(bootstrapAuth.rejected, (state, action) => {
        state.status = 'idle';
        state.initialized = true;

        if (action.payload?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          state.user = null;
          state.token = null;
        } else {
          state.error = action.payload?.message || 'Could not restore your session.';
        }
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.initialized = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = typeof action.payload === 'string' ? action.payload : 'Sign in failed.';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = 'idle';
        state.error = null;
        state.initialized = true;
      });
  },
});

export const { setUser, clearAuthError, sessionExpired } = authSlice.actions;
export default authSlice.reducer;
