// Initialize Supabase Client
const supabase = supabaseQ2.createClient(
  'https://supabase.com/dashboard/project/sinrkmzacjqcdsvyzgpv/editor/54155?schema=public',
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
const quizForm = document.getElementById('multiple-choice-quiz');

// Timer Variables
let timer = 2 * 60; // 2 minutes in seconds
let timerInterval = null;
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
  console.log("Timer started...");
  timer = 2 * 60;
  timeUp = false;
  updateTimerDisplay();
  clearInterval(timerInterval); // Clear any existing timer to prevent double-counting
  timerInterval = setInterval(() => {
    timer--;
    updateTimerDisplay();
    if (timer <= 0) {
      clearInterval(timerInterval);
      console.log("Timer finished!");
      timerDisplay.textContent = "Time's up!";
      timeUp = true;
      submitQuiz();
    }
  }, 1000);
}

// Fetch Questions from Supabase
async function fetchQuestionsFromSupabaseQ2() {
  console.log("Fetching questions from Supabase...");
  const { data, error } = await supabaseQ2
    .from('Aralin1_Quiz2') // Supabase table name
    .select('id, question_text, choices, correct_answer');

  if (error) {
    console.error("Error fetching questions:", error.message);
    alert("Failed to fetch questions. Please check your database configuration.");
    return [];
  }

  console.log("Raw questions from Supabase:", data);

  // Map and format the questions
  const formattedQuestions = data.map(q => ({
    id: q.id,
    q: q.question_text,
    choices: Object.entries(JSON.parse(q.choices)).map(([key, value]) => `${key}. ${value}`),
  }));

  console.log("Formatted questions for rendering:", formattedQuestions);
  return formattedQuestions;
}

// Render a Question on UI
function showQuestion(index) {
  if (!questions || questions.length === 0) {
    console.error("Questions array is empty. Cannot render question.");
    return;
  }

  const qData = questions[index];
  currentQuestionIndex = index;
  console.log(`Rendering question ${index + 1}`, qData);

  let html = `
    <p><strong>${index + 1}. ${qData.q}</strong></p>
    <div>`;
  for (let i = 0; i < qData.choices.length; i++) {
    const val = qData.choices[i][0]; // "A", "B", etc. (First letter)
    const checked = userAnswers[index] === val ? 'checked' : '';
    html += `
      <label>
        <input type="radio" name="q${index + 1}" value="${val}" ${checked}>
        ${qData.choices[i]}
      </label>`;
  }
  html += '</div>';

  questionArea.innerHTML = html; // Populate the DOM in the question area

  // Update visibility of navigation buttons
  prevBtn.style.display = index > 0 ? "inline-block" : "none";
  nextBtn.style.display = index < questions.length - 1 ? "inline-block" : "none";
  submitBtn.style.display = index === questions.length - 1 ? "inline-block" : "none";

  const radios = questionArea.querySelectorAll('input[type="radio"]');
  nextBtn.disabled = !userAnswers[index];
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      userAnswers[index] = radio.value; // Save the user's answer
      nextBtn.disabled = false; // Enable the Next button
    });
  });

  console.log("Next button state:", nextBtn.disabled);
}

// Start Quiz
startBtn.onclick = async function () {
  console.log("Starting quiz...");
  startBtn.disabled = true;

  // Fetch questions from Supabase
  questions = await fetchQuestionsFromSupabaseQ2();
  if (questions.length === 0) {
    alert("No questions found. Please check your database.");
    startBtn.disabled = false;
    return;
  }

  console.log("Questions loaded:", questions);

  // Initialize the quiz state
  userAnswers = Array(questions.length).fill(""); // Clear answers
  startBtn.style.display = "none"; // Hide start button
  quizContainer.style.display = "block"; // Show quiz container
  startTimer(); // Begin the timer
  showQuestion(0); // Display the first question
};

// Submit Quiz
quizForm.onsubmit = function (event) {
  event.preventDefault();
  submitQuiz();
};

// Handle Quiz Submission
function submitQuiz() {
  console.log("Submitting quiz...");

  let score = 0;
  questions.forEach((question, index) => {
    if (userAnswers[index] === question.correct_answer) {
      score++;
    }
  });

  console.log(`Final Score: ${score} / ${questions.length}`);
  resultDisplay.innerHTML = `
    <p>Your score: ${score} / ${questions.length}</p>
    <p>Quiz complete!</p>`;
  quizContainer.style.display = "none";
  startBtn.style.display = "block";
  startBtn.disabled = false; // Reenable the start button
  clearInterval(timerInterval); // Clear the timer
}
