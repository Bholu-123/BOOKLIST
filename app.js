// API base URL (adjust if your backend runs elsewhere)
const API_BASE = window.API_BASE || 'http://localhost:5000';

// Simple helpers for token storage
function getToken() {
  return localStorage.getItem('token');
}
function setToken(t) {
  localStorage.setItem('token', t);
}
function clearToken() {
  localStorage.removeItem('token');
}

// Using ES6 classes - keep UI methods for alerts/rendering
class UI {
  // showAlert - displays a message inside a span like .titleAlert
  showAlert(message, className, field) {
    const alert = document.querySelector(`.${field}Alert`);
    if (!alert) return;
    const text = document.createTextNode(message);
    alert.classList.add(className);
    alert.appendChild(text);
    setTimeout(function () {
      const el = document.querySelector(`.${field}Alert`);
      if (el) el.remove();
    }, 3000);
  }

  // addBookToList - append a book row to the table
  addBookToList(book) {
    const list = document.getElementById('book-list');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>${book.isbn}</td>
      <td><a href="#" class="delete">X<a></td>
    `;
    list.appendChild(row);
  }
}

const ui = new UI();

function setAuthUI(authenticated) {
  const authSection = document.getElementById('auth-section');
  const booksSection = document.getElementById('books-section');
  if (authenticated) {
    if (authSection) authSection.style.display = 'none';
    if (booksSection) booksSection.style.display = '';
  } else {
    if (authSection) authSection.style.display = '';
    if (booksSection) booksSection.style.display = 'none';
  }
}

function setAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = msg || '';
}

async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  setToken(data.token);
  return data.user;
}

async function signup(name, email, password) {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Signup failed');
  setToken(data.token);
  return data.user;
}

async function fetchBooks() {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/books`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error('Unauthorized');
  const data = await res.json();
  return data;
}

async function createBook({ title, author, isbn }) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, author, isbn }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create book');
  return data;
}

function renderBooks(books) {
  const list = document.getElementById('book-list');
  if (!list) return;
  list.innerHTML = '';
  books.forEach((b) => ui.addBookToList(b));
}

function initAuthFormToggles() {
  const showSignup = document.getElementById('show-signup');
  const showLogin = document.getElementById('show-login');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  if (showSignup) {
    showSignup.addEventListener('click', (e) => {
      e.preventDefault();
      if (loginForm) loginForm.style.display = 'none';
      if (signupForm) signupForm.style.display = '';
      setAuthError('');
    });
  }
  if (showLogin) {
    showLogin.addEventListener('click', (e) => {
      e.preventDefault();
      if (signupForm) signupForm.style.display = 'none';
      if (loginForm) loginForm.style.display = '';
      setAuthError('');
    });
  }
}

function initEventHandlers() {
  initAuthFormToggles();

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      setAuthError('');
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      try {
        await login(email, password);
        setAuthUI(true);
        const books = await fetchBooks();
        renderBooks(books);
      } catch (err) {
        setAuthError(err.message);
      }
    });
  }

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      setAuthError('');
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      try {
        await signup(name, email, password);
        setAuthUI(true);
        const books = await fetchBooks();
        renderBooks(books);
      } catch (err) {
        setAuthError(err.message);
      }
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearToken();
      setAuthUI(false);
      const list = document.getElementById('book-list');
      if (list) list.innerHTML = '';
    });
  }

  const bookForm = document.querySelector('#book-form');
  if (bookForm) {
    bookForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const title = document.querySelector('#title').value.trim();
      const author = document.querySelector('#author').value.trim();
      const isbn = document.querySelector('#isbn').value.trim();

      if (title === '') {
        ui.showAlert('Please fill title field', 'error', 'title');
        return;
      } else if (author === '') {
        ui.showAlert('Please fill  author field', 'error', 'author');
        return;
      } else if (isbn === '') {
        ui.showAlert('Please fill isbn field', 'error', 'isbn');
        return;
      }

      try {
        const created = await createBook({ title, author, isbn });
        ui.addBookToList(created);
        // reset inputs
        document.querySelector('#title').value = '';
        document.querySelector('#author').value = '';
        document.querySelector('#isbn').value = '';
      } catch (err) {
        alert(err.message);
      }
    });
  }
}

// Boot
window.addEventListener('DOMContentLoaded', async () => {
  initEventHandlers();
  const token = getToken();
  if (token) {
    setAuthUI(true);
    try {
      const books = await fetchBooks();
      renderBooks(books);
    } catch (err) {
      // token likely invalid
      clearToken();
      setAuthUI(false);
    }
  } else {
    setAuthUI(false);
  }
});
