// lock-aralin.js
document.addEventListener('DOMContentLoaded', function () {
  var lockedLink = document.getElementById('locked-aralin-link');
  if (!lockedLink) return;

  // Modal elements
  var modal = document.getElementById('passwordModal');
  var closeModal = document.getElementById('closeModal');
  var submitBtn = document.getElementById('submitPassword');
  var passwordInput = document.getElementById('passwordInput');
  var passwordError = document.getElementById('passwordError');

  // Show modal when locked link is clicked
  lockedLink.addEventListener('click', function(event) {
    event.preventDefault();
    passwordInput.value = '';
    passwordError.textContent = '';
    modal.style.display = "block";
    passwordInput.focus();
  });

  // Close modal
  closeModal.onclick = function() { modal.style.display = "none"; };
  window.onclick = function(event) { if (event.target == modal) modal.style.display = "none"; };

  // Handle submit
  function tryUnlock() {
    var password = passwordInput.value;
    if (password === "1234") { // <-- Change YOUR_PASSWORD to your actual password!
      modal.style.display = "none";
      window.location.href = "Pangalawangaralin.html";
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
});