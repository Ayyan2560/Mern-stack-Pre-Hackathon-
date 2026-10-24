import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import profileService from '../../services/profile.service.mjs';
import { getErrorMessage, getStatusCode } from '../../utils/errors.js';

const reject = (error, fallback) => ({
  message: getErrorMessage(error, fallback),
  status: getStatusCode(error),
});

function createInitialState() {
  return {
    me: null,
    status: 'idle',
    error: null,
    saveStatus: 'idle',
    saveError: null,
    avatarStatus: 'idle',
    avatarError: null,
    passwordStatus: 'idle',
    passwordError: null,
  };
}

export const fetchMyProfile = createAsyncThunk(
  'profile/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      const data = await profileService.getProfile();
      return data.user;
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not load your profile.'));
    }
  }
);

export const updateMyProfile = createAsyncThunk(
  'profile/updateMine',
  async ({ name }, { rejectWithValue }) => {
    try {
      const data = await profileService.updateProfile({ name });
      return data;
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not save your profile.'));
    }
  }
);

export const uploadMyAvatar = createAsyncThunk(
  'profile/uploadAvatar',
  async (file, { rejectWithValue }) => {
    try {
      const data = await profileService.uploadProfilePicture(file);
      return data;
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not upload your photo.'));
    }
  }
);

export const removeMyAvatar = createAsyncThunk(
  'profile/removeAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const data = await profileService.removeProfilePicture();
      return data;
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not remove your photo.'));
    }
  }
);

export const changeMyPassword = createAsyncThunk(
  'profile/changePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const data = await profileService.changePassword({ currentPassword, newPassword });
      return data;
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not change your password.'));
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: createInitialState(),
  reducers: {
    clearProfile: () => createInitialState(),
    clearProfileErrors: (state) => {
      state.error = null;
      state.saveError = null;
      state.avatarError = null;
      state.passwordError = null;
    },
    resetSaveStatus: (state) => {
      state.saveStatus = 'idle';
    },
    resetPasswordStatus: (state) => {
      state.passwordStatus = 'idle';
    },
    syncProfileUser: (state, action) => {
      state.me = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.me = action.payload;
        state.error = null;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Could not load your profile.';
      })
      .addCase(updateMyProfile.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.me = action.payload.user;
        state.saveError = null;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.saveError = action.payload?.message || 'Could not save your profile.';
      })
      .addCase(uploadMyAvatar.pending, (state) => {
        state.avatarStatus = 'loading';
        state.avatarError = null;
      })
      .addCase(uploadMyAvatar.fulfilled, (state, action) => {
        state.avatarStatus = 'succeeded';
        state.avatarError = null;

        if (state.me) {
          state.me = { ...state.me, profilePicture: action.payload.profilePicture };
        }
      })
      .addCase(uploadMyAvatar.rejected, (state, action) => {
        state.avatarStatus = 'failed';
        state.avatarError = action.payload?.message || 'Could not upload your photo.';
      })
      .addCase(removeMyAvatar.pending, (state) => {
        state.avatarStatus = 'loading';
        state.avatarError = null;
      })
      .addCase(removeMyAvatar.fulfilled, (state) => {
        state.avatarStatus = 'succeeded';
        state.avatarError = null;

        if (state.me) {
          state.me = {
            ...state.me,
            profilePicture: { url: '', publicId: '' },
          };
        }
      })
      .addCase(removeMyAvatar.rejected, (state, action) => {
        state.avatarStatus = 'failed';
        state.avatarError = action.payload?.message || 'Could not remove your photo.';
      })
      .addCase(changeMyPassword.pending, (state) => {
        state.passwordStatus = 'loading';
        state.passwordError = null;
      })
      .addCase(changeMyPassword.fulfilled, (state) => {
        state.passwordStatus = 'succeeded';
        state.passwordError = null;
      })
      .addCase(changeMyPassword.rejected, (state, action) => {
        state.passwordStatus = 'failed';
        state.passwordError = action.payload?.message || 'Could not change your password.';
      })
      .addCase('auth/logout/fulfilled', () => createInitialState())
      .addCase('auth/sessionExpired', () => createInitialState());
  },
});

export const {
  clearProfile,
  clearProfileErrors,
  resetSaveStatus,
  resetPasswordStatus,
  syncProfileUser,
} = profileSlice.actions;

export default profileSlice.reducer;
