async function onSignup(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      document.getElementById('error').textContent = data.error || 'Signup failed';
      return;
    }

    // Auto-login using returned token
    if (data.token) {
      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } else {
      window.location.href = '/login.html';
    }
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
  document.getElementById('signup-form').addEventListener('submit', onSignup);
}

window.addEventListener('DOMContentLoaded', setup);
