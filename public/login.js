async function onLogin(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      document.getElementById('error').textContent = data.error || 'Login failed';
      return;
    }

    localStorage.setItem('token', data.token);
    window.location.href = '/';
  } catch (err) {
    console.error(err);
    document.getElementById('error').textContent = 'Server error';
  }
}

function setup() {
  if (localStorage.getItem('token')) {
    window.location.href = '/';
    return;
  }
  document.getElementById('login-form').addEventListener('submit', onLogin);
}

window.addEventListener('DOMContentLoaded', setup);
