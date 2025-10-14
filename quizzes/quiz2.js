// Quiz2.js

const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const quizContainer = document.getElementById('quiz-container');
const quizForm = document.getElementById('multiple-choice-quiz');
const questionArea = document.getElementById('question-area');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
let timer = 2 * 60; // 2 minutes in seconds
let timerInterval;
let timeUp = false;
let currentQuestionIndex = 0;

// Quiz data
const questions = [
  {
    q: "Alin sa mga sumusunod ang katangian ng estruktura ng akademikong teksto?",
    choices: [
      "A. May simula, gitna, at wakas",
      "B. Walang malinaw na pagkakaayos",
      "C. Masining na pagsasalaysay",
      "D. Naglalaman ng dayalogo"
    ]
  },
  {
    q: "Kapag ang layunin ay magpabatid ng impormasyon, ang tono ng teksto ay dapat:",
    choices: [
      "A. Pormal at malinaw",
      "B. Nakakatawa at pabiro",
      "C. Masining at matalinghaga",
      "D. Pabago-bago"
    ]
  },
  {
    q: "Ang “multimodal na teksto” ay tumutukoy sa tekstong gumagamit ng:",
    choices: [
      "A. Iisang anyo lamang",
      "B. Lahat ng uri ng wika",
      "C. Kombinasyon ng wika, imahe, tunog, at kilos",
      "D. Pormal na pagsasalita lamang"
    ]
  },
  {
    q: "Alin sa mga sumusunod ang halimbawa ng teknikal na teksto?",
    choices: [
      "A. Nobela",
      "B. Tula",
      "C. Manwal ng makina",
      "D. Maikling kwento"
    ]
  },
  {
    q: "Ang wika sa isang akademikong sulatin ay dapat na:",
    choices: [
      "A. Kolokyal",
      "B. Pormal",
      "C. Balbal",
      "D. Emosyonal"
    ]
  },
  {
    q: "Sa kontekstong akademiko, ano ang pinakamahalagang sangkap ng nilalaman?",
    choices: [
      "A. Opinyon",
      "B. Datos at ebidensya",
      "C. Kwento ng personal na karanasan",
      "D. Makatang salita"
    ]
  },
  {
    q: "Anong uri ng teksto ang gumagamit ng balangkas tulad ng panimula, katawan, at kongklusyon?",
    choices: [
      "A. Liham",
      "B. Sanaysay",
      "C. Kwento",
      "D. Komiks"
    ]
  },
  {
    q: "Alin ang hindi layunin ng akademikong teksto?",
    choices: [
      "A. Magpaliwanag",
      "B. Magsalaysay ng kathang-isip",
      "C. Mag-analisa",
      "D. Maglahad ng ebidensya"
    ]
  },
  {
    q: "Sa pagsulat ng teknikal na teksto, mahalagang isaalang-alang ang awdyens upang:",
    choices: [
      "A. Mapahanga sila",
      "B. Magamit ang tamang jargon o termino",
      "C. Makapagsulat ng mahaba",
      "D. Maipakita ang damdamin ng manunulat"
    ]
  },
  {
    q: "Aling anyo ng teksto ang mas epektibo sa pagpapaliwanag ng prosesong siyentipiko?",
    choices: [
      "A. Balita",
      "B. Sanaysay na masining",
      "C. Ulat teknikal",
      "D. Kwento ng karanasan"
    ]
  }
];

const answers = [
  "A", // 1
  "A", // 2
  "C", // 3
  "C", // 4
  "B", // 5
  "B", // 6
  "B", // 7
  "B", // 8
  "B", // 9
  "C"  // 10
];

let userAnswers = Array(questions.length).fill("");

// Initial UI state
timerDisplay.textContent = "Time left: 02:00";
timerDisplay.style.display = "none";
quizContainer.style.display = "none";

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
}

function unblockBackButton() {
  window.onpopstate = null;
  if (history.state && history.state.quiz) {
    history.replaceState(null, "", location.href);
  }
}

startBtn.onclick = function() {
  startBtn.style.display = "none";
  timerDisplay.style.display = "block";
  quizContainer.style.display = "block";
  showQuestion(0);
  startTimer();
  blockBackButton();
};

function showQuestion(index) {
  currentQuestionIndex = index;
  const qData = questions[index];

  if (!qData) {
    questionArea.innerHTML = "<div>Walang tanong.</div>";
    return;
  }

  let html = `<div class="quiz-question-card">
    <span class="question-number">${index + 1}.</span>
    <span class="question-text">${qData.q}</span>
    <div class="choices-group">`;

  for (let i = 0; i < qData.choices.length; i++) {
    const val = qData.choices[i][0]; // A/B/C/D
    const checked = userAnswers[index] === val ? "checked" : "";
    html += `<label><input type="radio" name="q${index+1}" value="${val}" required ${checked}> ${qData.choices[i]}</label>`;
  }
  html += `</div></div>`;
  questionArea.innerHTML = html;

  // Navigation buttons
  prevBtn.style.display = index > 0 ? "inline-block" : "none";
  nextBtn.style.display = index < questions.length - 1 ? "inline-block" : "none";
  submitBtn.style.display = index === questions.length - 1 ? "inline-block" : "none";

  // Disable next until answered
  const radios = questionArea.querySelectorAll(`input[type=radio][name=q${index+1}]`);
  nextBtn.disabled = userAnswers[index] === "";

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      userAnswers[index] = radio.value;
      nextBtn.disabled = false;
    });
  });
}

// Navigation
prevBtn.onclick = function() {
  if (currentQuestionIndex > 0) showQuestion(currentQuestionIndex - 1);
};
nextBtn.onclick = function() {
  const radios = questionArea.querySelectorAll(`input[type=radio][name=q${currentQuestionIndex+1}]`);
  let answered = false;
  radios.forEach(radio => {
    if (radio.checked) {
      userAnswers[currentQuestionIndex] = radio.value;
      answered = true;
    }
  });
  if (!answered) {
    nextBtn.disabled = true;
    return;
  }
  if (currentQuestionIndex < questions.length - 1) showQuestion(currentQuestionIndex + 1);
};
nextBtn.disabled = true; // Disable next if nothing is selected

quizForm.onsubmit = function(event) {
  event.preventDefault();
  if (timerInterval) clearInterval(timerInterval);

  let score = 0;
  let unanswered = false;

  for (let i = 0; i < questions.length; i++) {
    if (!userAnswers[i]) unanswered = true;
    if (userAnswers[i] === answers[i]) score++;
  }

  // Time taken
  const timeTaken = 2 * 60 - Math.max(timer, 0);
  const minutes = String(Math.floor(timeTaken / 60)).padStart(2, '0');
  const seconds = String(timeTaken % 60).padStart(2, '0');

  // Display results
  const result = document.getElementById('quiz-result');
  if (!timeUp && unanswered) {
    result.textContent = "Pakisagutan lahat ng tanong bago isumite.";
    result.style.color = "red";
  } else {
    result.textContent = `Nakuha mo ang ${score} sa 10! Oras: ${minutes}:${seconds}`;
    result.style.color = "#00daef";
  }
  prevBtn.disabled = true;
  nextBtn.disabled = true;
  submitBtn.disabled = true;
  questionArea.querySelectorAll("input[type=radio]").forEach(r => r.disabled = true);

  unblockBackButton();
};
