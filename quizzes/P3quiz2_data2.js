// ✅ Initialize Supabase
const SUPABASE_URL = 'https://sinrkmzacjqcdsvyzgpv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbnJrbXphY2pxY2Rzdnl6Z3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDc3MDAsImV4cCI6MjA3MzU4MzcwMH0.X1Drl69l6IkaV518F382-KJEE1z81PiaC-O7GK7pGqs';

const supaQuizP2 = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'iknowbasyon-auth'
  }
});

console.log('✅ Supabase initialized for Aralin 2 Quiz 2');

// ✅ Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM loaded, initializing quiz...');

  // DOM Elements
  const proceedBtn = document.getElementById('proceed-btn');
  const videoSection = document.getElementById('video-section');
  const quizDirections = document.getElementById('quiz-directions');
  const quizContainer = document.getElementById('quiz-container');
  const timerDisplay = document.getElementById('timer');
  const quizForm = document.getElementById('multiple-choice-quiz');
  const questionArea = document.getElementById('question-area');
  const resultDisplay = document.getElementById('quiz-result');
  const headerBackBtn = document.querySelector('.back-btn');

  // Global Variables
  let currentUser = null;
  let timer = 4 * 60;
  let timerInterval = null;
  let timeUp = false;
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let questions = [];

  // Initial UI state
  timerDisplay.textContent = "Time left: 04:00";
  timerDisplay.style.display = "none";
  quizContainer.style.display = "none";
  quizDirections.style.display = "none";
  videoSection.style.display = "block";

  // ✅ Check Authentication
  async function checkAuth() {
    console.log('=== Checking authentication ===');
    
    try {
      const { data: { session }, error } = await supaQuizP2.auth.getSession();
      
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
      const { data, error } = await supaQuizP2
        .from('Aralin2_Quiz2')
        .select('id, question_text, choices, correct_answer')
        .order('id', { ascending: true });

      if (error) {
        console.error('❌ Error fetching questions:', error);
        alert('Failed to fetch questions.\n\nError: ' + error.message);
        return [];
      }

      if (! data || data.length === 0) {
        console.warn('⚠️ No questions found in database');
        alert('No questions found.  Please check your database.');
        return [];
      }

      console.log('✅ Fetched questions:', data);

      const formattedQuestions = data.map((q, index) => {
        let parsedChoices;
        
        try {
          if (typeof q.choices === 'string') {
            parsedChoices = JSON.parse(q.choices);
          } else {
            parsedChoices = q.choices;
          }
          
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
          return {
            id: q.id,
            q: q.question_text,
            choices: ['A.  Error loading choice', 'B. Error loading choice', 'C. Error loading choice', 'D. Error loading choice'],
            correct_answer: q.correct_answer
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
    timer = 4 * 60;
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

  // ✅ Show One Question at a Time
  function showQuestion(index) {
    if (! questions || questions.length === 0) {
      console.error('Questions array is empty');
      return;
    }

    currentQuestionIndex = index;
    const qData = questions[index];
    
    console.log(`=== Showing Question ${index + 1} ===`);
    
    // Build question HTML with Next/Submit button
    let html = `
      <div class="quiz-question-card">
        <span class="question-number">${index + 1}.</span>
        <span class="question-text">${qData.q}</span>
        <div class="choices-group">`;
    
    if (! qData.choices || ! Array.isArray(qData.choices) || qData.choices.length === 0) {
      console.error(`No choices found for question ${index + 1}`);
      html += '<p style="color: red;">Error:  No choices available</p>';
    } else {
      for (let i = 0; i < qData.choices.length; i++) {
        const choiceText = qData.choices[i];
        const val = choiceText.charAt(0);
        const checked = userAnswers[index] === val ?  'checked' : '';
        
        html += `
          <label>
            <input type="radio" name="q${index + 1}" value="${val}" ${checked} required> 
            ${choiceText}
          </label>`;
      }
    }
    
    html += `</div></div>`;
    
    // ✅ Add NEXT button (no previous button)
    html += '<div class="nav-btns">';
    
    if (index < questions.length - 1) {
      html += '<button type="button" class="next-btn" id="next-btn-dynamic">Next →</button>';
    } else {
      html += '<button type="submit" class="submit-btn">Isumite ang Sagot</button>';
    }
    
    html += '</div>';
    
    questionArea.innerHTML = html;
    
    // Add event listeners
    const radios = questionArea.querySelectorAll('input[type="radio"]');
    const nextBtn = document.getElementById('next-btn-dynamic');
    
    const isAnswered = userAnswers[index] !== '';
    
    if (nextBtn) {
      nextBtn.disabled = !isAnswered;
      console.log(`Question ${index + 1}:  Next button ${isAnswered ? 'enabled' : 'disabled'}`);
    }
    
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        console.log(`Question ${index + 1}: Selected ${radio.value}`);
        userAnswers[index] = radio. value;
        
        if (nextBtn) {
          nextBtn.disabled = false;
          console.log(`Question ${index + 1}: Next button enabled`);
        }
      });
    });
    
    // Next button handler
    if (nextBtn) {
      nextBtn.onclick = () => {
        console.log(`Next button clicked on question ${index + 1}`);
        
        const selected = questionArea.querySelector('input[type="radio"]:checked');
        
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

  // ✅ Proceed Button - Stops Video & Loads Quiz
  if (proceedBtn) {
    proceedBtn.onclick = async function() {
      console.log('📹 Proceeding from video to quiz...');
      proceedBtn.disabled = true;
      proceedBtn.textContent = 'Loading...';
      
      // ✅ STOP VIDEO
      const videoElement = videoSection.querySelector('video');
      const iframeElement = videoSection.querySelector('iframe');
      
      if (videoElement) {
        videoElement.pause();
        videoElement.currentTime = 0;
        console.log('🛑 Video stopped');
      }
      
      if (iframeElement) {
        const currentSrc = iframeElement.src;
        iframeElement.src = '';
        setTimeout(() => { iframeElement. src = currentSrc; }, 100);
        console.log('🛑 Iframe video stopped');
      }
      
      // ✅ Fetch questions
      questions = await fetchQuestionsFromSupabase();
      
      if (questions.length === 0) {
        alert('No questions found. Please check your database.');
        proceedBtn.disabled = false;
        proceedBtn. textContent = 'Proceed to Quiz';
        return;
      }
      
      userAnswers = Array(questions.length).fill('');
      currentQuestionIndex = 0;
      
      // Hide video, show quiz
      videoSection.style.display = 'none';
      quizDirections. style.display = 'block';
      timerDisplay.style. display = 'block';
      quizContainer.style.display = 'block';
      
      // Disable back button
      if (headerBackBtn) {
        headerBackBtn.disabled = true;
        headerBackBtn. style.opacity = '0.5';
        headerBackBtn.style.cursor = 'not-allowed';
        headerBackBtn.onclick = (e) => {
          e.preventDefault();
          alert('Hindi ka maaaring bumalik sa video!  Kailangan mong makinig nang mabuti sa una.');
          return false;
        };
        console.log('🔒 Back button disabled');
      }
      
      startTimer();
      showQuestion(0);
      quizContainer.scrollIntoView({ behavior: 'smooth' });
    };
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
    
    if (unanswered.length > 0 && ! timeUp) {
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
      if (userAnswers[i] === questions[i].correct_answer) {
        score++;
      }
    }
    
    const percentage = ((score / questions.length) * 100).toFixed(2);
    
    let message = `Iyong puntos:  ${score} / ${questions.length} (${percentage}%)`;
    
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
      console.log('🔓 Back button re-enabled');
    }
    
    if (currentUser) {
      console.log('💾 Saving quiz result for:', currentUser.email);
      
      const quizData = {
        user_email: currentUser.email,
        aralin:  2,
        gawain: 2,
        score: score,
        total_questions: questions.length,
        quiz_name: 'Improvised Water Filter',
        date_taken: new Date().toISOString()
      };
      
      try {
        const { data, error } = await supaQuizP2
          .from('quiz_results')
          .insert(quizData)
          .select();
        
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
      resultDisplay.innerHTML += '<br><small style="color: orange;">⚠️ Hindi ka naka-login. Hindi na-save ang resulta.</small>';
    }
    
    quizForm.style.display = 'none';
    questionArea.querySelectorAll('input[type="radio"]').forEach(r => r.disabled = true);
  }

  if (quizForm) {
    quizForm.onsubmit = async function(e) {
      e.preventDefault();
      await submitQuiz();
    };
  }

  checkAuth();

});
