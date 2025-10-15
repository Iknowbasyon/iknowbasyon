// Map each aralin to its password and redirect URL
const aralinConfig = {
  UnangAralin: {
    password: "password1",
    url: "/iknowbasyon/quizzes/Unangaralin.html"
  },
  PangalawangAralin: {
    password: "password2",
    url: "/iknowbasyon/quizzes/Pangalawangaralin.html"
  },
  PangatlongAralin: {
    password: "password3",
    url: "/iknowbasyon/quizzes/Pangatlongaralin.html"
  },
  PangapatAralin: {
    password: "password4",
    url: "/iknowbasyon/quizzes/PangapatAralin.html"
  }
};

document.addEventListener('DOMContentLoaded', function () {
  const links = document.querySelectorAll('.locked-aralin');
  const modal = document.getElementById('passwordModal');
  const closeModal = document.getElementById('closeModal');
  const submitBtn = document.getElementById('submitPassword');
  const passwordInput = document.getElementById('passwordInput');
  const passwordError = document.getElementById('passwordError');
  let currentAralin = null;

  links.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      currentAralin = link.getAttribute('data-aralin');
      passwordInput.value = '';
      passwordError.textContent = '';
      modal.style.display = "block";
      passwordInput.focus();
    });
  });

  closeModal.onclick = function() { modal.style.display = "none"; };
  window.onclick = function(event) { if (event.target == modal) modal.style.display = "none"; };

  function tryUnlock() {
    if (!currentAralin || !aralinConfig[currentAralin]) return;
    const password = passwordInput.value;
    if (password === aralinConfig[currentAralin].password) {
      modal.style.display = "none";
      window.location.href = aralinConfig[currentAralin].url;
    } else {
      passwordError.textContent = "Incorrect password!";
      passwordInput.value = '';
      passwordInput.focus();
    }
  }

  submitBtn.onclick = tryUnlock;
  passwordInput.addEventListener('keydown', function(e) {
    if (e.key === "Enter") tryUnlock();
  });
});

