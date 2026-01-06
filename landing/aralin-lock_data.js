import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase (use same credentials as 2-data.js)
const supabaseUrl = 'https://sinrkmzacjqcdsvyzgpv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbnJrbXphY2pxY2Rzdnl6Z3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDc3MDAsImV4cCI6MjA3MzU4MzcwMH0.X1Drl69l6IkaV518F382-KJEE1z81PiaC-O7GK7pGqs';
const supabase = createClient(supabaseUrl, supabaseKey);

// Map each aralin to its password and redirect URL
const aralinConfig = {
  UnangAralin: {
    password:  "password1",
    url: "Unangaralin.html",
    number: 1
  },
  PangalawangAralin: {
    password: "password2",
    url: "Pangalawangaralin.html",
    number: 2
  },
  PangatlongAralin: {
    password: "password3",
    url: "Pangatlongaralin.html",
    number: 3
  },
  PangapatAralin: {
    password:  "password4",
    url:  "PangapatAralin.html",
    number: 4
  }
};

// Store globally unlocked aralins from Supabase
let globallyUnlockedAralins = [];

document.addEventListener('DOMContentLoaded', async function () {
  const links = document.querySelectorAll('.locked-aralin');
  const modal = document.getElementById('passwordModal');
  const closeModal = document.getElementById('closeModal');
  const submitBtn = document.getElementById('submitPassword');
  const passwordInput = document.getElementById('passwordInput');
  const passwordError = document.getElementById('passwordError');
  let currentAralin = null;

  // Check if user is admin (set by 2-data.js during login)
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const adminEmail = localStorage.getItem('adminEmail');
  
  if (isAdmin) {
    console.log('👑 Admin mode activated for:', adminEmail);
    // Show admin-only elements
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style. display = 'block';
    });
  } else {
    console.log('👤 Student mode');
  }

  // Fetch globally unlocked aralins from Supabase
  await fetchGloballyUnlockedAralins();

  // ===== ARALIN LOCK =====
  links.forEach(link => {
    link.addEventListener('click', async function(event) {
      event.preventDefault();
      currentAralin = link.getAttribute('data-aralin');
      
      const aralinNumber = aralinConfig[currentAralin]?.number;
      
      // Check if aralin is globally unlocked by admin
      if (globallyUnlockedAralins.includes(aralinNumber)) {
        console.log(`✅ ${currentAralin} (Aralin ${aralinNumber}) is unlocked by admin`);
        window.location.href = aralinConfig[currentAralin]. url;
        return;
      }
      
      // Show password modal if not unlocked
      passwordInput.value = '';
      passwordError.textContent = '';
      modal.style.display = "block";
      passwordInput.focus();
    });
  });

  closeModal.onclick = function() { modal.style.display = "none"; };
  window.onclick = function(event) { if (event.target == modal) modal.style.display = "none"; };

  function tryUnlock() {
    if (! currentAralin || !aralinConfig[currentAralin]) return;
    const password = passwordInput.value;
    if (password === aralinConfig[currentAralin].password) {
      modal.style.display = "none";
      window.location.href = aralinConfig[currentAralin].url;
    } else {
      passwordError.textContent = "Incorrect password!";
      passwordInput.value = '';
      passwordInput.focus();
    }
  }

  submitBtn.onclick = tryUnlock;
  passwordInput.addEventListener('keydown', function(e) {
    if (e.key === "Enter") tryUnlock();
  });

  // ===== ITALA LOCK - Only Admin Can Access =====
  const italaLink = document.getElementById('italaLink');
  if (italaLink) {
    italaLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      console.log('🔒 Itala access attempt');
      console.log('Is Admin:', isAdmin);
      
      if (isAdmin) {
        console.log('✅ Admin access granted to Itala');
        window.location.href = "record.html";
      } else {
        console.log('❌ Student - Itala access denied');
        alert("🔒 Only admins can access 'Itala'.\n\nPlease contact your teacher for access.");
      }
    });
  }

  // Update UI to show which aralins are unlocked
  updateAralinUI();
  
  // Set up real-time subscription for unlock changes
  subscribeToUnlockChanges();
});

// Fetch globally unlocked aralins from Supabase
async function fetchGloballyUnlockedAralins() {
  try {
    const { data, error } = await supabase
      .from('aralin_global_unlock')
      .select('aralin');
    
    if (error) {
      console.error('❌ Error fetching unlocked aralins:', error);
      return;
    }
    
    globallyUnlockedAralins = data. map(item => item.aralin);
    console.log('📖 Globally unlocked aralins:', globallyUnlockedAralins);
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Update UI to show unlocked aralins
function updateAralinUI() {
  const links = document.querySelectorAll('.locked-aralin');
  
  links.forEach(link => {
    const aralin = link.getAttribute('data-aralin');
    const aralinNumber = aralinConfig[aralin]?.number;
    
    // Remove any existing badges first
    const existingBadge = link.querySelector('.unlock-badge');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Reset styles first
    link.style.background = '';
    link.style.border = '';
    link.style. padding = '';
    link.style. borderRadius = '';
    
    if (globallyUnlockedAralins.includes(aralinNumber)) {
      // Add unlocked styling
      link.style.background = 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)';
      link.style.border = '2px solid #28a745';
      link.style.borderRadius = '8px';
      link.style.padding = '8px 12px';
      link.style. marginBottom = '5px';
      
      // Add unlocked badge
      const badge = document.createElement('span');
      badge.className = 'unlock-badge';
      badge.innerHTML = ' 🔓';
      badge.style.color = '#28a745';
      badge. style.fontWeight = 'bold';
      badge.style.marginLeft = '8px';
      link.appendChild(badge);
    }
  });
}

// Subscribe to real-time changes (so students see unlocks instantly)
function subscribeToUnlockChanges() {
  supabase
    .channel('aralin_unlocks')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'aralin_global_unlock' },
      async (payload) => {
        console.log('🔄 Unlock status changed:', payload);
        await fetchGloballyUnlockedAralins();
        updateAralinUI();
        
        // Show notification
        if (payload.eventType === 'INSERT') {
          console.log(`✅ Aralin ${payload.new.aralin} has been unlocked! `);
        } else if (payload.eventType === 'DELETE') {
          console.log(`🔒 Aralin ${payload.old.aralin} has been locked`);
        }
      }
    )
    .subscribe();
  
  console.log('📡 Real-time subscription active');
}