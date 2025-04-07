const themeToggle = document.querySelector('.theme-toggle');
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme === 'dark');
  } else {
    setTheme(prefersDarkMode.matches);
  }
}

themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(!isDark);
});

prefersDarkMode.addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches);
  }
});

function initDateTimeClock() {
  updateDateTime();
  setInterval(updateDateTime, 1000);
}

function initFunFact() {
  const funFactWidget = document.getElementById('fun-fact');
  fetch('https://uselessfacts.jsph.pl/random.json?language=en')
    .then(response => response.json())
    .then(data => {
      funFactWidget.textContent = `${data.text}`;
    })
    .catch(() => {
      funFactWidget.textContent = 'We couldn\'t retrieve the fun fact. Please try again later.';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initDateTimeClock();
    initFunFact();
});
