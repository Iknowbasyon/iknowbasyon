document.addEventListener("DOMContentLoaded", function () {
  const proceedBtn = document.getElementById('proceed-btn');
  const timerDisplay = document.getElementById('timer');
  const startBtn = document.getElementById('start-btn');
  const quizContainer = document.getElementById('quiz-container');
  const readingSection = document.getElementById('reading-section');
  const quizDirections = document.getElementById('quiz-directions');
  const quizForm = document.getElementById('multiple-choice-quiz');
  const questionCards = Array.from(document.querySelectorAll('.quiz-question-card'));
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const submitBtn = document.querySelector('.submit-btn');
  const resultDiv = document.getElementById('quiz-result');


  let timer = 2 * 60; // 2 minutes in seconds
  let timerInterval;
  let timeUp = false;
  let currentIndex = 0;
  let answered = Array(questionCards.length).fill("");

  // Correct answers for each question (A/B/C/D)
  const answers = [
    "C", // 1
    "C", // 2
    "D", // 3
    "B", // 4
    "D"  // 5
  ];

  // Initial UI state
  timerDisplay.textContent = "Time left: 02:00";
  timerDisplay.style.display = "none";
  quizContainer.style.display = "none";
  quizDirections.style.display = "none";
  readingSection.style.display = "block";
  if (startBtn) startBtn.style.display = "block";

  // Optional: Start Quiz button hides itself and shows reading section
  if (startBtn) {
    startBtn.onclick = function () {
      startBtn.style.display = "none";
      readingSection.style.display = "block";
    };
  }

  // Proceed button (shows quiz)
  if (proceedBtn) {
    proceedBtn.onclick = function () {
      readingSection.style.display = "none";
      quizDirections.style.display = "block";
      timerDisplay.style.display = "block";
      quizContainer.style.display = "block";
      startTimer();
      showQuestion(0);
    };
  }

  // Show only the current question
  function showQuestion(idx) {
    questionCards.forEach((card, i) => card.style.display = i === idx ? "block" : "none");
    prevBtn.style.display = (idx > 0) ? "inline-block" : "none";
    nextBtn.style.display = (idx < questionCards.length - 1) ? "inline-block" : "none";
    submitBtn.style.display = (idx === questionCards.length - 1) ? "inline-block" : "none";
    // Restore checked radio if already answered
    const name = "q" + (idx + 1);
    const radios = questionCards[idx].querySelectorAll(`input[name="${name}"]`);
    radios.forEach(r => r.checked = (r.value === answered[idx]));
    nextBtn.disabled = !answered[idx] && (idx < questionCards.length - 1);
  }

  // Save answer for the current question
  function saveAnswer(idx) {
    const name = "q" + (idx + 1);
    const radios = questionCards[idx].querySelectorAll(`input[name="${name}"]`);
    radios.forEach(radio => {
      if (radio.checked) answered[idx] = radio.value;
    });
    nextBtn.disabled = !answered[idx];
  }

  // Attach radio change handler
  questionCards.forEach((card, idx) => {
    const name = "q" + (idx + 1);
    const radios = card.querySelectorAll(`input[name="${name}"]`);
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        saveAnswer(idx);
      });
    });
  });

  prevBtn.onclick = function () {
    saveAnswer(currentIndex);
    if (currentIndex > 0) {
      currentIndex--;
      showQuestion(currentIndex);
    }
  };
  nextBtn.onclick = function () {
    saveAnswer(currentIndex);
    if (!answered[currentIndex]) {
      nextBtn.disabled = true;
      return;
    }
    if (currentIndex < questionCards.length - 1) {
      currentIndex++;
      showQuestion(currentIndex);
    }
  };
  nextBtn.disabled = true;

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

  // Handle quiz submission
  quizForm.onsubmit = function (event) {
    event.preventDefault();
    if (timerInterval) clearInterval(timerInterval);

    // Save last answer
    saveAnswer(currentIndex);

    let score = 0;
    let unansweredFlag = false;
    for (let i = 0; i < answers.length; i++) {
      if (!answered[i]) unansweredFlag = true;
      if (answered[i] === answers[i]) score++;
      // Disable radio buttons after submit
      const radios = document.getElementsByName('q' + (i + 1));
      for (const radio of radios) radio.disabled = true;
      window.onpopstate = null;
    }

    // Time taken
    const timeTaken = 2 * 60 - Math.max(timer, 0);
    const minutes = String(Math.floor(timeTaken / 60)).padStart(2, '0');
    const seconds = String(timeTaken % 60).padStart(2, '0');

    // Display results
    if (!timeUp && unansweredFlag) {
      resultDiv.textContent = "Pakisagutan lahat ng tanong bago isumite.";
      resultDiv.style.color = "red";
    } else {
      resultDiv.textContent = `Nakuha mo ang ${score} sa ${answers.length}! Oras: ${minutes}:${seconds}`;
      resultDiv.style.color = "black";
    }
    submitBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  };

  // Prevent back navigation during quiz
  history.pushState(null, null, location.href);
  window.onpopstate = function () {
    history.go(1);
    alert("You cannot go back during the exam.");
  };
});
