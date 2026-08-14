/* ==========================================================================
   DC MOVIE EXPERIENCE - CINEMATIC ENGINE, INTRO SEQUENCE & AUDIO CONTROLLER
   ========================================================================== */

(function () {
  'use strict';

  const TOTAL_FRAMES = 122;
  const frames = [];
  let loadedCount = 0;
  let isCanvasReady = false;

  // DOM Handles
  const canvas = document.getElementById('cinema-canvas');
  const ctx = canvas.getContext('2d');
  const actSections = Array.from(document.querySelectorAll('.cinematic-act'));
  const heroHeaderContent = document.querySelector('.hero-header-content');
  const heroPosterWrapper = document.querySelector('.hero-poster-wrapper');
  const heroPosterImg = document.querySelector('.poster-img');
  const scrollIndicator = document.querySelector('.scroll-explore-indicator');

  // Section 2 Overview Handles
  const overviewAct = document.getElementById('act-2');
  const overviewContainer = document.querySelector('.overview-container');
  const metaRows = Array.from(document.querySelectorAll('.meta-row'));

  // Section 3 Music Handles
  const musicAct = document.getElementById('act-3');
  const anirudhIntroBlock = document.querySelector('.anirudh-intro-block');
  const soundtrackHeaderBlock = document.querySelector('.soundtrack-header-block');
  const songCardRows = Array.from(document.querySelectorAll('.song-card-row'));
  const musicFooterBlock = document.querySelector('.music-footer-block');

  // Section 4 BTS Handles
  const btsAct = document.getElementById('act-4');
  const btsHeaderBlock = document.querySelector('.bts-header-block');
  const btsPartItems = Array.from(document.querySelectorAll('.bts-part-item'));
  const btsFooterBlock = document.querySelector('.bts-footer-block');

  // Section 5 Creator Handles
  const creatorAct = document.getElementById('act-5');
  const creatorHeaderBlock = document.querySelector('.creator-header-block');
  const creatorGrid = document.querySelector('.creator-grid');
  const creatorPhotoImg = document.querySelector('.creator-photo-img');
  const creatorFooterBlock = document.querySelector('.creator-footer-block');

  // Motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --------------------------------------------------------------------------
  // 1. LENIS SMOOTH SCROLL ENGINE INITIALIZATION
  // --------------------------------------------------------------------------
  let lenis = null;

  if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.6,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  } else {
    window.addEventListener('scroll', () => {
      onScrollUpdate(window.scrollY);
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 2. PRELOAD ALL 122 UPLOADED IMAGE FRAMES
  // --------------------------------------------------------------------------
  function preloadImageSequence() {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const numStr = String(i).padStart(3, '0');
      img.src = `./assets/ezgif-frame-${numStr}.jpg`;

      img.onload = () => {
        loadedCount++;
        if (loadedCount >= 3) {
          isCanvasReady = true;
          renderFrame(getScrollProgress());
        }
      };

      frames.push(img);
    }
  }

  // --------------------------------------------------------------------------
  // 3. CANVAS FULL-BLEED IMAGE RENDERER (ALWAYS FULL 100% VISIBILITY)
  // --------------------------------------------------------------------------
  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderFrame(getScrollProgress());
  }

  window.addEventListener('resize', resizeCanvas);

  function renderFrame(progress) {
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isCanvasReady && frames.length > 0) {
      const index = Math.min(
        TOTAL_FRAMES - 1,
        Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
      );
      const currentImg = frames[index];

      if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
        const imgRatio = currentImg.naturalWidth / currentImg.naturalHeight;
        const canvasRatio = canvas.width / canvas.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          drawWidth = canvas.height * imgRatio;
          drawHeight = canvas.height;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        }

        ctx.globalAlpha = 1.0;
        ctx.drawImage(currentImg, offsetX, offsetY, drawWidth, drawHeight);
      }
    }
  }

  function getScrollProgress() {
    const scrollY = lenis ? lenis.scroll : window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    return maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
  }

  // --------------------------------------------------------------------------
  // 4. PARALLAX & SECTION SCROLL OBSERVER
  // --------------------------------------------------------------------------
  function onScrollUpdate(scrollY) {
    const totalMaxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalMaxScroll > 0 ? scrollY / totalMaxScroll : 0;

    renderFrame(progress);

    if (canvas) {
      canvas.style.opacity = '1.0';
    }

    const viewportHeight = window.innerHeight;

    // Section 1 Header & Poster Parallax
    if (heroPosterWrapper) {
      const heroRect = heroPosterWrapper.getBoundingClientRect();
      const heroDist = heroRect.top + heroRect.height / 2 - viewportHeight / 2;
      const normHeroDist = heroDist / (viewportHeight / 2);

      const opacity = Math.max(0, 1 - Math.abs(normHeroDist) * 0.75);
      const scale = Math.max(0.92, 1 - Math.abs(normHeroDist) * 0.08);
      const translateY = heroDist * -0.06;

      heroPosterWrapper.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
      heroPosterWrapper.style.opacity = opacity.toFixed(3);

      if (heroHeaderContent) {
        heroHeaderContent.style.transform = `translate3d(-50%, ${translateY * 0.5}px, 0)`;
        heroHeaderContent.style.opacity = opacity.toFixed(3);
      }

      if (scrollIndicator) {
        scrollIndicator.style.opacity = Math.max(0, 1 - scrollY / 150).toFixed(3);
      }

      if (heroPosterImg) {
        heroPosterImg.style.transform = `scale(${1 + Math.abs(normHeroDist) * 0.05})`;
      }
    }

    // Section 2: Movie Overview Reveal & Parallax
    if (overviewAct && overviewContainer) {
      const rect = overviewAct.getBoundingClientRect();
      const centerPos = rect.top + rect.height / 2;
      const distFromCenter = centerPos - viewportHeight / 2;
      const normalizedDist = distFromCenter / (viewportHeight / 2);

      const absDist = Math.abs(normalizedDist);
      const opacity = Math.max(0, 1 - absDist * 0.85);
      const translateY = distFromCenter * 0.05 * -1;

      overviewContainer.style.transform = `translate3d(0, ${translateY}px, 0) scale(${Math.max(0.94, 1 - absDist * 0.06)})`;
      overviewContainer.style.opacity = opacity.toFixed(3);

      metaRows.forEach((row, index) => {
        const rowDelay = index * 0.04;
        const rowOpacity = Math.max(0, Math.min(1, opacity - rowDelay));
        row.style.opacity = rowOpacity.toFixed(3);
      });
    }

    // Section 3: Anirudh & Soundtrack Observer
    if (musicAct) {
      if (anirudhIntroBlock) {
        const rect = anirudhIntroBlock.getBoundingClientRect();
        const distFromCenter = (rect.top + rect.height / 2) - viewportHeight / 2;
        const normDist = distFromCenter / (viewportHeight / 2);
        const opacity = Math.max(0, 1 - Math.abs(normDist) * 0.7);

        anirudhIntroBlock.style.opacity = opacity.toFixed(3);
        anirudhIntroBlock.style.transform = `translate3d(0, ${distFromCenter * -0.04}px, 0)`;
      }

      if (soundtrackHeaderBlock) {
        const rect = soundtrackHeaderBlock.getBoundingClientRect();
        const distFromCenter = (rect.top + rect.height / 2) - viewportHeight / 2;
        const normDist = distFromCenter / (viewportHeight / 2);
        const opacity = Math.max(0, 1 - Math.abs(normDist) * 0.7);

        soundtrackHeaderBlock.style.opacity = opacity.toFixed(3);
        soundtrackHeaderBlock.style.transform = `translate3d(0, ${distFromCenter * -0.04}px, 0)`;
      }

      songCardRows.forEach((row) => {
        const rect = row.getBoundingClientRect();
        const distFromCenter = (rect.top + rect.height / 2) - viewportHeight / 2;
        const normDist = distFromCenter / (viewportHeight / 2);

        const absDist = Math.abs(normDist);
        const opacity = Math.max(0, 1 - absDist * 0.75);
        const posterScale = 1.0 + absDist * 0.05;

        row.style.opacity = opacity.toFixed(3);
        row.style.transform = `translate3d(0, ${distFromCenter * -0.03}px, 0)`;

        const posterImg = row.querySelector('.song-poster');
        if (posterImg) {
          posterImg.style.transform = `scale(${posterScale.toFixed(3)})`;
        }
      });

      if (musicFooterBlock) {
        const rect = musicFooterBlock.getBoundingClientRect();
        const distFromCenter = (rect.top + rect.height / 2) - viewportHeight / 2;
        const normDist = distFromCenter / (viewportHeight / 2);
        const opacity = Math.max(0, 1 - Math.abs(normDist) * 0.7);

        musicFooterBlock.style.opacity = opacity.toFixed(3);
        musicFooterBlock.style.transform = `translate3d(0, ${distFromCenter * -0.04}px, 0)`;
      }
    }

    // Section 4: Behind The Film Observer
    if (btsAct) {
      if (btsHeaderBlock) {
        const rect = btsHeaderBlock.getBoundingClientRect();
        const distFromCenter = (rect.top + rect.height / 2) - viewportHeight / 2;
        const normDist = distFromCenter / (viewportHeight / 2);
        const opacity = Math.max(0, 1 - Math.abs(normDist) * 0.7);

        btsHeaderBlock.style.opacity = opacity.toFixed(3);
        btsHeaderBlock.style.transform = `translate3d(0, ${distFromCenter * -0.04}px, 0)`;
      }

      btsPartItems.forEach((partItem) => {
        const rect = partItem.getBoundingClientRect();
        const distFromCenter = (rect.top + rect.height / 2) - viewportHeight / 2;
        const normDist = distFromCenter / (viewportHeight / 2);

        const absDist = Math.abs(normDist);
        const opacity = Math.max(0, 1 - absDist * 0.75);
        const imgScale = 1.0 + absDist * 0.05;

        partItem.style.opacity = opacity.toFixed(3);
        partItem.style.transform = `translate3d(0, ${distFromCenter * -0.03}px, 0)`;

        const imgEl = partItem.querySelector('.bts-img, .bts-team-img');
        if (imgEl) {
          imgEl.style.transform = `scale(${imgScale.toFixed(3)})`;
        }
      });

      if (btsFooterBlock) {
        const rect = btsFooterBlock.getBoundingClientRect();
        const distFromCenter = (rect.top + rect.height / 2) - viewportHeight / 2;
        const normDist = distFromCenter / (viewportHeight / 2);
        const opacity = Math.max(0, 1 - Math.abs(normDist) * 0.7);

        btsFooterBlock.style.opacity = opacity.toFixed(3);
        btsFooterBlock.style.transform = `translate3d(0, ${distFromCenter * -0.04}px, 0)`;
      }
    }

    // Section 5: Creator About Me Observer
    if (creatorAct) {
      if (creatorHeaderBlock) {
        const rect = creatorHeaderBlock.getBoundingClientRect();
        const distFromCenter = (rect.top + rect.height / 2) - viewportHeight / 2;
        const normDist = distFromCenter / (viewportHeight / 2);
        const opacity = Math.max(0, 1 - Math.abs(normDist) * 0.7);

        creatorHeaderBlock.style.opacity = opacity.toFixed(3);
        creatorHeaderBlock.style.transform = `translate3d(0, ${distFromCenter * -0.04}px, 0)`;
      }

      if (creatorGrid) {
        const rect = creatorGrid.getBoundingClientRect();
        const distFromCenter = (rect.top + rect.height / 2) - viewportHeight / 2;
        const normDist = distFromCenter / (viewportHeight / 2);
        const absDist = Math.abs(normDist);
        const opacity = Math.max(0, 1 - absDist * 0.75);
        const scale = 1.0 + absDist * 0.04;

        creatorGrid.style.opacity = opacity.toFixed(3);
        creatorGrid.style.transform = `translate3d(0, ${distFromCenter * -0.03}px, 0)`;

        if (creatorPhotoImg) {
          creatorPhotoImg.style.transform = `scale(${scale.toFixed(3)})`;
        }
      }

      if (creatorFooterBlock) {
        const rect = creatorFooterBlock.getBoundingClientRect();
        const distFromCenter = (rect.top + rect.height / 2) - viewportHeight / 2;
        const normDist = distFromCenter / (viewportHeight / 2);
        const opacity = Math.max(0, 1 - Math.abs(normDist) * 0.7);

        creatorFooterBlock.style.opacity = opacity.toFixed(3);
        creatorFooterBlock.style.transform = `translate3d(0, ${distFromCenter * -0.04}px, 0)`;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 5. CINEMATIC INTRO SEQUENCE TIMELINE ENGINE
  // --------------------------------------------------------------------------
  (function initCinematicIntro() {
    const introOverlay = document.getElementById('cinematic-intro');
    if (!introOverlay) return;

    const bgGlow = introOverlay.querySelector('.intro-bg-glow');
    const liquidMist = introOverlay.querySelector('.intro-liquid-mist');
    const welcomeText = introOverlay.querySelector('.intro-welcome-text');
    const dcTitle = introOverlay.querySelector('.intro-dc-title');
    const bladeSlash = introOverlay.querySelector('.intro-blade-slash');
    const directorText = introOverlay.querySelector('.intro-director-text');
    const skipHint = introOverlay.querySelector('.intro-skip-hint');

    let isDismissed = false;
    let sequenceTimeouts = [];

    function dismissIntro() {
      if (isDismissed) return;
      isDismissed = true;

      sequenceTimeouts.forEach(clearTimeout);
      introOverlay.classList.add('dismissed');

      setTimeout(() => {
        if (introOverlay.parentNode) {
          introOverlay.style.display = 'none';
        }
      }, 1200);
    }

    introOverlay.addEventListener('click', dismissIntro);
    introOverlay.addEventListener('touchstart', dismissIntro, { passive: true });

    window.addEventListener('mousemove', (e) => {
      if (isDismissed || !liquidMist) return;
      const moveX = (e.clientX / window.innerWidth - 0.5) * 30;
      const moveY = (e.clientY / window.innerHeight - 0.5) * 30;
      liquidMist.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    }, { passive: true });

    if (prefersReducedMotion) {
      dismissIntro();
      return;
    }

    // Timeline Sequence (0s -> 5.2s)
    sequenceTimeouts.push(setTimeout(() => {
      if (bgGlow) {
        bgGlow.style.opacity = '0.5';
        bgGlow.style.transform = 'scale(1)';
      }
    }, 200));

    sequenceTimeouts.push(setTimeout(() => {
      if (liquidMist) liquidMist.style.opacity = '0.85';
      if (bgGlow) bgGlow.style.opacity = '0.9';
      if (skipHint) skipHint.style.opacity = '1';
    }, 700));

    sequenceTimeouts.push(setTimeout(() => {
      if (welcomeText) {
        welcomeText.style.opacity = '1';
        welcomeText.style.transform = 'translateY(0) scaleX(1)';
      }
    }, 1500));

    sequenceTimeouts.push(setTimeout(() => {
      if (dcTitle) {
        dcTitle.style.opacity = '1';
        dcTitle.style.transform = 'scale(1)';
      }
    }, 2200));

    sequenceTimeouts.push(setTimeout(() => {
      if (bladeSlash) {
        bladeSlash.style.opacity = '1';
        bladeSlash.style.transform = 'translateY(-50%) rotate(-6deg) scaleX(1)';
      }
    }, 3400));

    sequenceTimeouts.push(setTimeout(() => {
      if (bladeSlash) bladeSlash.style.opacity = '0';
    }, 3800));

    sequenceTimeouts.push(setTimeout(() => {
      if (directorText) {
        directorText.style.opacity = '1';
        directorText.style.transform = 'translateY(0)';
      }
    }, 4000));

    sequenceTimeouts.push(setTimeout(() => {
      dismissIntro();
    }, 5200));

  })();

  // --------------------------------------------------------------------------
  // 6. CINEMATIC BACKGROUND MUSIC ENGINE (SINGLETON AUDIO CONTROLLER)
  // --------------------------------------------------------------------------
  (function initCinematicAudio() {
    const audio = new Audio('./assets/cinematic_bgm.mp3');
    audio.loop = true;
    audio.volume = 0;

    const TARGET_VOLUME = 0.18;
    const musicBtn = document.getElementById('music-toggle-btn');
    const iconOn = musicBtn ? musicBtn.querySelector('.icon-on') : null;
    const iconOff = musicBtn ? musicBtn.querySelector('.icon-off') : null;

    let isPlaying = false;
    let fadeInterval = null;
    let hasUserInteracted = false;

    function updateUI(playing) {
      if (!musicBtn) return;
      if (playing) {
        musicBtn.classList.add('playing');
        if (iconOn) iconOn.style.display = 'block';
        if (iconOff) iconOff.style.display = 'none';
      } else {
        musicBtn.classList.remove('playing');
        if (iconOn) iconOn.style.display = 'none';
        if (iconOff) iconOff.style.display = 'block';
      }
    }

    function fadeIn() {
      clearInterval(fadeInterval);
      audio.play().then(() => {
        isPlaying = true;
        updateUI(true);
        fadeInterval = setInterval(() => {
          if (audio.volume < TARGET_VOLUME - 0.01) {
            audio.volume = Math.min(TARGET_VOLUME, audio.volume + 0.02);
          } else {
            audio.volume = TARGET_VOLUME;
            clearInterval(fadeInterval);
          }
        }, 70);
      }).catch(() => {
        isPlaying = false;
        updateUI(false);
      });
    }

    function fadeOut() {
      clearInterval(fadeInterval);
      fadeInterval = setInterval(() => {
        if (audio.volume > 0.02) {
          audio.volume = Math.max(0, audio.volume - 0.03);
        } else {
          audio.volume = 0;
          audio.pause();
          isPlaying = false;
          updateUI(false);
          clearInterval(fadeInterval);
        }
      }, 40);
    }

    function toggleMusic() {
      if (isPlaying) {
        localStorage.setItem('dc_music_pref', 'disabled');
        fadeOut();
      } else {
        localStorage.setItem('dc_music_pref', 'enabled');
        fadeIn();
      }
    }

    function onFirstInteraction() {
      if (hasUserInteracted) return;
      hasUserInteracted = true;

      const pref = localStorage.getItem('dc_music_pref');
      if (pref !== 'disabled') {
        fadeIn();
      } else {
        updateUI(false);
      }

      ['click', 'touchstart', 'keydown', 'wheel'].forEach((evt) => {
        window.removeEventListener(evt, onFirstInteraction);
      });
    }

    ['click', 'touchstart', 'keydown', 'wheel'].forEach((evt) => {
      window.addEventListener(evt, onFirstInteraction, { passive: true, once: true });
    });

    if (musicBtn) {
      musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMusic();
      });
    }

    const initialPref = localStorage.getItem('dc_music_pref');
    if (initialPref === 'disabled') {
      updateUI(false);
    } else {
      updateUI(true);
    }
  })();

  if (lenis) {
    lenis.on('scroll', (e) => {
      onScrollUpdate(e.scroll);
    });
  }

  resizeCanvas();
  preloadImageSequence();
  onScrollUpdate(0);

})();
