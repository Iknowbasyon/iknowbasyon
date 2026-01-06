// === INITIALIZE SUPABASE ===
const SUPABASE_URL = 'https://sinrkmzacjqcdsvyzgpv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbnJrbXphY2pxY2Rzdnl6Z3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDc3MDAsImV4cCI6MjA3MzU4MzcwMH0.X1Drl69l6IkaV518F382-KJEE1z81PiaC-O7GK7pGqs';

const supaRecord = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'iknowbasyon-auth'
  }
});

console.log('✅ Supabase initialized for records page');

// === GLOBAL VARIABLES ===
let currentUser = null;
let quizRecords = [];

// Mapping object (aralin number as key, gawain number as subkey)
const gawainNames = {
  1: { 1: "Tuklas Kaalaman", 2: "Laro ng Talino", 3: "Sagot ko!     Panalo ako!" },
  2: { 1: "Balitaan mo ako!", 2: "Hibla ng Alaala", 3: "Tama o Tsamba" },
  3: { 1: "Salituklas", 2: "Kilatisin", 3: "Tumpak O Lagapak" },
  4: { 1: "I KNOW:     Teksto", 2: "Ubod ng Buod", 3: "Teksto ko, alamin mo!" }
};

// === CHECK AUTHENTICATION ===
async function checkAuth() {
  console.log('Checking authentication...');
  
  try {
    const { data: { session }, error } = await supaRecord. auth.getSession();
    
    if (error) {
      console.error('Session error:', error);
      redirectToLogin();
      return null;
    }
    
    if (!session || ! session.user) {
      console.log('No active session');
      redirectToLogin();
      return null;
    }
    
    currentUser = session.user;
    console.log('✅ User logged in:', currentUser.email);
    
    return currentUser;
    
  } catch (err) {
    console.error('Auth error:', err);
    redirectToLogin();
    return null;
  }
}

function redirectToLogin() {
  alert('Please login first to view your records.');
  window.location. href = 'iknowbasyon/index.html';
}

// === FETCH QUIZ RESULTS ===
async function fetchQuizResults() {
  if (!currentUser) {
    console.error('No user logged in');
    return [];
  }

  try {
    console.log('📚 Fetching quiz results for:', currentUser.email);
    
    // ✅ Check if current user is admin
    const userIsAdmin = localStorage.getItem('isAdmin') === 'true';
    
    let query = supaRecord
      .from('quiz_results')
      .select('*')
      .order('date_taken', { ascending: false });
    
    // ✅ If NOT admin, filter by current user's email
    if (!userIsAdmin) {
      console.log('👤 Student view - showing only own records');
      query = query. eq('user_email', currentUser.email);
    } else {
      console.log('👑 Admin view - showing ALL records');
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching quiz results:', error);
      showError('Failed to load quiz results.  Please refresh the page.');
      return [];
    }

    console.log(`✅ Fetched ${data?. length || 0} records`);

    if (! data || data.length === 0) {
      console.log('⚠️ No records found');
      return [];
    }

    // Transform data to match our format
    return data.map(record => ({
      id: record.id,
      username: record.user_email. split('@')[0],
      email: record.user_email,
      aralin: record.aralin,
      gawain: record.gawain,
      score: record.score,
      total:  record.total_questions,
      quiz_name: record.quiz_name || '',
      date:  new Date(record.date_taken).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    showError('An unexpected error occurred.');
    return [];
  }
}

// === SHOW ERROR MESSAGE ===
function showError(message) {
  const tbody = document.querySelector("#quizTable tbody");
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="color: #dc3545; text-align: center; padding: 20px;">
          <strong>⚠️ ${message}</strong>
        </td>
      </tr>
    `;
  }
}

// === RENDER TABLE ===
function renderTable(records) {
  const tbody = document.querySelector("#quizTable tbody");
  
  if (!tbody) {
    console.error('❌ Table body not found');
    return;
  }
  
  tbody. innerHTML = "";
  
  if (records.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #666; padding: 20px;">
          📝 No quiz records found.   Take a quiz to see your results here!
        </td>
      </tr>
    `;
    return;
  }

  records.forEach(record => {
    const tr = document.createElement('tr');
    const gawainName = gawainNames[record.aralin]?.[record.gawain] || `Gawain ${record.gawain}`;
    const percentage = ((record.score / record.total) * 100).toFixed(1);
    
    tr.innerHTML = `
      <td>${record.username}</td>
      <td>${record.email}</td>
      <td>Aralin ${record.aralin}</td>
      <td>${gawainName}</td>
      <td>${record.score}/${record.total} (${percentage}%)</td>
      <td>${record.date}</td>
    `;
    tbody.appendChild(tr);
  });
}

// === FILTER RECORDS ===
function filterRecords() {
  const aralinSelect = document.getElementById('aralinSelect');
  const gawainSelect = document.getElementById('gawainSelect');
  
  if (!aralinSelect || !gawainSelect) {
    console.error('❌ Filter elements not found');
    return quizRecords;
  }
  
  const aralinVal = aralinSelect.value;
  const gawainVal = gawainSelect.value;

  let filtered = quizRecords;

  // Filter by aralin (if selected)
  if (aralinVal) {
    filtered = filtered.filter(r => r.aralin == aralinVal);
  }

  // Filter by gawain (if selected)
  if (gawainVal) {
    filtered = filtered.filter(r => r.gawain == gawainVal);
  }

  console.log('Filtered records:', filtered);
  renderTable(filtered);
  
  // Return filtered data for export functionality
  return filtered;
}

// === EXPORT TO EXCEL ===
function exportToExcel() {
  console.log('📥 Export button clicked');
  
  // Check if XLSX library is loaded
  if (typeof XLSX === 'undefined') {
    alert('❌ Excel library not loaded!   Please refresh the page and try again.');
    console.error('XLSX library is not defined');
    return;
  }
  
  // Get currently filtered data
  const filtered = filterRecords();
  
  if (filtered.length === 0) {
    alert('No data to export!  ');
    return;
  }

  try {
    // Prepare data for Excel
    const excelData = filtered.map(record => {
      const percentage = ((record.score / record. total) * 100).toFixed(2);
      const gawainName = gawainNames[record.aralin]?.[record.gawain] || `Gawain ${record.gawain}`;
      
      return {
        'Username': record.username,
        'Email': record.email,
        'Aralin': `Aralin ${record.aralin}`,
        'Gawain': gawainName,
        'Quiz Name': record.quiz_name || gawainName,
        'Score': `${record.score}/${record. total}`,
        'Percentage': `${percentage}%`,
        'Date': record.date
      };
    });

    console.log('📋 Excel data prepared:', excelData);

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['! cols'] = [
      { wch:  15 }, // Username
      { wch:  30 }, // Email
      { wch: 12 }, // Aralin
      { wch: 25 }, // Gawain
      { wch: 30 }, // Quiz Name
      { wch: 15 }, // Score
      { wch: 12 }, // Percentage
      { wch: 20 }  // Date
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Quiz Records");

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const username = currentUser.email.split('@')[0];
    const filename = `Quiz_Records_${username}_${timestamp}.xlsx`;

    console.log(`💾 Saving file as: ${filename}`);

    // Download file
    XLSX.writeFile(wb, filename);
    
    console.log('✅ Excel file exported successfully!');
    alert('✅ Quiz records exported successfully!');
    
  } catch (error) {
    console.error('❌ Export error:', error);
    alert('❌ Failed to export file:  ' + error.message);
  }
}

// === CLEAR ALL RECORDS ===
async function clearAllRecords() {
  console.log('🗑️ Clear button clicked! ');
  
  const confirmDelete = confirm(
    '⚠️ Are you sure you want to DELETE all records?\n\nThis action CANNOT be undone!'
  );
  
  if (!confirmDelete) {
    console.log('Clear action cancelled');
    return;
  }

  if (!currentUser) {
    console.error('No user logged in');
    alert('Error: No user logged in');
    return;
  }

  try {
    console.log('🗑️ Starting delete process...');
    console.log('Current user:', currentUser.email);
    
    const userIsAdmin = localStorage.getItem('isAdmin') === 'true';
    console.log('User is admin:', userIsAdmin);
    
    // Build delete query
    let deleteQuery = supaRecord
      . from('quiz_results')
      .delete()
      .select();
    
    if (! userIsAdmin) {
      console.log('Deleting only own records for:', currentUser.email);
      deleteQuery = deleteQuery.eq('user_email', currentUser.email);
    } else {
      console.log('Deleting ALL records');
      deleteQuery = deleteQuery. gt('id', 0);
    }
    
    const { data, count, error, status } = await deleteQuery;
    
    console.log('🔍 Delete Response: ');
    console.log('- data:', data);
    console.log('- count:', count);
    console.log('- status:', status);
    console.log('- error:', error);
    
    if (error) {
      console.error('❌ Delete failed:', error);
      alert('❌ DELETE FAILED:\n\nStatus: ' + status + '\nError: ' + (error.message || JSON.stringify(error)));
      return;
    }
    
    // Get actual count from data
    const deletedCount = data ?  data.length : count || 0;
    console.log(`✅ Delete completed!  Deleted ${deletedCount} records`);
    
    // Clear local cache
    quizRecords = [];
    console.log('🧹 Local cache cleared');
    
    // Render empty table
    renderTable(quizRecords);
    
    // Reset filters
    const aralinSelect = document.getElementById('aralinSelect');
    const gawainSelect = document.getElementById('gawainSelect');
    if (aralinSelect) aralinSelect.value = '';
    if (gawainSelect) gawainSelect.value = '';
    
    alert(`✅ Successfully deleted ${deletedCount} records! `);
    
    // Verify deletion
    setTimeout(async () => {
      console. log('\n🔄 Verifying deletion.. .');
      quizRecords = await fetchQuizResults();
      console.log(`📊 Records remaining:  ${quizRecords.length}`);
      renderTable(quizRecords);
      
      if (quizRecords.length === 0) {
        console.log('✅ VERIFIED:  All records deleted! ');
      } else {
        console.warn('⚠️ WARNING: Some records still exist! ');
      }
    }, 1000);
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    alert('❌ ERROR:\n\n' + err.message);
  }
}

// === INITIALIZE PAGE ===
async function init() {
  console.log('🚀 Initializing quiz records page...');
  
  // Check if user is logged in
  const user = await checkAuth();
  
  if (user) {
    // ✅ Check if user is admin and show badge
    const userIsAdmin = localStorage. getItem('isAdmin') === 'true';
    
    if (userIsAdmin) {
      const header = document.querySelector('h2');
      if (header) {
        header.textContent += ' 👑 (Admin)';
      }
    }
    
    // Fetch quiz records
    quizRecords = await fetchQuizResults();
    console.log(`✅ Loaded ${quizRecords.length} records for ${user.email}`);
    
    // Display all records initially
    renderTable(quizRecords);
  }
}

// === EVENT LISTENERS ===
document. addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM loaded - attaching event listeners');
  
  init();
  
  // Dropdown filters
  const aralinSelect = document.getElementById('aralinSelect');
  const gawainSelect = document.getElementById('gawainSelect');
  const exportButton = document.getElementById('exportButton');
  const clearButton = document.getElementById('clear-records-btn');
  
  console.log('🔍 Looking for buttons: ');
  console.log('- aralinSelect:', aralinSelect ?  '✅ Found' : '❌ Not found');
  console.log('- gawainSelect:', gawainSelect ? '✅ Found' : '❌ Not found');
  console.log('- exportButton:', exportButton ? '✅ Found' : '❌ Not found');
  console.log('- clearButton:', clearButton ? '✅ Found' :  '❌ Not found');
  
  if (aralinSelect) {
    aralinSelect. addEventListener('change', filterRecords);
    console.log('✅ aralinSelect listener attached');
  }
  
  if (gawainSelect) {
    gawainSelect. addEventListener('change', filterRecords);
    console.log('✅ gawainSelect listener attached');
  }
  
  if (exportButton) {
    exportButton.addEventListener('click', exportToExcel);
    console.log('✅ exportButton listener attached');
  }
  
  if (clearButton) {
    clearButton.addEventListener('click', clearAllRecords);
    console.log('✅ clearButton listener attached');
  } else {
    console.error('❌ Clear button not found!  Make sure button ID is "clear-records-btn"');
  }

});
