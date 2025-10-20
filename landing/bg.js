
// Fade-in for background hero image (blur-up / responsive)
// Adds .loaded to the <img class="bg-img"> when the full-res image loads.
// Graceful: if JS disabled the image still shows.
(function () {
  try {
    var bgImg = document.querySelector('.bg-picture img.bg-img');
    if (!bgImg) return;

    // If already complete (cached), add loaded class immediately
    if (bgImg.complete && bgImg.naturalWidth !== 0) {
      bgImg.classList.add('loaded');
      return;
    }

    bgImg.addEventListener('load', function () {
      // small timeout to make the transition smoother in some browsers
      setTimeout(function () {
        bgImg.classList.add('loaded');
      }, 60);
    }, { once: true });

    bgImg.addEventListener('error', function () {
      // fallback: ensure overlay is visible so content stays readable
      var overlay = document.querySelector('.bg-overlay');
      if (overlay) overlay.style.opacity = '1';
      console.warn('Background image failed to load.');
    }, { once: true });
  } catch (e) {
    console.error('bg-load error:', e);
  }
})();
