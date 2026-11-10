const slides = Array.from(document.querySelectorAll('.slide'));
const totalSteps = 7;

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

const steps = slides.filter((slide) => slide.dataset.step);
let index = 0;

const indexOfKey = (key) => slides.findIndex((slide) => slide.dataset.key === key);

const keyForIndex = (i) => slides[i].dataset.key;

function labelFor(i) {
  const slide = slides[i];
  if (slide.dataset.step) return `Step ${slide.dataset.step} of ${totalSteps}`;
  return i === 0 ? 'Before you start' : 'All done';
}

function nameFor(i) {
  if (i < 0 || i >= slides.length) return '';
  const slide = slides[i];
  return slide.dataset.step ? `Step ${slide.dataset.step}` : slide.dataset.title;
}

function buildDots() {
  steps.forEach((slide, i) => {
    const step = Number(slide.dataset.step);
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'dot';
    dot.dataset.index = String(i + 1);
    dot.setAttribute('aria-label', `Step ${step}: ${slide.dataset.title}`);
    dot.addEventListener('click', () => go(i + 1));
    dots.append(dot);
  });
}

function buildOverview() {
  steps.forEach((slide, i) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.index = String(i + 1);
    const image = slide.querySelector('.shot img');
    button.innerHTML = `
      <img src="${image ? image.getAttribute('src') : ''}" alt="" loading="lazy">
      <span class="card__text">
        <span class="card__num">Step ${slide.dataset.step}</span>
        <span class="card__title">${slide.dataset.title}</span>
      </span>`;
    button.addEventListener('click', () => {
      closeOverview();
      go(i + 1);
    });
    item.append(button);
    overviewGrid.append(item);
  });
}

function render(options = {}) {
  const { push = true } = options;

  slides.forEach((slide, i) => {
    const active = i === index;
    slide.classList.toggle('is-active', active);
    slide.hidden = !active;
  });

  const step = Number(slides[index].dataset.step) || 0;
  counter.textContent = labelFor(index);
  rail.setAttribute('aria-valuenow', String(step));
  railFill.style.width = `${(step / totalSteps) * 100}%`;

  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === slides.length - 1;

  prevName.textContent = index === 0 ? 'Start' : nameFor(index - 1);
  nextName.textContent = index === slides.length - 1 ? 'Finished' : nameFor(index + 1);

  prevBtn.setAttribute('aria-label', index === 0 ? 'Previous step' : `Previous: ${nameFor(index - 1)}`);
  nextBtn.setAttribute('aria-label', index === slides.length - 1 ? 'You are at the end' : `Next: ${nameFor(index + 1)}`);

  dots.querySelectorAll('.dot').forEach((dot) => {
    const dotStep = Number(dot.dataset.index);
    const isCurrent = dotStep === index;
    if (isCurrent) dot.setAttribute('aria-current', 'step');
    else dot.removeAttribute('aria-current');
    dot.classList.toggle('is-visited', dotStep < index);
  });

  overviewGrid.querySelectorAll('button').forEach((button) => {
    if (Number(button.dataset.index) === index) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });

  live.textContent = `${labelFor(index)}. ${slides[index].dataset.title}`;

  if (push) {
    const key = keyForIndex(index);
    if (window.location.hash !== `#${key}`) {
      history.pushState({ index }, '', `#${key}`);
    }
  }

  document.title = `${slides[index].dataset.title} · TAISK Practice Portal`;
  window.scrollTo(0, 0);
}

function go(target) {
  const next = Math.max(0, Math.min(slides.length - 1, target));
  if (next === index) return;
  index = next;
  render();
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

buildDots();
buildOverview();

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

document.querySelectorAll('a[href^="#step-"], a[href="#start"], a[href="#done"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = indexOfKey(link.hash.slice(1));
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
      const target = Math.max(0, Math.min(slides.length - 1, index + direction));
      closeOverview();
      go(target);
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
      go(slides.length - 1);
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
  const target = indexOfKey(key);
  index = target === -1 ? 0 : target;
  render({ push: false });
});

function startFromHash() {
  const key = window.location.hash.slice(1);
  const target = indexOfKey(key);
  index = target === -1 ? 0 : target;
  render({ push: false });
  if (target === -1) history.replaceState({ index }, '', `#${keyForIndex(0)}`);
}

startFromHash();
