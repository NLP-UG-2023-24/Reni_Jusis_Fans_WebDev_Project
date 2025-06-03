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

function updateDateTime() {
    const now = new Date();
    document.getElementById('time').textContent = now.toLocaleTimeString();
    document.getElementById('date').textContent = now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function initDateTimeClock() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

function initFunFact() {
    const funFactWidget = document.getElementById('fun-fact');
    fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
        .then(response => response.json())
        .then(data => {
            funFactWidget.textContent = `${data.text}`;
        })
        .catch(() => {
            funFactWidget.textContent = 'We couldn\'t retrieve the fun fact. Please try again later.';
        });
}

// biorhythm stuff

function daysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    return Math.round(Math.abs((date1 - date2) / oneDay));
}

function calculateBiorhythm(days, cycle) {
    return Math.sin((2 * Math.PI * days) / cycle);
}

function updateBiorhythms() {
    const birthdateInput = document.getElementById('birthdate-input');
    const resultsDiv = document.getElementById('biorhythm-results');
    const birthdateString = birthdateInput.value;

    if (!birthdateString) {
        resultsDiv.innerHTML = 'Please select your date of birth.';
        return;
    }

    const birthDate = new Date(birthdateString);
    const today = new Date();

    if (birthDate > today) {
        resultsDiv.innerHTML = 'Date of birth cannot be in the future.';
        return;
    }

    localStorage.setItem('userBirthdate', birthdateString);

    const daysSinceBirth = daysBetween(today, birthDate);

    const physical = calculateBiorhythm(daysSinceBirth, 23);
    const emotional = calculateBiorhythm(daysSinceBirth, 28);
    const intellectual = calculateBiorhythm(daysSinceBirth, 33);

    resultsDiv.innerHTML = `
                <p>Physical: ${(physical * 100).toFixed(1)}%</p>
                <p>Emotional: ${(emotional * 100).toFixed(1)}%</p>
                <p>Intellectual: ${(intellectual * 100).toFixed(1)}%</p>
                <small>Based on ${daysSinceBirth} days since birth.</small>
            `;
}

function initBiorhythm() {
    const calculateButton = document.getElementById('calculate-biorhythm');
    const birthdateInput = document.getElementById('birthdate-input');
    const savedBirthdate = localStorage.getItem('userBirthdate');

    if (savedBirthdate) {
        birthdateInput.value = savedBirthdate;
        updateBiorhythms();
    }

    calculateButton.addEventListener('click', updateBiorhythms);
}

document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initDateTimeClock();
    initFunFact();
    initBiorhythm();
});
