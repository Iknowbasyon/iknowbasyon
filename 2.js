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

// Login form submit handling: Redirect to landing page after login
loginForm.onsubmit = function(e) {
  e.preventDefault();
  window.location.href = '/iknowbasyon/landing/landing.html';
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
