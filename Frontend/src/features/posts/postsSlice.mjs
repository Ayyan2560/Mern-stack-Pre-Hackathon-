import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import postsService from '../../services/posts.service.mjs';
import {
  EXPLORE_PAGE_SIZE,
  FEED_PAGE_SIZE,
  PROFILE_PAGE_SIZE,
} from '../../utils/constants.js';
import { getErrorMessage, getStatusCode } from '../../utils/errors.js';
import { userIdOf } from '../../utils/format.js';

function reject(error, fallback) {
  return {
    message: getErrorMessage(error, fallback),
    status: getStatusCode(error),
  };
}

function createListState() {
  return {
    items: [],
    pagination: null,
    status: 'idle',
    loadingMore: false,
    error: null,
    requestId: null,
  };
}

function createInitialState() {
  return {
    feed: { ...createListState(), sort: 'newest' },
    explore: { ...createListState(), query: '' },
    bookmarks: createListState(),
    bookmarkedIds: [],
    userPosts: {},
    detail: {
      post: null,
      status: 'idle',
      error: null,
      requestId: null,
    },
    comments: {
      postId: null,
      items: [],
      status: 'idle',
      error: null,
      requestId: null,
    },
    pendingLikes: [],
    pendingBookmarks: [],
  };
}

function eachPostContainer(state, callback) {
  callback(state.feed.items);
  callback(state.explore.items);
  callback(state.bookmarks.items);

  Object.values(state.userPosts).forEach((entry) => callback(entry.items));
}

function findPost(state, postId) {
  if (state.detail.post?._id === postId) return state.detail.post;

  const containers = [
    state.feed.items,
    state.explore.items,
    state.bookmarks.items,
    ...Object.values(state.userPosts).map((entry) => entry.items),
  ];

  for (const items of containers) {
    const found = items.find((item) => item._id === postId);
    if (found) return found;
  }

  return null;
}

function patchEverywhere(state, postId, patch) {
  eachPostContainer(state, (items) => {
    const post = items.find((item) => item._id === postId);
    if (post) patch(post);
  });

  if (state.detail.post?._id === postId) {
    patch(state.detail.post);
  }
}

function removeEverywhere(state, postId) {
  const containers = [
    state.feed.items,
    state.explore.items,
    state.bookmarks.items,
    ...Object.values(state.userPosts).map((entry) => entry.items),
  ];

  containers.forEach((items) => {
    const index = items.findIndex((item) => item._id === postId);
    if (index !== -1) items.splice(index, 1);
  });

  if (state.detail.post?._id === postId) {
    state.detail.post = null;
    state.detail.status = 'idle';
  }

  state.bookmarkedIds = state.bookmarkedIds.filter((id) => id !== postId);
}

function mergePostFields(target, source) {
  if (!target || !source) return;
  if (source.title !== undefined) target.title = source.title;
  if (source.content !== undefined) target.content = source.content;
  if (source.updatedAt !== undefined) target.updatedAt = source.updatedAt;
}

function dedupeById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?._id || seen.has(item._id)) return false;
    seen.add(item._id);
    return true;
  });
}

export const fetchFeed = createAsyncThunk(
  'posts/fetchFeed',
  async ({ page = 1, sort = 'newest', append = false } = {}, { rejectWithValue }) => {
    try {
      const data = await postsService.listPosts({
        page,
        limit: FEED_PAGE_SIZE,
        sort,
      });

      return { data, append, page, sort };
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not load the journal.'));
    }
  }
);

export const fetchExplorePosts = createAsyncThunk(
  'posts/fetchExplore',
  async ({ query = '', page = 1, append = false } = {}, { rejectWithValue }) => {
    try {
      const params = {
        page,
        limit: EXPLORE_PAGE_SIZE,
        sort: 'newest',
      };

      if (query.trim()) params.search = query.trim();

      const data = await postsService.listPosts(params);
      return { data, append, page, query };
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not search the journal.'));
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async ({ userId, page = 1, append = false }, { rejectWithValue }) => {
    try {
      const data = await postsService.listPosts({
        page,
        limit: PROFILE_PAGE_SIZE,
        sort: 'newest',
        userId,
      });

      return { data, append, page, userId };
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not load these posts.'));
    }
  }
);

export const fetchPost = createAsyncThunk(
  'posts/fetchPost',
  async (postId, { rejectWithValue }) => {
    try {
      const data = await postsService.getPost(postId);
      return data.post;
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not load this post.'));
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const data = await postsService.createPost(formData);
      const currentUser = getState().auth.user;

      return {
        post: {
          ...data.post,
          user: currentUser
            ? {
                _id: userIdOf(currentUser),
                name: currentUser.name,
                profilePicture: currentUser.profilePicture,
              }
            : data.post.user,
        },
        message: data.message,
      };
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not publish your post.'));
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, title, content }, { rejectWithValue }) => {
    try {
      const data = await postsService.updatePost(postId, { title, content });
      return { postId, post: data.post, message: data.message };
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not save your changes.'));
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      const data = await postsService.deletePost(postId);
      return { postId, message: data.message };
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not delete this post.'));
    }
  }
);

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId, { getState, rejectWithValue }) => {
    try {
      const data = await postsService.toggleLike(postId);
      return {
        postId,
        liked: data.liked,
        totalLikes: data.totalLikes,
        userId: userIdOf(getState().auth.user),
      };
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not update your like.'));
    }
  }
);

export const toggleBookmark = createAsyncThunk(
  'posts/toggleBookmark',
  async (postId, { rejectWithValue }) => {
    try {
      const data = await postsService.toggleBookmark(postId);
      return { postId, bookmarked: data.bookmarked };
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not update your saved posts.'));
    }
  }
);

export const fetchBookmarks = createAsyncThunk(
  'posts/fetchBookmarks',
  async (_, { rejectWithValue }) => {
    try {
      const data = await postsService.getBookmarks();
      return data;
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not load your saved posts.'));
    }
  }
);

export const fetchComments = createAsyncThunk(
  'posts/fetchComments',
  async (postId, { rejectWithValue }) => {
    try {
      const data = await postsService.getComments(postId);
      return { postId, comments: data.comments || [] };
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not load the conversation.'));
    }
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, text }, { getState, rejectWithValue }) => {
    try {
      const data = await postsService.addComment(postId, text);
      const user = getState().auth.user;

      return {
        postId,
        comment: {
          ...data.comment,
          user: user
            ? {
                _id: userIdOf(user),
                name: user.name,
                profilePicture: user.profilePicture,
              }
            : data.comment.user,
        },
      };
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not add your comment.'));
    }
  }
);

export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      const data = await postsService.deleteComment(postId, commentId);
      return { postId, commentId, message: data.message };
    } catch (error) {
      return rejectWithValue(reject(error, 'Could not delete this comment.'));
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: createInitialState(),
  reducers: {
    clearFeedError: (state) => {
      state.feed.error = null;
    },
    clearExplore: (state) => {
      state.explore = { ...createListState(), query: '' };
    },
    clearDetail: (state) => {
      state.detail = { post: null, status: 'idle', error: null, requestId: null };
      state.comments = {
        postId: null,
        items: [],
        status: 'idle',
        error: null,
        requestId: null,
      };
    },
    resetPosts: () => createInitialState(),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state, action) => {
        state.feed.requestId = action.meta.requestId;
        state.feed.error = null;
        state.feed.sort = action.meta.arg.sort || 'newest';

        if (action.meta.arg.append) {
          state.feed.loadingMore = true;
        } else {
          state.feed.status = 'loading';
        }
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        if (state.feed.requestId !== action.meta.requestId) return;

        const { data, append } = action.payload;
        const posts = data.posts || [];

        state.feed.items = append ? dedupeById([...state.feed.items, ...posts]) : posts;
        state.feed.pagination = data.pagination || null;
        state.feed.status = 'succeeded';
        state.feed.loadingMore = false;
        state.feed.error = null;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        if (state.feed.requestId !== action.meta.requestId) return;
        state.feed.status = state.feed.items.length ? 'succeeded' : 'failed';
        state.feed.loadingMore = false;
        state.feed.error = action.payload?.message || 'Could not load the journal.';
      })
      .addCase(fetchExplorePosts.pending, (state, action) => {
        state.explore.requestId = action.meta.requestId;
        state.explore.query = action.meta.arg.query || '';
        state.explore.error = null;

        if (action.meta.arg.append) {
          state.explore.loadingMore = true;
        } else {
          state.explore.status = 'loading';
        }
      })
      .addCase(fetchExplorePosts.fulfilled, (state, action) => {
        if (state.explore.requestId !== action.meta.requestId) return;

        const { data, append } = action.payload;
        const posts = data.posts || [];

        state.explore.items = append ? dedupeById([...state.explore.items, ...posts]) : posts;
        state.explore.pagination = data.pagination || null;
        state.explore.status = 'succeeded';
        state.explore.loadingMore = false;
        state.explore.error = null;
      })
      .addCase(fetchExplorePosts.rejected, (state, action) => {
        if (state.explore.requestId !== action.meta.requestId) return;
        state.explore.status = state.explore.items.length ? 'succeeded' : 'failed';
        state.explore.loadingMore = false;
        state.explore.error = action.payload?.message || 'Could not search the journal.';
      })
      .addCase(fetchUserPosts.pending, (state, action) => {
        const { userId, append } = action.meta.arg;

        if (!state.userPosts[userId]) {
          state.userPosts[userId] = createListState();
        }

        const entry = state.userPosts[userId];
        entry.requestId = action.meta.requestId;
        entry.error = null;

        if (append) {
          entry.loadingMore = true;
        } else {
          entry.status = 'loading';
        }
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        const { userId, append } = action.meta.arg;
        const entry = state.userPosts[userId];

        if (!entry || entry.requestId !== action.meta.requestId) return;

        const posts = action.payload.data.posts || [];
        entry.items = append ? dedupeById([...entry.items, ...posts]) : posts;
        entry.pagination = action.payload.data.pagination || null;
        entry.status = 'succeeded';
        entry.loadingMore = false;
        entry.error = null;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        const { userId } = action.meta.arg;
        const entry = state.userPosts[userId];

        if (!entry || entry.requestId !== action.meta.requestId) return;

        entry.status = entry.items.length ? 'succeeded' : 'failed';
        entry.loadingMore = false;
        entry.error = action.payload?.message || 'Could not load these posts.';
      })
      .addCase(fetchPost.pending, (state, action) => {
        state.detail.requestId = action.meta.requestId;
        state.detail.status = 'loading';
        state.detail.error = null;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        if (state.detail.requestId !== action.meta.requestId) return;
        state.detail.post = action.payload;
        state.detail.status = 'succeeded';
        state.detail.error = null;

        patchEverywhere(state, action.payload._id, (post) => {
          Object.assign(post, action.payload);
        });
      })
      .addCase(fetchPost.rejected, (state, action) => {
        if (state.detail.requestId !== action.meta.requestId) return;
        state.detail.status = 'failed';
        state.detail.error = action.payload?.message || 'Could not load this post.';
      })
      .addCase(createPost.pending, (state) => {
        state.detail.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        const post = action.payload.post;

        state.feed.items = dedupeById([post, ...state.feed.items]);
        state.detail.post = post;
        state.detail.status = 'succeeded';

        const authorId = userIdOf(post.user);
        if (authorId && state.userPosts[authorId]) {
          state.userPosts[authorId].items = dedupeById([post, ...state.userPosts[authorId].items]);
        }
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const { postId, post } = action.payload;

        patchEverywhere(state, postId, (target) => mergePostFields(target, post));

        if (state.detail.post?._id === postId) {
          state.detail.post = { ...state.detail.post, ...post, user: state.detail.post.user };
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        removeEverywhere(state, action.payload.postId);
      })
      .addCase(toggleLike.pending, (state, action) => {
        state.pendingLikes.push(action.meta.arg);
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, liked, totalLikes, userId } = action.payload;

        state.pendingLikes = state.pendingLikes.filter((id) => id !== postId);

        patchEverywhere(state, postId, (post) => {
          const likes = new Set((post.likes || []).map(String));

          if (liked && userId) likes.add(String(userId));
          if (!liked && userId) likes.delete(String(userId));

          post.likes = Array.from(likes);

          if (typeof totalLikes === 'number') {
            post.totalLikes = totalLikes;
          }
        });
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.pendingLikes = state.pendingLikes.filter((id) => id !== action.meta.arg);
      })
      .addCase(toggleBookmark.pending, (state, action) => {
        state.pendingBookmarks.push(action.meta.arg);
      })
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        const { postId, bookmarked } = action.payload;
        const ids = new Set(state.bookmarkedIds);

        state.pendingBookmarks = state.pendingBookmarks.filter((id) => id !== postId);

        if (bookmarked) {
          ids.add(postId);

          const post = findPost(state, postId);
          if (post && !state.bookmarks.items.some((item) => item._id === postId)) {
            state.bookmarks.items.unshift(post);
          }
        } else {
          ids.delete(postId);
          state.bookmarks.items = state.bookmarks.items.filter((item) => item._id !== postId);
        }

        state.bookmarkedIds = Array.from(ids);
      })
      .addCase(toggleBookmark.rejected, (state, action) => {
        state.pendingBookmarks = state.pendingBookmarks.filter((id) => id !== action.meta.arg);
      })
      .addCase(fetchBookmarks.pending, (state) => {
        state.bookmarks.status = 'loading';
        state.bookmarks.error = null;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        const bookmarks = (action.payload.bookmarks || []).filter(Boolean);
        state.bookmarks.items = bookmarks;
        state.bookmarks.status = 'succeeded';
        state.bookmarks.error = null;
        state.bookmarkedIds = bookmarks.map((post) => post._id);
      })
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.bookmarks.status = 'failed';
        state.bookmarks.error = action.payload?.message || 'Could not load your saved posts.';
      })
      .addCase(fetchComments.pending, (state, action) => {
        state.comments.requestId = action.meta.requestId;
        state.comments.status = 'loading';
        state.comments.error = null;
        state.comments.postId = action.meta.arg;
        state.comments.items = [];
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        if (state.comments.requestId !== action.meta.requestId) return;
        state.comments.postId = action.payload.postId;
        state.comments.items = action.payload.comments;
        state.comments.status = 'succeeded';
        state.comments.error = null;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        if (state.comments.requestId !== action.meta.requestId) return;
        state.comments.status = 'failed';
        state.comments.error = action.payload?.message || 'Could not load the conversation.';
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;

        if (state.comments.postId === postId) {
          state.comments.items.push(comment);
        }

        patchEverywhere(state, postId, (post) => {
          post.comments = [...(post.comments || []), comment];
        });
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const { postId, commentId } = action.payload;

        if (state.comments.postId === postId) {
          state.comments.items = state.comments.items.filter((item) => item._id !== commentId);
        }

        patchEverywhere(state, postId, (post) => {
          post.comments = (post.comments || []).filter((item) => item._id !== commentId);
        });
      })
      .addCase('auth/logout/fulfilled', () => createInitialState())
      .addCase('auth/sessionExpired', () => createInitialState());
  },
});

export const { clearFeedError, clearExplore, clearDetail, resetPosts } = postsSlice.actions;
export default postsSlice.reducer;
