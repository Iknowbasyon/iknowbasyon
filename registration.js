document.getElementById('registrationForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const surname = document.getElementById('surname').value.trim();
  const section = document.getElementById('section').value.trim();

  // Basic front-end validation
  if (!firstName || !surname || !section) {
    showMessage("Please fill in all fields.", true);
    return;
  }
  if (password.length < 6) {
    showMessage("Password must be at least 6 characters.", true);
    return;
  }
  // Simulate registration (replace with backend/Supabase integration)
  showMessage("Registration successful!", false);
  document.getElementById('registrationForm').reset();
});

function showMessage(msg, isError) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = msg;
  messageDiv.style.color = isError ? '#e03a3a' : '#16b67a';
}