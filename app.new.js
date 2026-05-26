// Simple front-end auth + books wired to backend APIs

const authSection = document.getElementById('auth');
const appSection = document.getElementById('app');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showLoginBtn = document.getElementById('show-login');
const showSignupBtn = document.getElementById('show-signup');
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
  localStorage.setItem('user', JSON.stringify(user));
}

function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function showApp() {
  const user = getUser();
  userInfo.textContent = user ? `Logged in as ${user.name} (${user.email})` : '';
  authSection.classList.add('hidden');
  appSection.classList.remove('hidden');
  loadBooks();
}

function showAuth() {
  appSection.classList.add('hidden');
  authSection.classList.remove('hidden');
}

// Toggle login/signup forms
if (showLoginBtn && showSignupBtn) {
  showLoginBtn.addEventListener('click', () => {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  });
  showSignupBtn.addEventListener('click', () => {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  });
}

// Handle login
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errEl = document.getElementById('login-error');
    errEl.textContent = '';
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'Login failed');
      setToken(data.token);
      setUser(data.user);
      showApp();
    } catch (err) {
      errEl.textContent = err.message;
    }
  });
}

// Handle signup
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const errEl = document.getElementById('signup-error');
    errEl.textContent = '';
    try {
      const resp = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'Signup failed');
      setToken(data.token);
      setUser(data.user);
      showApp();
    } catch (err) {
      errEl.textContent = err.message;
    }
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    clearToken();
    localStorage.removeItem('user');
    showAuth();
  });
}

// Books
async function loadBooks() {
  const list = document.getElementById('book-list');
  list.innerHTML = '';
  try {
    const resp = await fetch('/api/books', {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (resp.status === 401) {
      showAuth();
      return;
    }
    const books = await resp.json();
    books.forEach(addBookRow);
  } catch (err) {
    console.error('Failed to load books', err);
  }
}

function addBookRow(book) {
  const list = document.getElementById('book-list');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${book.title}</td>
    <td>${book.author}</td>
    <td>${book.isbn}</td>
    <td></td>
  `;
  list.appendChild(row);
}

const bookForm = document.getElementById('book-form');
if (bookForm) {
  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const isbn = document.getElementById('isbn').value.trim();

    if (!title || !author || !isbn) {
      return;
    }

    try {
      const resp = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ title, author, isbn }),
      });
      if (resp.status === 401) {
        showAuth();
        return;
      }
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'Failed to create book');
      addBookRow(data);
      bookForm.reset();
    } catch (err) {
      console.error(err);
    }
  });
}

// Init view
if (getToken() && getUser()) {
  showApp();
} else {
  showAuth();
}
