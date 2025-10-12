document.addEventListener('DOMContentLoaded', function () {
  const startBtn = document.getElementById('start-btn');
  const quizForm = document.getElementById('quiz-form');
  const timerDisplay = document.getElementById('timer');
  const quizResult = document.getElementById('quiz-result');
  const allInputs = quizForm.querySelectorAll('input[type="radio"]');
  const submitBtn = document.getElementById('submit-btn');

  let timerInterval = null;
  let timer = 0;
  let quizEnded = false;

  function lockQuiz() {
    allInputs.forEach(input => input.disabled = true);
    submitBtn.disabled = true;
  }

  startBtn.addEventListener('click', function () {
    startBtn.style.display = 'none';
    quizForm.style.display = 'flex';
    timerDisplay.style.display = 'block';
    quizResult.textContent = "";
    timer = 60 * 1; // 2 minutes
    quizEnded = false;
    allInputs.forEach(input => input.disabled = false);
    submitBtn.disabled = false;
    startTimer();
  });

  function startTimer() {
    updateTimerDisplay(timer);
    timerInterval = setInterval(function () {
      timer--;
      updateTimerDisplay(timer);

      if (timer < 0) {
        clearInterval(timerInterval);
        timerDisplay.textContent = "Time's up!";
        quizEnded = true;
        lockQuiz();
        gradeQuiz(true);
      }
    }, 1000);
  }

  function updateTimerDisplay(time) {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    timerDisplay.textContent = minutes + ":" + seconds;
  }

  function gradeQuiz(autoSubmitted = false) {
    if (timerInterval) clearInterval(timerInterval);
    lockQuiz();

    let score = 0;
    const answers = {
      q1: 'manila',
      q2: 'filipino'
    };
    let total = Object.keys(answers).length;

    for (let q in answers) {
      const selected = quizForm.querySelector(`input[name="${q}"]:checked`);
      if (selected && selected.value === answers[q]) score++;
    }

    let msg = "";

    if (!quizForm.querySelector('input[name="q1"]:checked') ||
        !quizForm.querySelector('input[name="q2"]:checked')) {
      if (autoSubmitted) {
        msg = "Tapós na ang oras! Awtomatikong naisumite ang pagsusulit.";
      } else {
        msg = "Sagutin lahat ng katanungan.";
      }
      quizResult.style.color = "red";
    } else if (score === total) {
      msg = "Tama lahat! 🎉";
      quizResult.style.color = "#1976d2";
    } else {
      msg = `Nakuha mo ang ${score}/${total} tamang sagot.`;
      quizResult.style.color = "#00daef";
    }

    // Always show the score, even if not all answered
    msg += `<br><b>Score: ${score} / ${total}</b>`;
    quizResult.innerHTML = msg;
  }

  quizForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (quizEnded) return;
    quizEnded = true;
    gradeQuiz(false);
  });
});

// Prevent back navigation
history.pushState(null, null, location.href);
window.onpopstate = function () {
  // If the user tries to go back, push them forward again
  history.go(1);

  // Optionally, show a warning (customize message as needed)
  alert("You cannot go back during the exam.");
};

<script>
window.addEventListener('load', function() {
  var crossword = document.querySelector('.crossword-wrapper');
  if (crossword) {
    crossword.scrollIntoView({behavior: "smooth"});
  }
});
</script>
