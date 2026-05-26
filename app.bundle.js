// Front-end logic to integrate with backend APIs for auth and books
(function () {
  const authSection = document.getElementById('auth');
  const appSection = document.getElementById('app');

  const showLoginBtn = document.getElementById('show-login');
  const showSignupBtn = document.getElementById('show-signup');

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  const loginError = document.getElementById('login-error');
  const signupError = document.getElementById('signup-error');

  const bookForm = document.getElementById('book-form');
  const bookList = document.getElementById('book-list');

  const logoutBtn = document.getElementById('logout-btn');
  const userInfo = document.getElementById('user-info');

  function getToken() {
    return localStorage.getItem('token');
  }
  function setToken(token) {
    localStorage.setItem('token', token);
  }
  function clearToken() {
    localStorage.removeItem('token');
  }
  function setUser(user) {
    localStorage.setItem('user', JSON.stringify(user || {}));
  }
  function getUser() {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  }

  function showAuth() {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    loginError.textContent = '';
    signupError.textContent = '';
    // default to login form
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  }

  function showApp() {
    const user = getUser();
    userInfo.textContent = user && user.name ? `Signed in as ${user.name}` : '';
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
  }

  async function apiFetch(path, options = {}) {
    const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(path, Object.assign({}, options, { headers }));
    let data;
    try { data = await res.json(); } catch { data = null; }
    if (!res.ok) {
      const message = (data && (data.message || data.error)) || `Request failed: ${res.status}`;
      throw new Error(message);
    }
    return data;
  }

  async function loadBooks() {
    try {
      const books = await apiFetch('/api/books');
      renderBooks(books);
    } catch (err) {
      console.error('Failed to load books', err);
      alert(`Failed to load books: ${err.message}`);
    }
  }

  function renderBooks(books) {
    while (bookList.firstChild) bookList.removeChild(bookList.firstChild);
    (books || []).forEach(book => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${escapeHtml(book.title)}</td>
        <td>${escapeHtml(book.author)}</td>
        <td>${escapeHtml(book.isbn)}</td>
        <td></td>
      `;
      bookList.appendChild(row);
    });
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function createBook({ title, author, isbn }) {
    return apiFetch('/api/books', {
      method: 'POST',
      body: JSON.stringify({ title, author, isbn })
    });
  }

  // Toggle auth forms
  if (showLoginBtn) showLoginBtn.addEventListener('click', () => {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  });
  if (showSignupBtn) showSignupBtn.addEventListener('click', () => {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });

  // Login
  if (loginForm) loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      setToken(data.token);
      setUser(data.user);
      showApp();
      await loadBooks();
      // clear form
      loginForm.reset();
    } catch (err) {
      loginError.textContent = err.message;
    }
  });

  // Signup
  if (signupForm) signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signupError.textContent = '';
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    try {
      const data = await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
      });
      setToken(data.token);
      setUser(data.user);
      showApp();
      await loadBooks();
      signupForm.reset();
    } catch (err) {
      signupError.textContent = err.message;
    }
  });

  // Create book
  if (bookForm) bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const isbn = document.getElementById('isbn').value.trim();
    if (!title || !author || !isbn) return;
    try {
      await createBook({ title, author, isbn });
      bookForm.reset();
      await loadBooks();
    } catch (err) {
      alert(`Failed to create book: ${err.message}`);
    }
  });

  // Logout
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    clearToken();
    setUser(null);
    renderBooks([]);
    showAuth();
  });

  // init
  window.addEventListener('DOMContentLoaded', async () => {
    if (getToken()) {
      showApp();
      await loadBooks();
    } else {
      showAuth();
    }
  });
})();
