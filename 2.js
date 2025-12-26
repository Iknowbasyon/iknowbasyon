// ... your DOM and tab switching code (as you have)
const supabaseUrl = 'https://sinrkmzacjqcdsvyzgpv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbnJrbXphY2pxY2Rzdnl6Z3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDc3MDAsImV4cCI6MjA3MzU4MzcwMH0.X1Drl69l6IkaV518F382-KJEE1z81PiaC-O7GK7pGqs';
const supa = window.supabase.createClient(supabaseUrl, supabaseKey); // <-- use window.supabase

// Now you can safely use "supa" for auth
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

loginForm.onsubmit = async function(e) {
  e.preventDefault();
  document.getElementById('login-message').textContent = "Logging in...";
  const { error } = await supa.auth.signInWithPassword({
    email: document.getElementById('login-email').value,
    password: document.getElementById('login-password').value,
  });
  if (error) {
    document.getElementById('login-message').textContent = error.message;
  } else {
    document.getElementById('login-message').textContent = "Logged in!";
    // Or: window.location.href = "landing.html";
  }
};
signupForm.onsubmit = async function(e) {
  e.preventDefault();
  document.getElementById('signup-message').textContent = "";
  if(pass1.value !== pass2.value) {
    document.getElementById('signup-message').textContent = "Passwords do not match!";
    return;
  }
  document.getElementById('signup-message').textContent = "Signing up...";
  const { error } = await supa.auth.signUp({
    email: document.getElementById('signup-email').value,
    password: pass1.value,
  });
  if (error) {
    document.getElementById('signup-message').textContent = error.message;
  } else {
    document.getElementById('signup-message').textContent = "Signed up! Check your email.";
    // Optionally clear the form fields here
  }
};
// landing page after login/signup
document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();
  window.location.href = 'landing.html'; // Redirect to landing page
});
