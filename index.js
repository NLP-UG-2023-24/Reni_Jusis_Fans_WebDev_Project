// accessibility: dark mode, contrast, grayscale, font size

function initAccessibility() {
    const FONT_STEP = 1; // 1px change per click
    const MIN_FONT_SIZE = 12;
    const MAX_FONT_SIZE = 24;
    const DEFAULT_FONT_SIZE = 16;

    const btnDarkMode = document.getElementById('acc-dark-mode');
    const btnHighContrast = document.getElementById('acc-high-contrast');
    const btnFontIncrease = document.getElementById('acc-font-increase');
    const btnFontDecrease = document.getElementById('acc-font-decrease');
    const btnFontReset = document.getElementById('acc-font-reset');
    const btnGrayscale = document.getElementById('acc-grayscale');
    const root = document.documentElement;

    // localstorage settings
    let isDarkMode = localStorage.getItem('isDarkMode') ? localStorage.getItem('isDarkMode') === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    let isHighContrast = localStorage.getItem('isHighContrast') === 'true';
    let isGrayscale = localStorage.getItem('isGrayscale') === 'true';
    let fontSize = parseInt(localStorage.getItem('fontSize') || DEFAULT_FONT_SIZE, 10);

    const applyTheme = () => {
        if (isHighContrast) {
            root.setAttribute('data-theme', 'high-contrast');
            btnHighContrast.classList.add('active');
            btnDarkMode.classList.remove('active');
        } else {
            root.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
            btnHighContrast.classList.remove('active');
            btnDarkMode.classList.toggle('active', isDarkMode);
        }
    };

    const applyEffects = () => {
        root.setAttribute('data-effect', isGrayscale ? 'grayscale' : '');
        btnGrayscale.classList.toggle('active', isGrayscale);
    };

    const applyFontSize = () => {
        root.style.setProperty('--base-font-size', `${fontSize}px`);
    };

    btnDarkMode.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('isDarkMode', isDarkMode);
        if (isHighContrast) {
            isHighContrast = false;
            localStorage.setItem('isHighContrast', isHighContrast);
        }
        applyTheme();
    });

    btnHighContrast.addEventListener('click', () => {
        isHighContrast = !isHighContrast;
        localStorage.setItem('isHighContrast', isHighContrast);
        applyTheme();
    });

    btnGrayscale.addEventListener('click', () => {
        isGrayscale = !isGrayscale;
        localStorage.setItem('isGrayscale', isGrayscale);
        applyEffects();
    });

    btnFontIncrease.addEventListener('click', () => {
        if (fontSize < MAX_FONT_SIZE) {
            fontSize += FONT_STEP;
            localStorage.setItem('fontSize', fontSize);
            applyFontSize();
        }
    });

    btnFontDecrease.addEventListener('click', () => {
        if (fontSize > MIN_FONT_SIZE) {
            fontSize -= FONT_STEP;
            localStorage.setItem('fontSize', fontSize);
            applyFontSize();
        }
    });

    btnFontReset.addEventListener('click', () => {
        fontSize = DEFAULT_FONT_SIZE;
        localStorage.setItem('fontSize', fontSize);
        applyFontSize();
    });

    applyTheme();
    applyEffects();
    applyFontSize();
}

// date & time

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

// fun fact

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

// todo function A RIGHT MESS but it works!

function initTodoList() {
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const todoListUL = document.getElementById('todo-list');
    const deleteAllBtn = document.getElementById('delete-all-btn');

    if (!todoInput || !addTodoBtn || !todoListUL || !deleteAllBtn) {
        console.warn("Todo list elements not found. Skipping initTodoList.");
        return;
    }

    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    const saveTodos = () => {
        localStorage.setItem('todos', JSON.stringify(todos));
    };

    const renderTodos = () => {
        todoListUL.innerHTML = '';

        if (todos.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.textContent = 'No tasks yet.';
            emptyLi.style.textAlign = 'center';
            emptyLi.style.opacity = '0.7';
            todoListUL.appendChild(emptyLi);
        } else {
            todos.forEach((todo, index) => {
                const li = document.createElement('li');
                li.className = 'todo-item';
                if (todo.completed) {
                    li.classList.add('completed');
                }

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = todo.completed;
                checkbox.addEventListener('change', () => {
                    todos[index].completed = !todos[index].completed;
                    saveTodos();
                    renderTodos();
                });

                const textSpan = document.createElement('span');
                textSpan.className = 'task-text';
                textSpan.textContent = todo.text;
                textSpan.addEventListener('click', () => {
                    const editInput = document.createElement('input');
                    editInput.type = 'text';
                    editInput.className = 'edit-input';
                    editInput.value = todo.text;
                    li.replaceChild(editInput, textSpan);
                    editInput.focus();

                    const saveEdit = () => {
                        const newText = editInput.value.trim();
                        if (newText) {
                            todos[index].text = newText;
                            saveTodos();
                        }
                        renderTodos();
                    };

                    editInput.addEventListener('blur', saveEdit);
                    editInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            editInput.blur();
                        }
                    });
                });

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '🗑️';
                deleteBtn.setAttribute('aria-label', 'Delete task');
                deleteBtn.addEventListener('click', () => {
                    todos.splice(index, 1);
                    saveTodos();
                    renderTodos();
                });

                li.appendChild(checkbox);
                li.appendChild(textSpan);
                li.appendChild(deleteBtn);
                todoListUL.appendChild(li);
            });
        }

        const allCompleted = todos.length > 0 && todos.every(todo => todo.completed);
        deleteAllBtn.style.display = allCompleted ? 'block' : 'none';
        todoListUL.classList.toggle('hide-delete', allCompleted);
    };

    const addTodo = () => {
        const taskText = todoInput.value.trim();
        if (taskText) {
            todos.push({
                text: taskText,
                completed: false
            });
            todoInput.value = '';
            saveTodos();
            renderTodos();
        }
    };

    const deleteAllCompleted = () => {
        todos = [];
        saveTodos();
        renderTodos();
    };

    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    deleteAllBtn.addEventListener('click', deleteAllCompleted);

    renderTodos();
}

// name days

function initNameDays() {
    const countrySelector = document.getElementById('nameday-country-selector');
    const listElement = document.getElementById('nameday-list');

    if (!countrySelector || !listElement) return;

    const supportedCountries = {
        'pl': 'Poland',
        'us': 'United States',
        'at': 'Austria',
        'bg': 'Bulgaria',
        'cz': 'Czechia',
        'de': 'Germany',
        'dk': 'Denmark',
        'ee': 'Estonia',
        'es': 'Spain',
        'fi': 'Finland',
        'fr': 'France',
        'gr': 'Greece',
        'hr': 'Croatia',
        'hu': 'Hungary',
        'it': 'Italy',
        'lt': 'Lithuania',
        'lv': 'Latvia',
        'ru': 'Russia',
        'se': 'Sweden',
        'sk': 'Slovakia'
    };

    for (const code in supportedCountries) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = supportedCountries[code];
        countrySelector.appendChild(option);
    }

    const fetchAndDisplayNamedays = async (countryCode) => {
        listElement.innerHTML = '<li class="nameday-item">Finding today\'s name days...</li>';
        const url = `https://nameday.abalin.net/api/V2/today/${countryCode}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            let namesString = data.data && data.data[countryCode] ? data.data[countryCode] : null;

            if (namesString && namesString.toLowerCase() !== 'n/a') {
                const names = namesString.split(', ');
                listElement.innerHTML = '';
                names.forEach(name => {
                    const listItem = document.createElement('li');
                    listItem.className = 'nameday-item';
                    listItem.textContent = name;
                    listElement.appendChild(listItem);
                });
            } else {
                listElement.innerHTML = '<li class="nameday-item">No name days found for today.</li>';
            }
        } catch (error) {
            console.error('Error fetching name days:', error);
            listElement.innerHTML = '<li class="nameday-item">The name day calendar could not be loaded. Please try again later.</li>';
        }
    };

    countrySelector.addEventListener('change', (event) => {
        const newCountryCode = event.target.value;
        localStorage.setItem('nameDayCountry', newCountryCode);
        fetchAndDisplayNamedays(newCountryCode);
    });

    const savedCountry = localStorage.getItem('nameDayCountry') || 'pl';
    countrySelector.value = savedCountry;
    fetchAndDisplayNamedays(savedCountry);
}

// loader

document.addEventListener('DOMContentLoaded', function() {
    initAccessibility();
    initDateTimeClock();
    initFunFact();
    initBiorhythm();
    initTodoList();
    initNameDays();
});

// modal

const modal = document.getElementById("myModal");
const span = document.getElementsByClassName("close")[0];

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

window.onload = () => {
    modal.style.display = "block";
};
const apiKey = 'k16AAOdVMWsolqJF4wtTpulACLjWPBtX';

async function getLocationKey(lat, lon) {
  const url = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${apiKey}&q=${lat},${lon}&language=en-en`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Location error');
  const data = await response.json();
  return {
    key: data.Key,
    name: `${data.LocalizedName}, ${data.AdministrativeArea.LocalizedName}`
  };
}

async function getCurrentWeather(locationKey) {
  const url = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}&language=pl-pl&details=true`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Location error');
  const data = await response.json();
  return data[0];
}

async function getWeather() {
  const weatherDiv = document.getElementById('weather');
  weatherDiv.innerHTML = 'loading location...';

  if (!navigator.geolocation) {
    weatherDiv.innerHTML = 'loading location...';

    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    try {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const location = await getLocationKey(lat, lon);
      const weather = await getCurrentWeather(location.key);

      weatherDiv.innerHTML = `
        <h2>${location.name}</h2>
        <p><strong>Temperatura:</strong> ${weather.Temperature.Metric.Value} °C</p>
        <p><strong>Opis:</strong> ${weather.WeatherText}</p>
        <p><strong>Wilgotność:</strong> ${weather.RelativeHumidity}%</p>
        <p><strong>Wiatr:</strong> ${weather.Wind.Speed.Metric.Value} km/h</p>
      `;
    } catch (err) {
      weatherDiv.innerHTML = `<p style="color:red;">mistake: ${err.message}</p>`;
    }
  }, () => {
    weatherDiv.innerHTML = 'Cannot find';
  });
}
