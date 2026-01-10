// === INITIALIZE SUPABASE ===
const supabaseUrl = 'https://sinrkmzacjqcdsvyzgpv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbnJrbXphY2pxY2Rzdnl6Z3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDc3MDAsImV4cCI6MjA3MzU4MzcwMH0.X1Drl69l6IkaV518F382-KJEE1z81PiaC-O7GK7pGqs';

const supaLogin = window.supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'iknowbasyon-auth'
  }
});

console.log('✅ Supabase initialized for login page');

// === ADMIN EMAIL LIST ===
// ✅ Add admin emails here
const ADMIN_EMAILS = [
                                          // Main admin
  'msjamaicavicente@gmail.com',         // Add more admin emails as needed
  'ragnarokeneftee@gmail.com'      // Example:  another admin
];

// === CHECK IF USER IS ADMIN ===
function isAdmin(email) {
  return ADMIN_EMAILS.includes(email. toLowerCase().trim());
}

// === TAB SWITCHING ===
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

if (loginTab && signupTab && loginForm && signupForm) {
  loginTab.onclick = () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.classList. add('visible');
    signupForm.classList.remove('visible');
  };

  signupTab.onclick = () => {
    signupTab. classList.add('active');
    loginTab.classList.remove('active');
    signupForm.classList.add('visible');
    loginForm.classList.remove('visible');
  };
}

// === PASSWORD MATCH INDICATOR ===
const pass1 = document.getElementById('signup-password');
const pass2 = document. getElementById('signup-password2');
const matchStatus = document.getElementById('password-match-status');

function checkMatch() {
  if (!pass2 || !matchStatus) return;
  
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

if (pass1 && pass2) {
  pass1.oninput = checkMatch;
  pass2.oninput = checkMatch;
}

// === LOGIN FORM ===
if (loginForm) {
  loginForm.onsubmit = async function (e) {
    e.preventDefault();
    
    const loginMessage = document.getElementById('login-message');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    if (!emailInput || !passwordInput || !loginMessage) {
      console.error('❌ Form elements not found');
      return;
    }
    
    loginMessage.textContent = "Logging in...";
    loginMessage. style.color = 'black';

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    console.log('🔐 Attempting login for:', email);

    try {
      // Sign in with password
      const { data, error } = await supaLogin.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('❌ Login error:', error);
        loginMessage.textContent = error.message;
        loginMessage.style.color = 'red';
      } else {
        console.log('✅ Login successful! ', data);
        
        // ✅ Check if user is admin
        const userIsAdmin = isAdmin(email);
        
        if (userIsAdmin) {
          console.log('👑 Admin logged in!');
          loginMessage. textContent = "Admin login successful! Redirecting...";
          loginMessage.style.color = 'green';
          
          // ✅ Store admin status in localStorage
          localStorage.setItem('isAdmin', 'true');
          localStorage.setItem('adminEmail', email);
        } else {
          console.log('👤 Student logged in');
          loginMessage.textContent = "Logged in!  Redirecting...";
          loginMessage.style.color = 'green';
          
          // Clear admin status
          localStorage.removeItem('isAdmin');
          localStorage.removeItem('adminEmail');
        }
        
        // Wait for session to be saved, then redirect
        setTimeout(() => {
          window.location.href = '/iknowbasyon/landing/landing.html';
        }, 500);
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      loginMessage.textContent = `Login failed: ${err.message}`;
      loginMessage.style.color = 'red';
    }
  };
}

// === SIGNUP FORM ===
if (signupForm) {
  signupForm.onsubmit = async function(e) {
    e.preventDefault();
    
    const signupMessage = document.getElementById('signup-message');
    const emailInput = document.getElementById('signup-email');
    
    if (!emailInput || !pass1 || !pass2 || !signupMessage) {
      console.error('❌ Form elements not found');
      return;
    }
    
    signupMessage.textContent = "";
    
    if (pass1.value !== pass2.value) {
      signupMessage.textContent = "Passwords do not match! ";
      signupMessage.style.color = 'red';
      return;
    }
    
    if (pass1.value.length < 6) {
      signupMessage.textContent = "Password must be at least 6 characters!";
      signupMessage.style. color = 'red';
      return;
    }
    
    signupMessage.textContent = "Signing up...";
    signupMessage.style.color = 'black';
    
    const email = emailInput.value. trim();
    const password = pass1.value;
    
    console.log('📝 Attempting signup for:', email);
    
    try {
      const { data, error } = await supaLogin.auth.signUp({
        email: email,
        password: password,
      });
      
      if (error) {
        console.error('❌ Signup error:', error);
        signupMessage.textContent = error.message;
        signupMessage.style.color = 'red';
      } else {
        console.log('✅ Signup successful!', data);
        signupMessage.textContent = "Signed up! You can now log in.";
        signupMessage.style.color = 'green';
        
        // Clear form
        signupForm.reset();
        if (matchStatus) {
          matchStatus. textContent = '';
        }
        
        // Switch to login tab after 2 seconds
        setTimeout(() => {
          if (loginTab) {
            loginTab.click();
          }
        }, 2000);
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      signupMessage.textContent = `Signup failed: ${err.message}`;
      signupMessage.style.color = 'red';
    }
  };
}

// === EXPORT FOR OTHER FILES ===
window.supaLogin = supaLogin;
window.isAdmin = isAdmin;
window. ADMIN_EMAILS = ADMIN_EMAILS;


console.log('✅ Login page JavaScript fully loaded');


