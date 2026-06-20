const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const leadForm = document.getElementById('leadForm');
const formNote = document.getElementById('formNote');

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxuD1Yuy1hcVnIRdoNnRpK2J9wceHJwX8MEVZBFs8Cb3UnjY5QBGaUleAlvm7MGD2-xAA/exec';

document.getElementById('year').textContent = new Date().getFullYear();

menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  menuToggle.textContent = navMenu.classList.contains('active') ? '×' : '☰';
});

document.querySelectorAll('.nav a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    menuToggle.textContent = '☰';
  });
});

leadForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const service = document.getElementById('service').value;
  const message = document.getElementById('message').value.trim();

  const formData = new FormData();
  formData.append('name', name);
  formData.append('phone', phone);
  formData.append('service', service);
  formData.append('message', message);
  formData.append('source', 'Digital India Grow Website');
  formData.append('submittedAt', new Date().toLocaleString());

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    });

    formNote.style.display = 'block';
    formNote.textContent = 'Thank you. Your enquiry has been submitted successfully.';

    const num = '919871031423';

    const text =
      `Hi Digital India Grow, I am interested in your service.%0A%0A` +
      `Name: ${encodeURIComponent(name)}%0A` +
      `Phone: ${encodeURIComponent(phone)}%0A` +
      `Service: ${encodeURIComponent(service)}%0A` +
      `Message: ${encodeURIComponent(message)}`;

    window.open(`https://wa.me/${num}?text=${text}`, '_blank');

    leadForm.reset();

  } catch (error) {
    formNote.style.display = 'block';
    formNote.textContent = 'Something went wrong. Please try again.';
    console.error('Form submission error:', error);
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

function initMultiSlider(slider) {
  const track = slider.querySelector('.multi-track');
  const cards = Array.from(track.children);
  const prev = slider.querySelector('.prev');
  const next = slider.querySelector('.next');
  const dotsWrap = slider.querySelector('.slider-dots');
  let currentIndex = 0;
  let autoplay;

  function cardsPerView() {
    const desktop = parseInt(slider.dataset.desktop || '3', 10);
    const tablet = parseInt(slider.dataset.tablet || '2', 10);
    const mobile = parseInt(slider.dataset.mobile || '1', 10);

    if (window.innerWidth <= 620) return mobile;
    if (window.innerWidth <= 900) return tablet;
    return desktop;
  }

  function gapSize() {
    const style = window.getComputedStyle(track);
    return parseFloat(style.columnGap || style.gap || 20) || 20;
  }

  function maxIndex() {
    return Math.max(cards.length - cardsPerView(), 0);
  }

  function updateCardWidths() {
    const perView = cardsPerView();
    const gap = gapSize();
    const width = (slider.querySelector('.slider-viewport').clientWidth - (gap * (perView - 1))) / perView;

    cards.forEach(card => {
      card.style.flex = `0 0 ${width}px`;
      card.style.maxWidth = `${width}px`;
    });
  }

  function renderDots() {
    dotsWrap.innerHTML = '';
    const totalDots = maxIndex() + 1;

    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('button');
      dot.classList.toggle('active', i === currentIndex);
      dot.addEventListener('click', () => {
        currentIndex = i;
        update();
      });
      dotsWrap.appendChild(dot);
    }
  }

  function update() {
    updateCardWidths();

    const gap = gapSize();
    const cardWidth = cards[0] ? cards[0].getBoundingClientRect().width : 0;
    currentIndex = Math.max(0, Math.min(currentIndex, maxIndex()));

    track.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;

    Array.from(dotsWrap.children).forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function rebuild() {
    currentIndex = Math.min(currentIndex, maxIndex());
    renderDots();
    update();
  }

  function startAutoplay() {
    clearInterval(autoplay);
    autoplay = setInterval(() => {
      currentIndex = currentIndex >= maxIndex() ? 0 : currentIndex + 1;
      update();
    }, 3000);
  }

  prev.addEventListener('click', () => {
    currentIndex = currentIndex <= 0 ? maxIndex() : currentIndex - 1;
    update();
  });

  next.addEventListener('click', () => {
    currentIndex = currentIndex >= maxIndex() ? 0 : currentIndex + 1;
    update();
  });

  window.addEventListener('resize', rebuild);

  rebuild();
  startAutoplay();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(autoplay);
    } else {
      startAutoplay();
    }
  });
}

document.querySelectorAll('[data-multi-slider]').forEach(initMultiSlider);

document.querySelectorAll('.faq-item').forEach(item => {
  const question = item.querySelector('.faq-question');
  if (question) {
    question.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  }
});
