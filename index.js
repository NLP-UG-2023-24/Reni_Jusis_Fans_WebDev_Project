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

function openTab(evt, tabId) {
  const contents = document.querySelectorAll(".tab-content");
  const buttons = document.querySelectorAll(".tab-button");

  contents.forEach(c => c.classList.remove("active"));
  buttons.forEach(b => b.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  evt.currentTarget.classList.add("active");
}

document.addEventListener('DOMContentLoaded', function () {
  initTheme();
});
