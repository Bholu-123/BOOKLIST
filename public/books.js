function getToken() {
  return localStorage.getItem('token');
}

function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = '/login.html';
    return null;
  }
  return token;
}

async function loadBooks() {
  const token = requireAuth();
  if (!token) return;

  // toggle auth links
  document.getElementById('login-link').style.display = 'none';
  document.getElementById('signup-link').style.display = 'none';
  document.getElementById('logout-btn').style.display = 'inline-block';

  try {
    const res = await fetch('/api/books', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login.html';
      return;
    }
    const books = await res.json();

    const tbody = document.getElementById('book-list');
    tbody.innerHTML = '';
    for (const b of books) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${b.title}</td><td>${b.author}</td><td>${b.isbn}</td>`;
      tbody.appendChild(tr);
    }
  } catch (err) {
    console.error(err);
    document.getElementById('error').textContent = 'Failed to load books';
  }
}

async function onSubmit(e) {
  e.preventDefault();
  const token = requireAuth();
  if (!token) return;

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const isbn = document.getElementById('isbn').value.trim();

  if (!title || !author || !isbn) {
    document.getElementById('error').textContent = 'All fields are required';
    return;
  }

  try {
    const res = await fetch('/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, author, isbn }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      document.getElementById('error').textContent = data.error || 'Failed to add book';
      return;
    }

    // clear form
    document.getElementById('book-form').reset();
    document.getElementById('error').textContent = '';
    await loadBooks();
  } catch (err) {
    console.error(err);
    document.getElementById('error').textContent = 'Server error';
  }
}

function setup() {
  const form = document.getElementById('book-form');
  form.addEventListener('submit', onSubmit);

  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  });

  loadBooks();
}

window.addEventListener('DOMContentLoaded', setup);
