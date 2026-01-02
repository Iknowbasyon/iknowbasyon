// Initialize Supabase Client
const supabase = supabase.createClient(
  'https://sinrkmzacjqcdsvyzgpv.supabase.co', // Replace with your Supabase Project URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbnJrbXphY2pxY2Rzdnl6Z3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDc3MDAsImV4cCI6MjA3MzU4MzcwMH0.X1Drl69l6IkaV518F382-KJEE1z81PiaC-O7GK7pGqs'                         // Replace with your Supabase anon key
);

// DOM Elements
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const quizContainer = document.getElementById('quiz-container');
const questionArea = document.getElementById('question-area');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const resultDisplay = document.getElementById('quiz-result');

// Timer Variables
let timer = 2 * 60; // 2 minutes in seconds
let timerInterval;
let timeUp = false;

// Quiz Variables
let questions = []; // Fetched dynamically from Supabase
let userAnswers = [];
let currentQuestionIndex = 0;

// Timer Functionality
function updateTimerDisplay() {
  const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
  const seconds = String(timer % 60).padStart(2, '0');
  timerDisplay.textContent = `Time left: ${minutes}:${seconds}`;
}

function startTimer() {
  timer = 2 * 60; // Reset timer to 2 minutes
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
    .from('Aralin1_Quiz2') // Adjust the table name if needed
    .select('id, question_text, choices, correct_answer');

  if (error) {
    console.error("Error fetching questions:", error.message);
    alert("Failed to fetch questions. Please try again later.");
    return [];
  }

  // Transform data into a usable format
  return data.map(q => ({
    id: q.id,
    q: q.question_text,
    choices: Object.entries(JSON.parse(q.options)).map(([key, value]) => `${key}. ${value}`)
  }));
}

// Render a Question
function showQuestion(index) {
  const qData = questions[index];
  currentQuestionIndex = index;

  // Build question HTML
  let html = `
    <p><strong>${index + 1}. ${qData.q}</strong></p>
    <div>`;
  for (let i = 0; i < qData.choices.length; i++) {
    const val = qData.choices[i][0]; // "A", "B", etc.
    const checked = userAnswers[index] === val ? 'checked' : '';
    html += `
      <label>
        <input type="radio" name="q${index + 1}" value="${val}" ${checked}>
        ${qData.choices[i]}
      </label>`;
  }
  html += '</div>';

  // Render question in the question area
  questionArea.innerHTML = html;

  // Control navigation button visibility
  prevBtn.style.display = index > 0 ? "inline-block" : "none";
  nextBtn.style.display = index < questions.length - 1 ? "inline-block" : "none";
  submitBtn.style.display = index === questions.length - 1 ? "inline-block" : "none";

  // Disable next button until the question is answered
  const radios = questionArea.querySelectorAll('input[type="radio"]');
  nextBtn.disabled = !userAnswers[index];
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      userAnswers[index] = radio.value; // Record user answer
      nextBtn.disabled = false; // Enable next button
    });
  });
}

// Navigation Button Handlers
prevBtn.onclick = () => {
  if (currentQuestionIndex > 0) showQuestion(currentQuestionIndex - 1);
};

nextBtn.onclick = () => {
  if (currentQuestionIndex < questions.length - 1) showQuestion(currentQuestionIndex + 1);
};

// Start the Quiz
startBtn.onclick = async function () {
  console.log("Starting quiz...");
  startBtn.disabled = true; // Disable start button to prevent issues

  // Fetch questions from Supabase
  questions = await fetchQuestionsFromSupabase();
  if (questions.length === 0) return; // Stop if no questions are loaded

  // Initialize answers
  userAnswers = Array(questions.length).fill("");

  // Show quiz container and start timer
  startBtn.style.display = "none";
  quizContainer.style.display = "block";
  startTimer();
  showQuestion(0);
};

// Submit Quiz
function submitQuiz() {
  clearInterval(timerInterval);

  let score = 0;
  questions.forEach(async (question, index) => {
    if (!userAnswers[index]) return; // Skip unanswered questions

    // Fetch correct answer from Supabase
    const { data, error } = await supabase
      .from('Aralin1_Quiz2') // Ensure table name matches
      .select('correct_answer')
      .eq('id', question.id)
      .single();

    if (error) {
      console.error(`Error fetching correct answer for question ${question.id}:`, error.message);
      return;
    }

    if (userAnswers[index] === data.correct_answer) score++; // Increment score for correct answers
  });

  // Display the result
  resultDisplay.textContent = `Your score: ${score} / ${questions.length}`;
  prevBtn.disabled = true;
  nextBtn.disabled = true;
  submitBtn.disabled = true;
}

quizForm.onsubmit = function (event) {
  event.preventDefault(); // Prevent form submission
  submitQuiz();
};