// Tab switching logic
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

loginTab.onclick = () => {
  loginTab.classList.add('active');
  signupTab.classList.remove('active');
  loginForm.classList.add('visible');
  signupForm.classList.remove('visible');
};
signupTab.onclick = () => {
  signupTab.classList.add('active');
  loginTab.classList.remove('active');
  signupForm.classList.add('visible');
  loginForm.classList.remove('visible');
};

// Password match indicator for signup
const pass1 = document.getElementById('signup-password');
const pass2 = document.getElementById('signup-password2');
const matchStatus = document.getElementById('password-match-status');

function checkMatch() {
  if (pass2.value.length === 0) {
    matchStatus.textContent = '';
    matchStatus.className = '';
    return;
  }
  if (pass1.value === pass2.value) {
    matchStatus.textContent = '✓';
    matchStatus.className = 'match';
  } else {
    matchStatus.textContent = '✗';
    matchStatus.className = '';
  }
}

pass1.oninput = checkMatch;
pass2.oninput = checkMatch;

// Demo form submit handling (shows message only, no real auth)
loginForm.onsubmit = function(e) {
  e.preventDefault();
  document.getElementById('login-message').textContent = "Demo: Log In clicked!";
  setTimeout(() => {
    document.getElementById('login-message').textContent = "";
  }, 2000);
};
signupForm.onsubmit = function(e) {
  e.preventDefault();
  if(pass1.value !== pass2.value) {
    document.getElementById('signup-message').textContent = "Passwords do not match!";
    return;
  }
  document.getElementById('signup-message').textContent = "Demo: Sign Up clicked!";
  setTimeout(() => {
    document.getElementById('signup-message').textContent = "";
  }, 2000);
};

// landing page after login/signup
document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();
  window.location.href = 'landing.html'; // Redirect to landing page
});