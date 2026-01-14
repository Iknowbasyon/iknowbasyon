// ✅ Initialize Supabase
const SUPABASE_URL = 'https://sinrkmzacjqcdsvyzgpv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbnJrbXphY2pxY2Rzdnl6Z3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDc3MDAsImV4cCI6MjA3MzU4MzcwMH0.X1Drl69l6IkaV518F382-KJEE1z81PiaC-O7GK7pGqs';

const supaQuiz3 = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'iknowbasyon-auth'
  }
});

console.log('✅ Supabase initialized for Aralin 1 Quiz 3');

// ✅ Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM loaded, initializing quiz...');

  // DOM Elements
  const startBtn = document.getElementById('start-btn');
  const quizContainer = document.getElementById('quiz-container');
  const timerDisplay = document.getElementById('timer');
  const quizForm = document.getElementById('tama-mali-quiz');
  const resultDisplay = document.getElementById('quiz-result');
  const headerBackBtn = document.querySelector('header .back-btn');

  // Global Variables
  let currentUser = null;
  let timer = 4 * 60;
  let timerInterval = null;
  let timeUp = false;
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let questions = [];

  // ✅ Check Authentication
  async function checkAuth() {
    console.log('=== Checking authentication ===');
    
    try {
      const { data: { session }, error } = await supaQuiz3.auth.getSession();
      
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
          font-weight:  bold;
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

  // ✅ Fetch Questions from Supabase
async function fetchQuestionsFromSupabase() {
  console.log('=== FETCHING QUESTIONS FROM SUPABASE ===');
  
  try {
    const { data, error } = await supaQuiz3
      .from('Aralin1_Quiz3')
      .select('id, question_text, correct_answer')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Error fetching questions:', error);
      alert('Failed to fetch questions.\n\nError: ' + error.message);
      return [];
    }

    if (! data || data.length === 0) {
      console.warn('⚠️ No questions found in database');
      alert('No questions found.   Please check your database.');
      return [];
    }

    console.log('✅ Fetched questions (RAW):', data);

    // Format questions with normalization
    const formattedQuestions = data.map((q) => {
      // Clean the correct answer:  trim whitespace/newlines and normalize case
      let cleanAnswer = String(q.correct_answer).trim();
      
      // Normalize to match our radio button values exactly
      if (cleanAnswer. toLowerCase() === 'tama') {
        cleanAnswer = 'Tama';
      } else if (cleanAnswer.toLowerCase() === 'mali') {
        cleanAnswer = 'Mali';
      }
      
      console.log(`Question ${q.id}: "${q.correct_answer}" → "${cleanAnswer}"`);
      
      return {
        id: q.id,
        q: q.question_text,
        correct:  cleanAnswer
      };
    });

    console.log('✅ Formatted questions:', formattedQuestions);
    return formattedQuestions;
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    alert('Unexpected error:  ' + err.message);
    return [];
  }
}

  // ✅ Timer Functions - DEFINE BEFORE startTimer()
  function updateTimer() {
    const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
    const seconds = String(timer % 60).padStart(2, '0');
    timerDisplay.textContent = `Time left: ${minutes}:${seconds}`;
  }

  function startTimer() {
    console.log('⏱️ Timer started');
    timer = 4 * 60;
    timeUp = false;
    
    // Make sure timer is visible
    timerDisplay.style.display = 'block';
    console.log('Timer display style:', timerDisplay.style.display);
    
    updateTimer(); // ✅ Now this is defined
    
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
    if (! questions || questions.length === 0) {
      console.error('Questions array is empty');
      return;
    }

    currentQuestionIndex = index;
    const questionData = questions[index];
    
    const fieldset = quizForm.querySelector('fieldset');
    
    let html = `
      <legend class="sr-only">Tama o Mali Quiz</legend>
      <div class="quiz-question-card">
        <span class="question-number">${index + 1}.</span>
        <span class="question-text">${questionData.q}</span>
        <div class="tama-mali-group">
          <label>
            <input type="radio" name="q${index + 1}" value="Tama" ${userAnswers[index] === 'Tama' ? 'checked' : ''} required> 
            Tama
          </label>
          <label>
            <input type="radio" name="q${index + 1}" value="Mali" ${userAnswers[index] === 'Mali' ? 'checked' : ''}> 
            Mali
          </label>
        </div>
      </div>
    `;
    
    html += '<div class="nav-btns">';
    
    if (index < questions.length - 1) {
      html += '<button type="button" class="nav-btn next-btn" id="next-btn-dynamic">Next →</button>';
    }
    
    html += '</div>';
    
    if (index === questions.length - 1) {
      html += '<button type="submit" class="submit-btn">Isumite ang Sagot</button>';
    }
    
    fieldset.innerHTML = html;
    
    const radios = fieldset.querySelectorAll('input[type="radio"]');
    const nextBtn = document.getElementById('next-btn-dynamic');
    
    const isAnswered = userAnswers[index] !== null && userAnswers[index] !== undefined;
    
    if (nextBtn) {
      nextBtn.disabled = !isAnswered;
      console.log(`Question ${index + 1}:  Next button ${isAnswered ? 'enabled' : 'disabled'}`);
    }
    
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        console.log(`Question ${index + 1}: Selected ${radio.value}`);
        userAnswers[index] = radio.value;
        
        if (nextBtn) {
          nextBtn.disabled = false;
          console.log(`Question ${index + 1}: Next button enabled`);
        }
      });
    });
    
    if (nextBtn) {
      nextBtn.onclick = () => {
        console. log(`Next button clicked on question ${index + 1}`);
        
        const selected = fieldset.querySelector('input[type="radio"]:checked');
        
        if (! selected) {
          console.log('No answer selected');
          nextBtn.disabled = true;
          return;
        }
        
        userAnswers[index] = selected. value;
        console.log(`Answer saved: ${selected.value}`);
        
        if (currentQuestionIndex < questions.length - 1) {
          console.log(`Moving to question ${currentQuestionIndex + 2}`);
          showQuestion(currentQuestionIndex + 1);
        }
      };
    }
  }

  // Start Quiz Button
  if (startBtn) {
    console.log('✅ Start button found! ');
    
    startBtn.onclick = async function() {
      console.log('🚀 Starting quiz...');
      startBtn.disabled = true;
      
      questions = await fetchQuestionsFromSupabase();
      
      if (questions.length === 0) {
        alert('No questions found. Please check your database.');
        startBtn.disabled = false;
        return;
      }
      
      userAnswers = Array(questions.length).fill(null);
      currentQuestionIndex = 0;
      
      startBtn.style.display = 'none';
      
      const quizDirections = document.querySelector('.quiz-directions');
      if (quizDirections) {
        quizDirections.style. display = 'block';
      }
      
      quizContainer.style.display = 'block';
      timerDisplay.style.display = 'block';
      
      console.log('✅ Timer display:', timerDisplay.style.display);
      console.log('✅ Timer element:', timerDisplay);
      
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
      
      startTimer();
      showQuestion(0);
      quizContainer.scrollIntoView({ behavior: 'smooth' });
    };
  } else {
    console.error('❌ Start button not found!');
  }

  // Submit Quiz
  async function submitQuiz() {
    console.log('📝 Submitting quiz...');
    
    clearInterval(timerInterval);
    
    let unanswered = [];
    for (let i = 0; i < questions.length; i++) {
      if (! userAnswers[i]) {
        unanswered.push(i + 1);
      }
    }
    
    if (unanswered.length > 0 && !timeUp) {
      resultDisplay.innerHTML = `
        <strong style="color: #dc3545;">⚠️ May hindi ka pa nasasagutang tanong:  </strong><br>
        Tanong #${unanswered.join(', #')}
      `;
      resultDisplay.style.color = '#dc3545';
      startTimer();
      return;
    }
    
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      if (userAnswers[i] === questions[i].correct) {
        score++;
      }
    }
    
    const percentage = ((score / questions.length) * 100).toFixed(2);
    
    let message = `Iyong puntos: ${score} / ${questions.length} (${percentage}%)`;
    
    if (score === questions.length) {
      message = `Perfect! 🎉 ${message}`;
      resultDisplay.style.color = '#1976d2';
    } else if (score >= questions.length * 0.7) {
      message = `Magaling! 👏 ${message}`;
      resultDisplay.style.color = '#00daef';
    } else {
      resultDisplay.style.color = '#666';
    }
    
    resultDisplay.innerHTML = message;
    
    if (headerBackBtn) {
      headerBackBtn.disabled = false;
      headerBackBtn.style.opacity = '1';
      headerBackBtn.style.cursor = 'pointer';
      headerBackBtn.onclick = () => window.history.back();
      console.log('🔓 Header back button re-enabled');
    }
    
    if (currentUser) {
      console.log('💾 Saving quiz result for:', currentUser.email);
      
      const quizData = {
        user_email:  currentUser.email,
        aralin:  1,
        gawain: 3,
        score: score,
        total_questions: questions.length,
        quiz_name: 'Sagot ko!  Panalo ako!',
        date_taken: new Date().toISOString()
      };
      
      console.log('=== DATA TO SAVE ===', quizData);
      
      try {
        const { data, error } = await supaQuiz3
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
          resultDisplay.innerHTML += '<br><small style="color: green;">✅ Na-save na ang resulta! </small>';
        }
      } catch (err) {
        console.error('❌ Unexpected error:', err);
        resultDisplay.innerHTML += '<br><small style="color: orange;">⚠️ May error sa pag-save. </small>';
      }
    } else {
      console.log('⚠️ No user logged in');
      resultDisplay. innerHTML += '<br><small style="color: orange;">⚠️ Hindi ka naka-login.  Hindi na-save ang resulta.</small>';
    }
    
    quizForm.style.display = 'none';
  }

  if (quizForm) {
    quizForm.onsubmit = async function(e) {
      e.preventDefault();
      await submitQuiz();
    };
  } else {
    console.error('❌ Quiz form not found! ');
  }

  checkAuth();

});
