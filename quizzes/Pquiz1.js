// ✅ Initialize Supabase
const SUPABASE_URL = 'https://sinrkmzacjqcdsvyzgpv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbnJrbXphY2pxY2Rzdnl6Z3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDc3MDAsImV4cCI6MjA3MzU4MzcwMH0.X1Drl69l6IkaV518F382-KJEE1z81PiaC-O7GK7pGqs';

const supaQuizP = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'iknowbasyon-auth'
  }
});

console.log('✅ Supabase initialized for Performance Task Quiz');

// ✅ Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM loaded, initializing quiz...');

  // DOM Elements
  const proceedBtn = document.getElementById('proceed-btn');
  const readingSection = document.getElementById('reading-section');
  const quizDirections = document.getElementById('quiz-directions');
  const quizContainer = document.getElementById('quiz-container');
  const timerDisplay = document.getElementById('timer');
  const quizForm = document.getElementById('multiple-choice-quiz');
  const questionCards = Array.from(document.querySelectorAll('.quiz-question-card'));
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const submitBtn = document. querySelector('.submit-btn');
  const resultDisplay = document.getElementById('quiz-result');
  const headerBackBtn = document.querySelector('.back-btn');

  // Global Variables
  let currentUser = null;
  let timer = 2 * 60;
  let timerInterval = null;
  let timeUp = false;
  let currentQuestionIndex = 0;
  let userAnswers = Array(questionCards.length).fill('');

  // Correct answers (exact from original code)
  const correctAnswers = ["C", "C", "A", "B", "B", "C", "B", "D", "D", "C"];

  // Initial UI state
  timerDisplay.textContent = "Time left: 02:00";
  timerDisplay.style.display = "none";
  quizContainer. style.display = "none";
  quizDirections.style. display = "none";
  readingSection.style.display = "block";

  // ✅ Check Authentication
  async function checkAuth() {
    console.log('=== Checking authentication ===');
    
    try {
      const { data:  { session }, error } = await supaQuizP.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
      }
      
      console.log('Session:', session);
      
      if (! session || !session.user) {
        console.log('❌ No active session');
        
        const warning = document.createElement('div');
        warning.style.cssText = `
          background: #fff3cd;
          border: 2px solid #ffc107;
          color: #856404;
          padding: 20px;
          border-radius:  10px;
          margin:  20px auto;
          max-width: 660px;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
        `;
        warning.innerHTML = `
          ⚠️ Hindi ka naka-login!  <br>
          <small style="font-weight: normal;">Ang iyong resulta ay hindi ma-se-save. </small>
        `;
        document.querySelector('main').insertBefore(warning, document.querySelector('main').firstChild);
        
        currentUser = null;
        return;
      }
      
      currentUser = session.user;
      console.log('✅ User logged in:', currentUser.email);
      
    } catch (err) {
      console.error('Auth error:', err);
      currentUser = null;
    }
  }

  // Timer Functions
  function updateTimer() {
    const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
    const seconds = String(timer % 60).padStart(2, '0');
    timerDisplay.textContent = `Time left: ${minutes}:${seconds}`;
  }

  function startTimer() {
    console.log('⏱️ Timer started');
    timer = 2 * 60;
    timeUp = false;
    updateTimer();
    
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timer--;
      updateTimer();
      
      if (timer <= 0) {
        clearInterval(timerInterval);
        console.log('⏰ Time is up!');
        timerDisplay.textContent = "Time's up!";
        timeUp = true;
        submitQuiz();
      }
    }, 1000);
  }

  // Show One Question at a Time
  function showQuestion(index) {
    currentQuestionIndex = index;
    
    questionCards.forEach((card, i) => {
      card.style.display = i === index ? 'block' : 'none';
      
      // Restore checked state if already answered
      const name = `q${i + 1}`;
      if (userAnswers[i]) {
        const radios = card. querySelectorAll(`input[name="${name}"]`);
        radios.forEach(r => {
          r.checked = (r.value === userAnswers[i]);
        });
      }
    });
    
    // Show/hide navigation buttons
    prevBtn.style. display = index > 0 ? 'inline-block' : 'none';
    nextBtn.style.display = index < questionCards.length - 1 ? 'inline-block' : 'none';
    submitBtn.style.display = index === questionCards.length - 1 ? 'inline-block' : 'none';
    
    // Check if question is already answered
    const isAnswered = userAnswers[index] !== '';
    
    // Disable next button until answered
    if (nextBtn) {
      nextBtn.disabled = ! isAnswered;
      console.log(`Question ${index + 1}:  Next button ${isAnswered ? 'enabled' : 'disabled'}`);
    }
    
    // Add change event listeners for current question
    const name = `q${index + 1}`;
    const radios = questionCards[index].querySelectorAll(`input[name="${name}"]`);
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        console.log(`Question ${index + 1}: Selected ${radio.value}`);
        userAnswers[index] = radio.value;
        
        if (nextBtn) {
          nextBtn. disabled = false;
          console.log(`Question ${index + 1}: Next button enabled`);
        }
      });
    });
  }

  // Proceed Button (from reading to quiz)
  if (proceedBtn) {
    proceedBtn.onclick = function() {
      console.log('📖 Proceeding from reading to quiz...');
      
      // Hide reading section
      readingSection. style.display = 'none';
      
      // Show quiz directions and container
      quizDirections.style.display = 'block';
      timerDisplay.style.display = 'block';
      quizContainer.style.display = 'block';
      
      // ✅ Disable header back button during quiz
      if (headerBackBtn) {
        headerBackBtn.disabled = true;
        headerBackBtn.style.opacity = '0.5';
        headerBackBtn.style.cursor = 'not-allowed';
        headerBackBtn.onclick = (e) => {
          e.preventDefault();
          alert('Hindi ka maaaring bumalik habang nagsasagot ng quiz! ');
          return false;
        };
        console.log('🔒 Header back button disabled');
      }
      
      // Start timer
      startTimer();
      
      // Show first question
      showQuestion(0);
      
      // Scroll to quiz
      quizContainer.scrollIntoView({ behavior: 'smooth' });
    };
  }

  // Previous Button Handler
  if (prevBtn) {
    prevBtn.onclick = function() {
      console.log(`Previous button clicked on question ${currentQuestionIndex + 1}`);
      
      // Save current answer
      const name = `q${currentQuestionIndex + 1}`;
      const radios = questionCards[currentQuestionIndex].querySelectorAll(`input[name="${name}"]`);
      radios.forEach(radio => {
        if (radio.checked) {
          userAnswers[currentQuestionIndex] = radio.value;
        }
      });
      
      if (currentQuestionIndex > 0) {
        console.log(`Moving to question ${currentQuestionIndex}`);
        showQuestion(currentQuestionIndex - 1);
      }
    };
  }

  // Next Button Handler
  if (nextBtn) {
    nextBtn.onclick = function() {
      console.log(`Next button clicked on question ${currentQuestionIndex + 1}`);
      
      // Save current answer
      const name = `q${currentQuestionIndex + 1}`;
      const radios = questionCards[currentQuestionIndex].querySelectorAll(`input[name="${name}"]`);
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
      
      if (currentQuestionIndex < questionCards.length - 1) {
        console.log(`Moving to question ${currentQuestionIndex + 2}`);
        showQuestion(currentQuestionIndex + 1);
      }
    };
  }

  // Submit Quiz
  async function submitQuiz() {
    console.log('📝 Submitting quiz...');
    
    clearInterval(timerInterval);
    
    // Save last answer
    const name = `q${currentQuestionIndex + 1}`;
    const radios = questionCards[currentQuestionIndex]. querySelectorAll(`input[name="${name}"]`);
    radios.forEach(radio => {
      if (radio.checked) {
        userAnswers[currentQuestionIndex] = radio.value;
      }
    });
    
    // Check for unanswered questions
    let unanswered = [];
    for (let i = 0; i < questionCards.length; i++) {
      if (!userAnswers[i]) {
        unanswered.push(i + 1);
      }
    }
    
    // If there are unanswered questions and time is not up
    if (unanswered.length > 0 && !timeUp) {
      resultDisplay.innerHTML = `
        <strong style="color: #dc3545;">⚠️ May hindi ka pa nasasagutang tanong: </strong><br>
        Tanong #${unanswered.join(', #')}
      `;
      resultDisplay.style.color = '#dc3545';
      startTimer();
      return;
    }
    
    // Calculate score
    let score = 0;
    for (let i = 0; i < correctAnswers.length; i++) {
      if (userAnswers[i] === correctAnswers[i]) {
        score++;
      }
    }
    
    const percentage = ((score / correctAnswers.length) * 100).toFixed(2);
    
    // Display result
    let message = `Iyong puntos:  ${score} / ${correctAnswers.length} (${percentage}%)`;
    
    if (score === correctAnswers.length) {
      message = `Perfect! 🎉 ${message}`;
      resultDisplay.style.color = '#1976d2';
    } else if (score >= correctAnswers.length * 0.7) {
      message = `Magaling! 👏 ${message}`;
      resultDisplay.style.color = '#00daef';
    } else {
      resultDisplay.style.color = '#666';
    }
    
    resultDisplay.innerHTML = message;
    
    // ✅ Re-enable header back button after quiz
    if (headerBackBtn) {
      headerBackBtn.disabled = false;
      headerBackBtn.style.opacity = '1';
      headerBackBtn.style. cursor = 'pointer';
      headerBackBtn.onclick = () => window.history.back();
      console.log('🔓 Header back button re-enabled');
    }
    
    // === SAVE TO SUPABASE ===
    if (currentUser) {
      console.log('💾 Saving quiz result for:', currentUser.email);
      
      const quizData = {
        user_email: currentUser.email,
        aralin: 2,  // ✅ Aralin 2
        gawain: 1,  // ✅ Gawain 1
        score: score,
        total_questions: correctAnswers.length,
        quiz_name: 'Artificial Intelligence',  // ✅ Quiz name
        date_taken: new Date().toISOString()
      };
      
      console.log('=== DATA TO SAVE ===', quizData);
      
      try {
        const { data, error } = await supaQuizP
          .from('quiz_results')
          .insert(quizData)
          .select();
        
        console.log('=== SAVE RESULT ===');
        console.log('Data:', data);
        console.log('Error:', error);
        
        if (error) {
          console.error('❌ Error saving:', error);
          resultDisplay.innerHTML += '<br><small style="color: orange;">⚠️ Hindi na-save ang resulta:  ' + error.message + '</small>';
        } else {
          console.log('✅ Result saved! ', data);
          resultDisplay.innerHTML += '<br><small style="color: green;">✅ Na-save na ang resulta!</small>';
        }
      } catch (err) {
        console.error('❌ Unexpected error:', err);
        resultDisplay.innerHTML += '<br><small style="color: orange;">⚠️ May error sa pag-save. </small>';
      }
    } else {
      console.log('⚠️ No user logged in');
      resultDisplay.innerHTML += '<br><small style="color: orange;">⚠️ Hindi ka naka-login.  Hindi na-save ang resulta.</small>';
    }
    
    // Disable all buttons and radios
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
    
    questionCards.forEach((card) => {
      const radios = card.querySelectorAll('input[type="radio"]');
      radios.forEach(r => r.disabled = true);
    });
  }

  // Attach submit handler
  if (quizForm) {
    quizForm.onsubmit = async function(e) {
      e.preventDefault();
      await submitQuiz();
    };
  } else {
    console.error('❌ Quiz form not found! ');
  }

  // Run auth check
  checkAuth();

}); // ✅ End of DOMContentLoaded
