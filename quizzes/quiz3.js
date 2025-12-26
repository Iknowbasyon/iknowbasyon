// quiz3.js -- One question at a time, Next/Prev, timer, disables back during quiz, restores after submit

const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const quizContainer = document.getElementById('quiz-container');
const quizForm = document.getElementById('tama-mali-quiz');
const questionCards = Array.from(document.querySelectorAll('.quiz-question-card'));
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const submitBtn = quizForm.querySelector('.submit-btn');
const resultDiv = document.getElementById('quiz-result');
const backBtn = document.querySelector('.back-btn');

let timer = 2 * 60;
let timerInterval;
let timeUp = false;
let currentIndex = 0;
let answered = Array(questionCards.length).fill("");

// Correct answers (update as needed)
const answers = [
  "Tama",  // 1
  "Tama",  // 2
  "Tama",  // 3
  "Mali",  // 4
  "Tama",  // 5
  "Tama",  // 6
  "Mali",  // 7
  "Tama",  // 8
  "Mali",  // 9
  "Tama",  // 10
];

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
      timeUp = true;
      quizForm.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  }, 1000);
}

function blockBackButton() {
  history.pushState({ quiz: true }, "", location.href);
  window.onpopstate = function () {
    history.go(1);
    alert("You cannot go back during the exam.");
  };
  backBtn.onclick = function () {
    alert("You cannot go back during the exam.");
  };
}

function unblockBackButton() {
  window.onpopstate = null;
  if (history.state && history.state.quiz) {
    history.replaceState(null, "", location.href);
  }
  backBtn.onclick = function () {
    window.history.back();
  };
}

function showQuestion(index) {
  questionCards.forEach((card, i) => {
    card.style.display = i === index ? "block" : "none";
    // Restore checked state if already answered
    const name = "q" + (i + 1);
    if (answered[i]) {
      const radios = card.querySelectorAll(`input[name="${name}"]`);
      radios.forEach(r => {
        r.checked = (r.value === answered[i]);
      });
    }
  });
  prevBtn.style.display = (index > 0) ? "inline-block" : "none";
  nextBtn.style.display = (index < questionCards.length - 1) ? "inline-block" : "none";
  submitBtn.style.display = (index === questionCards.length - 1) ? "inline-block" : "none";
  nextBtn.disabled = !answered[index];
}

function saveAnswer(idx) {
  const name = "q" + (idx + 1);
  const radios = questionCards[idx].querySelectorAll(`input[name="${name}"]`);
  radios.forEach(radio => {
    if (radio.checked) {
      answered[idx] = radio.value;
    }
  });
  nextBtn.disabled = !answered[idx];
}

// Set up event handlers for answer selection
questionCards.forEach((card, idx) => {
  const name = "q" + (idx + 1);
  const radios = card.querySelectorAll(`input[name="${name}"]`);
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      saveAnswer(idx);
    });
  });
});

prevBtn.onclick = function() {
  saveAnswer(currentIndex);
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion(currentIndex);
  }
};
nextBtn.onclick = function() {
  saveAnswer(currentIndex);
  if (!answered[currentIndex]) { nextBtn.disabled = true; return; }
  if (currentIndex < questionCards.length - 1) {
    currentIndex++;
    showQuestion(currentIndex);
  }
};
nextBtn.disabled = true;

startBtn.onclick = function() {
  startBtn.style.display = "none";
  timerDisplay.style.display = "block";
  quizContainer.style.display = "block";
  showQuestion(0);
  startTimer();
  blockBackButton();
  resultDiv.textContent = "";
  currentIndex = 0;
};

quizForm.onsubmit = function(event) {
  event.preventDefault();
  if (timerInterval) clearInterval(timerInterval);

  // Save last answer
  saveAnswer(currentIndex);

  let score = 0;
  let unansweredFlag = false;
  for (let i = 0; i < questionCards.length; i++) {
    if (!answered[i]) unansweredFlag = true;
    if (answered[i] === answers[i]) score++;
    // Disable radios
    const name = "q" + (i + 1);
    questionCards[i].querySelectorAll(`input[name="${name}"]`).forEach(r => r.disabled = true);
  }
  prevBtn.disabled = true;
  nextBtn.disabled = true;
  submitBtn.disabled = true;

  // Time taken
  const timeTaken = 2 * 60 - Math.max(timer, 0);
  const minutes = String(Math.floor(timeTaken / 60)).padStart(2, '0');
  const seconds = String(timeTaken % 60).padStart(2, '0');

  // Display results
  if (!timeUp && unansweredFlag) {
    resultDiv.textContent = "Pakisagutan lahat ng tanong bago isumite.";
    resultDiv.style.color = "red";
  } else {
    resultDiv.textContent = `Nakuha mo ang ${score} sa 10! Oras: ${minutes}:${seconds}`;
    resultDiv.style.color = "#00daef";
  }

  // Restore back button
  unblockBackButton();
};

// Initial UI state
timerDisplay.textContent = "Time left: 02:00";
timerDisplay.style.display = "none";
quizContainer.style.display = "none";
questionCards.forEach((card, i) => card.style.display = "none");
prevBtn.style.display = "none";
nextBtn.style.display = "none";
submitBtn.style.display = "none";
