import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import { store } from './app/store.mjs';
import './styles/global.css';
import './styles/auth.css';
import './styles/shell.css';
import './styles/feed.css';
import './styles/posts.css';
import './styles/profile.css';
import './styles/pages.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
