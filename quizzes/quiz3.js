const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const quizContainer = document.getElementById('quiz-container');
const quizForm = document.getElementById('tama-mali-quiz');
let timer = 2 * 60; // 2 minutes in seconds
let timerInterval;
let timeUp = false;

// Initial UI state
timerDisplay.textContent = "Time left: 02:00";
timerDisplay.style.display = "none";
quizContainer.style.display = "none";

// Start button click handler
startBtn.onclick = function() {
  startBtn.style.display = "none";
  timerDisplay.style.display = "block";
  quizContainer.style.display = "block";
  startTimer();
};

function updateTimerDisplay() {
  const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
  const seconds = String(timer % 60).padStart(2, '0');
  timerDisplay.textContent = `Time left: ${minutes}:${seconds}`;
}

function startTimer() {
  timer = 2 * 60;
  timeUp = false;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timer--;
    updateTimerDisplay();
    if (timer < 0) {
      clearInterval(timerInterval);
      timerDisplay.textContent = "Time's up!";
      timeUp = true; // Mark that time expired
      quizForm.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  }, 1000);
}

// Handle quiz submission
quizForm.onsubmit = function(event) {
  event.preventDefault();
  if (timerInterval) clearInterval(timerInterval);

  // Array of correct answers (Tama/Mali, must match value in HTML)
  const answers = [
    "Tama",  // 1
    "Tama",  // 2
    "Tama",  // 3
    "Mali",  // 4
    "Tama",  // 5
    "Tama",  // 6
    "Mali",  // 7
    "Tama",  // 8
    "Tama",  // 9
    "Tama",  // 10
  ];

  let score = 0;
  let unanswered = false;
  for (let i = 0; i < 10; i++) {
    const radios = document.getElementsByName('q' + (i + 1));
    let answered = false;
    let selectedValue = "";
    for (const radio of radios) {
      if (radio.checked) {
        answered = true;
        selectedValue = radio.value;
        break;
      }
    }
    if (!answered) unanswered = true;
    if (selectedValue === answers[i]) score++;
    // Disable radio buttons after submit
    for (const radio of radios) radio.disabled = true;
  }

  // Time taken
  const timeTaken = 2 * 60 - Math.max(timer, 0);
  const minutes = String(Math.floor(timeTaken / 60)).padStart(2, '0');
  const seconds = String(timeTaken % 60).padStart(2, '0');

  // Display results
  const result = document.getElementById('quiz-result');
  if (!timeUp && unanswered) {
    // Manual submit with blanks
    result.textContent = "Pakisagutan lahat ng tanong bago isumite.";
    result.style.color = "red";
  } else {
    // Auto-submit or manual submit with all answered
    result.textContent = `Nakuha mo ang ${score} sa 10! Oras: ${minutes}:${seconds}`;
    result.style.color = "black";
  }
  document.querySelector(".submit-btn").disabled = true;
};

// Prevent back navigation
history.pushState(null, null, location.href);
window.onpopstate = function () {
  // If the user tries to go back, push them forward again
  history.go(1);

  // Optionally, show a warning (customize message as needed)
  alert("You cannot go back during the exam.");
};