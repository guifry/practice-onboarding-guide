const allSlides = Array.from(document.querySelectorAll('.slide'));

const counter = document.getElementById('counter');
const rail = document.getElementById('rail');
const railFill = document.getElementById('railFill');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const prevName = document.getElementById('prevName');
const nextName = document.getElementById('nextName');
const dots = document.getElementById('dots');
const live = document.getElementById('live');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const overview = document.getElementById('overview');
const overviewGrid = document.getElementById('overviewGrid');
const overviewClose = document.getElementById('overviewClose');
const coverThumbs = document.getElementById('coverThumbs');
const recap = document.getElementById('recap');
const doneLead = document.getElementById('doneLead');
const otherTrackLabel = document.getElementById('otherTrackLabel');
const trackButtons = Array.from(document.querySelectorAll('[data-track-btn]'));

const TRACK_KEY = 'taisk-guide-track';
const TRACKS = {
  xero: {
    label: 'Xero',
    done: 'You signed up, connected a client through Xero, and the first forecast is being built. Adding the next client only takes the last four steps.',
  },
  fa: {
    label: 'FreeAgent',
    done: 'You signed up and connected your practice once. Every FreeAgent business is now a client in TAISK, and the forecasts are building in the background.',
  },
};

let track = readTrack();
let index = 0;

function readTrack() {
  try {
    const saved = localStorage.getItem(TRACK_KEY);
    if (saved && TRACKS[saved]) return saved;
  } catch (error) {
    /* storage unavailable */
  }
  return 'xero';
}

function saveTrack() {
  try {
    localStorage.setItem(TRACK_KEY, track);
  } catch (error) {
    /* storage unavailable */
  }
}

const sequence = () => allSlides.filter((slide) => slide.dataset.track === 'shared' || slide.dataset.track === track);
const stepsIn = (list) => list.filter((slide) => slide.dataset.kind === 'step');
const totalSteps = () => stepsIn(sequence()).length;
const stepNumber = (slide) => stepsIn(sequence()).indexOf(slide) + 1;
const currentSlide = () => sequence()[index];
const indexOfKey = (key) => sequence().findIndex((slide) => slide.dataset.key === key);

function labelFor(slide) {
  if (slide.dataset.kind === 'cover') return 'Before you start';
  if (slide.dataset.kind === 'end') return 'All done';
  return `Step ${stepNumber(slide)} of ${totalSteps()}`;
}

function nameFor(slide) {
  if (!slide) return '';
  if (slide.dataset.kind === 'step') return `Step ${stepNumber(slide)}`;
  if (slide.dataset.kind === 'end') return 'Finish';
  return slide.dataset.title;
}

function buildDots() {
  dots.innerHTML = '';
  stepsIn(sequence()).forEach((slide) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot';
    dot.dataset.key = slide.dataset.key;
    dot.setAttribute('aria-label', `Step ${stepNumber(slide)}: ${slide.dataset.title}`);
    dot.addEventListener('click', () => go(indexOfKey(slide.dataset.key)));
    dots.append(dot);
  });
}

function buildOverview() {
  overviewGrid.innerHTML = '';
  stepsIn(sequence()).forEach((slide) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.key = slide.dataset.key;
    const image = slide.querySelector('.shot img');
    button.innerHTML = `
      ${image ? `<img src="${image.getAttribute('src')}" alt="" loading="lazy">` : ''}
      <span class="card__text">
        <span class="card__num">Step ${stepNumber(slide)} · ${TRACKS[track].label}</span>
        <span class="card__title">${slide.dataset.title}</span>
      </span>`;
    button.addEventListener('click', () => {
      closeOverview();
      go(indexOfKey(slide.dataset.key));
    });
    item.append(button);
    overviewGrid.append(item);
  });
}

function buildCoverThumbs() {
  coverThumbs.innerHTML = '';
  stepsIn(sequence()).forEach((slide) => {
    const figure = document.createElement('figure');
    figure.className = 'thumb';
    const image = slide.querySelector('.shot img');
    figure.innerHTML = `
      ${image ? `<img src="${image.getAttribute('src')}" alt="">` : `<span class="thumb__blank">${slide.dataset.short}</span>`}
      <figcaption><b>${stepNumber(slide)}</b> ${slide.dataset.short}</figcaption>`;
    coverThumbs.append(figure);
  });
  const end = document.createElement('figure');
  end.className = 'thumb thumb--end';
  end.innerHTML = '<figcaption>That\'s it</figcaption>';
  coverThumbs.append(end);
}

function buildRecapAndCopy() {
  recap.innerHTML = '';
  stepsIn(sequence()).forEach((slide) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${slide.dataset.key}`;
    link.textContent = slide.dataset.short;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      go(indexOfKey(slide.dataset.key));
    });
    item.append(link);
    recap.append(item);
  });

  doneLead.textContent = TRACKS[track].done;
  otherTrackLabel.textContent = track === 'xero' ? 'Show me the FreeAgent steps' : 'Show me the Xero steps';
  trackButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.trackBtn === track));
  });
}

function buildEyebrows() {
  allSlides.forEach((slide) => {
    const eyebrow = slide.querySelector('[data-eyebrow]');
    if (!eyebrow) return;
    const label = `Step ${stepNumber(slide)} of ${totalSteps()}`;
    eyebrow.textContent = label;
    if (eyebrow.dataset.suffix) {
      const tag = document.createElement('span');
      tag.className = 'eyebrow__track';
      tag.textContent = eyebrow.dataset.suffix;
      eyebrow.append(tag);
    }
  });
}

function render(options = {}) {
  const { push = true, rebuild = false } = options;
  const list = sequence();
  const active = list[index];

  allSlides.forEach((slide) => {
    const isActive = slide === active;
    slide.classList.toggle('is-active', isActive);
    slide.hidden = !isActive;
  });

  if (rebuild) {
    buildEyebrows();
    buildDots();
    buildOverview();
    buildCoverThumbs();
    buildRecapAndCopy();
  }

  counter.textContent = labelFor(active);
  const step = active.dataset.kind === 'step' ? stepNumber(active) : active.dataset.kind === 'end' ? totalSteps() : 0;
  rail.setAttribute('aria-valuemax', String(totalSteps()));
  rail.setAttribute('aria-valuenow', String(step));
  railFill.style.width = `${(step / totalSteps()) * 100}%`;

  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === list.length - 1;

  prevName.textContent = index === 0 ? 'Start' : nameFor(list[index - 1]);
  nextName.textContent = index === list.length - 1 ? 'Finished' : nameFor(list[index + 1]);

  prevBtn.setAttribute('aria-label', index === 0 ? 'Previous step' : `Previous: ${nameFor(list[index - 1])}`);
  nextBtn.setAttribute('aria-label', index === list.length - 1 ? 'You are at the end' : `Next: ${nameFor(list[index + 1])}`);

  dots.querySelectorAll('.dot').forEach((dot) => {
    const dotIndex = indexOfKey(dot.dataset.key);
    if (dotIndex === index) dot.setAttribute('aria-current', 'step');
    else dot.removeAttribute('aria-current');
    dot.classList.toggle('is-visited', dotIndex < index);
  });

  overviewGrid.querySelectorAll('button').forEach((button) => {
    if (button.dataset.key === active.dataset.key) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });

  live.textContent = `${labelFor(active)}. ${active.dataset.title}`;

  if (push) {
    const key = active.dataset.key;
    if (window.location.hash !== `#${key}`) {
      history.pushState({ index }, '', `#${key}`);
    }
  }

  document.title = `${active.dataset.title} · TAISK Practice Portal`;
  window.scrollTo(0, 0);
}

function go(target) {
  const list = sequence();
  const next = Math.max(0, Math.min(list.length - 1, target));
  if (next === index) return;
  index = next;
  render();
}

function setTrack(nextTrack) {
  if (!TRACKS[nextTrack] || nextTrack === track) return;
  track = nextTrack;
  saveTrack();

  const previousKey = currentSlide().dataset.key;
  const list = sequence();
  const stillThere = list.findIndex((slide) => slide.dataset.key === previousKey);
  index = stillThere === -1 ? list.findIndex((slide) => slide.dataset.track === track) : stillThere;

  render({ rebuild: true });
}

function chooseTrack(nextTrack) {
  track = nextTrack;
  saveTrack();
  const list = sequence();
  index = list.findIndex((slide) => slide.dataset.track === nextTrack);
  render({ rebuild: true });
}

/* Lightbox */

function openLightbox(src) {
  lightboxImg.src = src;
  lightboxImg.alt = 'Enlarged screenshot';
  lightbox.hidden = false;
  lightboxClose.focus();
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.removeAttribute('src');
  document.body.style.overflow = '';
}

/* Overview */

let overviewOpener = null;

function openOverview() {
  overviewOpener = document.activeElement;
  overview.hidden = false;
  document.body.style.overflow = 'hidden';
  overviewClose.focus();
}

function closeOverview() {
  overview.hidden = true;
  document.body.style.overflow = '';
  if (overviewOpener) overviewOpener.focus();
}

/* Wiring */

document.querySelectorAll('[data-zoom]').forEach((button) => {
  button.addEventListener('click', () => openLightbox(button.dataset.zoom));
});

document.querySelectorAll('[data-next]').forEach((button) => {
  button.addEventListener('click', () => go(index + 1));
});

document.querySelectorAll('[data-restart]').forEach((button) => {
  button.addEventListener('click', () => go(0));
});

document.querySelectorAll('[data-overview]').forEach((button) => {
  button.addEventListener('click', openOverview);
});

document.querySelectorAll('[data-choose]').forEach((button) => {
  button.addEventListener('click', () => chooseTrack(button.dataset.choose));
});

document.querySelectorAll('[data-switch-other]').forEach((button) => {
  button.addEventListener('click', () => {
    const other = track === 'xero' ? 'fa' : 'xero';
    track = other;
    saveTrack();
    index = sequence().findIndex((slide) => slide.dataset.track === other);
    render({ rebuild: true });
  });
});

trackButtons.forEach((button) => {
  button.addEventListener('click', () => setTrack(button.dataset.trackBtn));
});

prevBtn.addEventListener('click', () => go(index - 1));
nextBtn.addEventListener('click', () => go(index + 1));
lightboxClose.addEventListener('click', closeLightbox);
overviewClose.addEventListener('click', closeOverview);

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

overview.addEventListener('click', (event) => {
  if (event.target === overview) closeOverview();
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  const key = link.hash.slice(1);
  link.addEventListener('click', (event) => {
    const target = indexOfKey(key);
    if (target === -1) return;
    event.preventDefault();
    go(target);
  });
});

document.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);

  if (event.key === 'Escape') {
    if (!lightbox.hidden) return closeLightbox();
    if (!overview.hidden) return closeOverview();
    return;
  }

  if (!lightbox.hidden) return;
  if (typing) return;

  if (!overview.hidden) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      closeOverview();
      go(index + direction);
      event.preventDefault();
    }
    return;
  }

  switch (event.key) {
    case 'ArrowRight':
    case 'PageDown':
    case 'n':
    case ' ':
      go(index + 1);
      event.preventDefault();
      break;
    case 'ArrowLeft':
    case 'PageUp':
    case 'p':
      go(index - 1);
      event.preventDefault();
      break;
    case 'Home':
      go(0);
      event.preventDefault();
      break;
    case 'End':
      go(sequence().length - 1);
      event.preventDefault();
      break;
    case 'o':
    case 'O':
      openOverview();
      event.preventDefault();
      break;
    default:
      break;
  }
});

/* Touch swipe */

let touchStartX = 0;
let touchStartY = 0;
let touching = false;

document.addEventListener('touchstart', (event) => {
  if (!lightbox.hidden || !overview.hidden) return;
  touching = true;
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (event) => {
  if (!touching) return;
  touching = false;
  const dx = event.changedTouches[0].clientX - touchStartX;
  const dy = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
  go(index + (dx < 0 ? 1 : -1));
}, { passive: true });

/* History */

window.addEventListener('popstate', () => {
  const key = window.location.hash.slice(1);
  const slide = allSlides.find((item) => item.dataset.key === key);
  if (slide && slide.dataset.track !== 'shared' && slide.dataset.track !== track) {
    track = slide.dataset.track;
    saveTrack();
  }
  const target = indexOfKey(key);
  index = target === -1 ? 0 : target;
  render({ push: false, rebuild: true });
});

function startFromHash() {
  const key = window.location.hash.slice(1);
  const slide = allSlides.find((item) => item.dataset.key === key);
  if (slide && slide.dataset.track !== 'shared') {
    track = slide.dataset.track;
    saveTrack();
  }
  index = Math.max(0, sequence().findIndex((item) => item.dataset.key === key));
  render({ push: false, rebuild: true });
  if (window.location.hash !== `#${currentSlide().dataset.key}`) {
    history.replaceState({ index }, '', `#${currentSlide().dataset.key}`);
  }
}

startFromHash();
