import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase (same as 2-data.js)
const supabaseUrl = 'https://sinrkmzacjqcdsvyzgpv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbnJrbXphY2pxY2Rzdnl6Z3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDc3MDAsImV4cCI6MjA3MzU4MzcwMH0.X1Drl69l6IkaV518F382-KJEE1z81PiaC-O7GK7pGqs';
const supabase = createClient(supabaseUrl, supabaseKey);

const aralins = [
  { name: 'Unang Aralin', number: 1 },
  { name: 'Pangalawang Aralin', number:  2 },
  { name: 'Pangatlong Aralin', number: 3 },
  { name: 'Pang-apat na Aralin', number: 4 }
];

let unlockedAralins = [];

// Check if user is admin
const isAdmin = localStorage.getItem('isAdmin') === 'true';
const adminEmail = localStorage.getItem('adminEmail');

if (!isAdmin) {
  alert('⛔ Admin access only!');
  window.location. href = '/iknowbasyon/landing/landing.html';
} else {
  console.log('👑 Admin panel accessed by:', adminEmail);
  // Display admin email
  const adminEmailDisplay = document.getElementById('adminEmailDisplay');
  if (adminEmailDisplay) {
    adminEmailDisplay.textContent = adminEmail || 'Unknown';
  }
}

// Load unlocked aralins
async function loadUnlockedAralins() {
  try {
    const { data, error } = await supabase
      .from('aralin_global_unlock')
      .select('aralin');
    
    if (error) throw error;
    
    unlockedAralins = data. map(item => item.aralin);
    console.log('📖 Loaded unlocked aralins:', unlockedAralins);
    renderAralins();
  } catch (error) {
    console.error('❌ Error loading unlocked aralins:', error);
    document.getElementById('aralinList').innerHTML = `
      <div class="error">
        <strong>❌ Error loading data</strong>
        <p style="margin-top: 8px;">${error.message}</p>
        <p style="margin-top:  8px; font-size: 0.9em;">Please check your Supabase configuration and table name.</p>
      </div>
    `;
  }
}

// Render aralin list
function renderAralins() {
  const container = document.getElementById('aralinList');
  container.innerHTML = '';
  
  aralins.forEach(aralin => {
    const isUnlocked = unlockedAralins.includes(aralin. number);
    
    const item = document.createElement('div');
    item.className = `aralin-item ${isUnlocked ?  'unlocked' : 'locked'}`;
    
    item.innerHTML = `
      <div class="aralin-info">
        <h3>${aralin. name}</h3>
        <span class="status ${isUnlocked ? 'unlocked' :  'locked'}">
          ${isUnlocked ? '🔓 Unlocked' :  '🔒 Locked'}
        </span>
      </div>
      <button class="${isUnlocked ? 'lock-btn' : 'unlock-btn'}" 
              onclick="toggleAralin(${aralin.number}, ${isUnlocked})">
        ${isUnlocked ? '🔒 Lock' : '🔓 Unlock'}
      </button>
    `;
    
    container.appendChild(item);
  });
}

// Toggle aralin lock/unlock
window.toggleAralin = async function(aralinNumber, isCurrentlyUnlocked) {
  try {
    if (isCurrentlyUnlocked) {
      // Lock the aralin (delete from database)
      const { error } = await supabase
        .from('aralin_global_unlock')
        .delete()
        .eq('aralin', aralinNumber);
      
      if (error) throw error;
      
      console.log(`🔒 Locked Aralin ${aralinNumber} for all users`);
      alert(`✅ Aralin ${aralinNumber} is now LOCKED for all students`);
    } else {
      // Unlock the aralin (insert into database)
      const { error } = await supabase
        .from('aralin_global_unlock')
        .insert({ 
          aralin: aralinNumber,
          unlocked_by: adminEmail || 'Admin'
        });
      
      if (error) throw error;
      
      console.log(`🔓 Unlocked Aralin ${aralinNumber} for all users`);
      alert(`✅ Aralin ${aralinNumber} is now UNLOCKED for all students! `);
    }
    
    // Reload the list
    await loadUnlockedAralins();
  } catch (error) {
    console.error('❌ Error toggling aralin:', error);
    alert(`❌ Failed to update aralin:  ${error.message}`);
  }
};

// Initialize

loadUnlockedAralins();
