// Initialize Supabase Client
const supabase = supabase.createClient(
  'https://sinrkmzacjqcdsvyzgpv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbnJrbXphY2pxY2Rzdnl6Z3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDc3MDAsImV4cCI6MjA3MzU4MzcwMH0.X1Drl69l6IkaV518F382-KJEE1z81PiaC-O7GK7pGqs'
);

// DOM References
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const quizContainer = document.getElementById('quiz-container');
const questionArea = document.getElementById('question-area');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const resultDisplay = document.getElementById('quiz-result');
const quizForm = document.getElementById('multiple-choice-quiz'); // Fix for `quizForm`

// Timer Variables
let timer = 2 * 60; // 2 minutes in seconds
let timerInterval;
let timeUp = false;

// Quiz Variables
let questions = [];
let userAnswers = [];
let currentQuestionIndex = 0;

// Timer Functions
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
      submitQuiz();
    }
  }, 1000);
}

// Fetch Questions from Supabase
async function fetchQuestionsFromSupabase() {
  const { data, error } = await supabase
    .from('Aralin1_Quiz2') // Ensure this table exists in Supabase
    .select('id, question_text, choices, correct_answer');

  if (error) {
    console.error("Error fetching questions:", error.message);
    alert("Failed to fetch questions. Please try again.");
    return [];
  }

  // Map and return formatted data
  return data.map(q => ({
    id: q.id,
    q: q.question_text,
    choices: Object.entries(JSON.parse(q.choices)).map(([key, value]) => `${key}. ${value}`),
  }));
}

// Render Questions
function showQuestion(index) {
  const qData = questions[index];
  currentQuestionIndex = index;

  let html = `
    <p><strong>${index + 1}. ${qData.q}</strong></p>
    <div>`;
  for (let i = 0; i < qData.choices.length; i++) {
    const val = qData.choices[i][0];
    const checked = userAnswers[index] === val ? 'checked' : '';
    html += `
      <label>
        <input type="radio" name="q${index + 1}" value="${val}" ${checked}>
        ${qData.choices[i]}
      </label>`;
  }
  html += '</div>';
  questionArea.innerHTML = html;

  prevBtn.style.display = index > 0 ? "inline-block" : "none";
  nextBtn.style.display = index < questions.length - 1 ? "inline-block" : "none";
  submitBtn.style.display = index === questions.length - 1 ? "inline-block" : "none";

  const radios = questionArea.querySelectorAll('input[type="radio"]');
  nextBtn.disabled = !userAnswers[index];
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      userAnswers[index] = radio.value;
      nextBtn.disabled = false;
    });
  });
}

// Start Quiz
startBtn.onclick = async function () {
  console.log("Starting quiz...");
  startBtn.disabled = true;

  questions = await fetchQuestionsFromSupabase();
  if (questions.length === 0) return;

  userAnswers = Array(questions.length).fill("");
  startBtn.style.display = "none";
  quizContainer.style.display = "block";
  startTimer();
  showQuestion(0);
};

// Submit Quiz
quizForm.onsubmit = function (event) {
  event.preventDefault();
  submitQuiz();
};
