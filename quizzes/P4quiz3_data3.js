// ✅ Initialize Supabase
const SUPABASE_URL = 'https://sinrkmzacjqcdsvyzgpv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbnJrbXphY2pxY2Rzdnl6Z3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDc3MDAsImV4cCI6MjA3MzU4MzcwMH0.X1Drl69l6IkaV518F382-KJEE1z81PiaC-O7GK7pGqs';

const supaQuizP4Q3 = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'iknowbasyon-auth'
  }
});

console.log('✅ Supabase initialized for Aralin 4 Quiz 3');

// ✅ Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM loaded, initializing quiz...');

  // DOM Elements
  const startBtn = document.getElementById('start-btn');
  const quizContainer = document.getElementById('quiz-container');
  const timerDisplay = document.getElementById('timer');
  const quizForm = document.getElementById('multiple-choice-quiz');
  const questionArea = document.getElementById('question-area');
  const nextBtn = document.getElementById('next-btn');
  const submitBtn = document. getElementById('submit-btn');
  const resultDisplay = document.getElementById('quiz-result');
  const headerBackBtn = document.getElementById('back-btn');

  // Global Variables
  let currentUser = null;
  let timer = 2 * 60;
  let timerInterval = null;
  let timeUp = false;
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let questions = []; // ✅ Will be fetched from Supabase

  // ✅ Check Authentication
  async function checkAuth() {
    console.log('=== Checking authentication ===');
    
    try {
      const { data: { session }, error } = await supaQuizP4Q3.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
      }
      
      console.log('Session:', session);
      
      if (! session || !session.user) {
        console.log('❌ No active session');
        
        const warning = document.createElement('div');
        warning.style. cssText = `
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
          ⚠️ Hindi ka naka-login! <br>
          <small style="font-weight:  normal;">Ang iyong resulta ay hindi ma-se-save. </small>
        `;
        document.querySelector('main').insertBefore(warning, document.querySelector('main').firstChild);
        
        currentUser = null;
        return;
      }
      
      currentUser = session.user;
      console.log('✅ User logged in:', currentUser. email);
      
    } catch (err) {
      console.error('Auth error:', err);
      currentUser = null;
    }
  }

  // ✅ Fetch Questions from Supabase
  async function fetchQuestionsFromSupabase() {
    console.log('=== FETCHING QUESTIONS FROM SUPABASE ===');
    
    try {
      const { data, error } = await supaQuizP4Q3
        .from('Aralin4_Quiz3') // ✅ Table name for Aralin 4, Gawain 3
        .select('id, question_text, choices, correct_answer')
        .order('id', { ascending: true });

      if (error) {
        console.error('❌ Error fetching questions:', error);
        alert('Failed to fetch questions.\n\nError: ' + error.message);
        return [];
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No questions found in database');
        alert('No questions found.  Please check your database.');
        return [];
      }

      console.log('✅ Fetched questions:', data);

      // Format questions
      const formattedQuestions = data.map((q, index) => {
        let parsedChoices;
        
        try {
          // Parse choices if it's a string
          if (typeof q.choices === 'string') {
            parsedChoices = JSON.parse(q.choices);
          } else {
            parsedChoices = q.choices;
          }
          
          console.log(`Question ${index + 1} choices:`, parsedChoices);
          
          // Convert object to array of formatted strings
          let choicesArray;
          if (Array.isArray(parsedChoices)) {
            choicesArray = parsedChoices;
          } else if (typeof parsedChoices === 'object' && parsedChoices !== null) {
            choicesArray = Object.entries(parsedChoices).map(([key, value]) => `${key}.  ${value}`);
          } else {
            console.error(`Invalid choices format for question ${index + 1}:`, parsedChoices);
            choicesArray = [];
          }
          
          return {
            id: q.id,
            q: q.question_text,
            choices: choicesArray,
            correct_answer: q.correct_answer
          };
          
        } catch (e) {
          console.error(`Error parsing question ${index + 1}:`, e);
          console.error('Raw choices data:', q.choices);
          
          return {
            id: q.id,
            q: q.question_text,
            choices: ['A.  Error loading choice', 'B. Error loading choice', 'C. Error loading choice'],
            correct_answer: q. correct_answer
          };
        }
      });

      console.log('✅ Formatted questions:', formattedQuestions);
      return formattedQuestions;
      
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      alert('Unexpected error:  ' + err.message);
      return [];
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
    if (! questions || questions.length === 0) {
      console.error('Questions array is empty');
      return;
    }

    currentQuestionIndex = index;
    const qData = questions[index];
    
    // Build question HTML
    let html = `
      <div class="quiz-question-card">
        <span class="question-number">${index + 1}.</span>
        <span class="question-text">${qData.q}</span>
        <div class="choices-group">`;
    
    for (let i = 0; i < qData.choices.length; i++) {
      const val = qData.choices[i][0]; // A, B, or C
      const checked = userAnswers[index] === val ?  'checked' : '';
      html += `
        <label>
          <input type="radio" name="q${index + 1}" value="${val}" ${checked} required> 
          ${qData.choices[i]}
        </label>`;
    }
    
    html += `</div></div>`;
    
    questionArea.innerHTML = html;
    
    // Show/hide buttons
    nextBtn.style.display = index < questions.length - 1 ?  'inline-block' : 'none';
    submitBtn.style.display = index === questions.length - 1 ?  'inline-block' : 'none';
    
    // Add event listeners for radio buttons
    const radios = questionArea.querySelectorAll('input[type="radio"]');
    
    // Check if question is already answered
    const isAnswered = userAnswers[index] !== '';
    
    // Disable next button until answered
    if (nextBtn) {
      nextBtn.disabled = ! isAnswered;
      console.log(`Question ${index + 1}:  Next button ${isAnswered ? 'enabled' : 'disabled'}`);
    }
    
    // Add change event listeners
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        console.log(`Question ${index + 1}: Selected ${radio.value}`);
        userAnswers[index] = radio. value;
        
        if (nextBtn) {
          nextBtn. disabled = false;
          console.log(`Question ${index + 1}: Next button enabled`);
        }
      });
    });
  }

  // Start Quiz Button
  if (startBtn) {
    startBtn.onclick = async function() {
      console.log('🚀 Starting quiz...');
      startBtn.disabled = true;
      
      // ✅ Fetch questions from Supabase
      questions = await fetchQuestionsFromSupabase();
      
      if (questions.length === 0) {
        alert('No questions found. Please check your database.');
        startBtn.disabled = false;
        return;
      }
      
      // Initialize user answers array
      userAnswers = Array(questions.length).fill('');
      currentQuestionIndex = 0;
      
      // Hide start button
      startBtn.style. display = 'none';
      
      // Show quiz container
      quizContainer.style.display = 'block';
      
      // ✅ Disable header back button during quiz
      if (headerBackBtn) {
        headerBackBtn. disabled = true;
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
  } else {
    console.error('❌ Start button not found! ');
  }

  // Next Button Handler
  if (nextBtn) {
    nextBtn.onclick = function() {
      console.log(`Next button clicked on question ${currentQuestionIndex + 1}`);
      
      const radios = questionArea.querySelectorAll(`input[type="radio"][name="q${currentQuestionIndex + 1}"]`);
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
      
      if (currentQuestionIndex < questions. length - 1) {
        console.log(`Moving to question ${currentQuestionIndex + 2}`);
        showQuestion(currentQuestionIndex + 1);
      }
    };
  }

  // Submit Quiz
  async function submitQuiz() {
    console.log('📝 Submitting quiz...');
    
    clearInterval(timerInterval);
    
    // Check for unanswered questions
    let unanswered = [];
    for (let i = 0; i < questions.length; i++) {
      if (!userAnswers[i]) {
        unanswered.push(i + 1);
      }
    }
    
    // If there are unanswered questions and time is not up
    if (unanswered.length > 0 && ! timeUp) {
      resultDisplay.innerHTML = `
        <strong style="color: #dc3545;">⚠️ May hindi ka pa nasasagutang tanong:  </strong><br>
        Tanong #${unanswered.join(', #')}
      `;
      resultDisplay.style.color = '#dc3545';
      startTimer();
      return;
    }
    
    // Calculate score
    let score = 0;
    for (let i = 0; i < questions.length; i++) {
      if (userAnswers[i] === questions[i].correct_answer) {
        score++;
      }
    }
    
    const percentage = ((score / questions.length) * 100).toFixed(2);
    
    // Display result
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
        aralin:  4,
        gawain: 3,
        score:  score,
        total_questions: questions.length,
        quiz_name: 'Suri Teksto',
        date_taken: new Date().toISOString()
      };
      
      console.log('=== DATA TO SAVE ===', quizData);
      
      try {
        const { data, error } = await supaQuizP4Q3
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
    
    // Hide form
    quizForm.style.display = 'none';
    
    // Disable all buttons
    if (nextBtn) nextBtn.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
    
    // Disable all radios
    questionArea.querySelectorAll('input[type="radio"]').forEach(r => r.disabled = true);
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