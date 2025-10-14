// Sidebar toggle (hamburger)
const menuBtn = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
  menuBtn.classList.toggle('open');
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.style.display = 'none';
  menuBtn.classList.remove('open');
});

// Dropdown toggling
function toggleDropdown(id, btn) {
  const list = document.getElementById(id);
  const isOpen = list.style.display === 'flex' || list.style.display === 'block';

  // Hide all dropdowns at the same level if you want only one open at a time
  if (btn.classList.contains('dropdown-btn')) {
    document.querySelectorAll('.dropdown-list').forEach(d => {
      if (d !== list) d.style.display = 'none';
    });
    document.querySelectorAll('.dropdown-btn').forEach(b => {
      if (b !== btn) b.classList.remove('active');
    });
  }
  if (btn.classList.contains('sub-dropdown-btn')) {
    btn.parentElement.parentElement.querySelectorAll('.sub-list').forEach(d => {
      if (d !== list) d.style.display = 'none';
    });
    btn.parentElement.parentElement.querySelectorAll('.sub-dropdown-btn').forEach(b => {
      if (b !== btn) b.classList.remove('active');
    });
  }

  if (!isOpen) {
    list.style.display = btn.classList.contains('dropdown-btn') ? 'flex' : 'block';
    btn.classList.add('active');
  } else {
    list.style.display = 'none';
    btn.classList.remove('active');
  }
}

// Page switching (for navigation)
function showPage(page) {
  document.querySelectorAll('.page-section').forEach(sec => sec.style.display = 'none');
  document.getElementById(page).style.display = '';
}

// Lesson switching (for quizzes)
function showLesson(lesson, quiz) {
  showPage('lesson');
  document.getElementById('lessonTitle').textContent = lesson;
  document.getElementById('quizTitle').textContent = quiz;
  document.getElementById('lessonContent').textContent = `Nilalaman para sa ${lesson} - ${quiz}.`;
}

document.getElementById('logout-btn').addEventListener('click', function() {
  // For demo purposes, just reload to show login/signup page
  window.location.href = "/iknowbasyon/main/index.html";
});
