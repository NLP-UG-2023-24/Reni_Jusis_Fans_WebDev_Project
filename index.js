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

let countdownInterval;
let totalSeconds = 0;

function updateDateTime() {
    const now = new Date();
    const timeEl = document.getElementById('time');
    const dateEl = document.getElementById('date');
    if (timeEl) timeEl.textContent = now.toLocaleTimeString();
    if (dateEl) dateEl.textContent = now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function updateTimerDisplay() {
    const display = document.getElementById('timer-display');
    if (!display) return;
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    display.innerHTML = `<span class="math-inline">${minutes}:</span>${seconds}`;
}

function startPauseTimer() {
    const startBtn = document.getElementById('timer-start-btn');
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        startBtn.textContent = 'Resume';
    } else {
        const minutesInput = document.getElementById('timer-minutes');
        const secondsInput = document.getElementById('timer-seconds');

        if (totalSeconds === 0) {
             const minutes = parseInt(minutesInput.value, 10) || 0;
             const seconds = parseInt(secondsInput.value, 10) || 0;
             totalSeconds = (minutes * 60) + seconds;
        }

        if (totalSeconds > 0) {
             countdownInterval = setInterval(() => {
                totalSeconds--;
                updateTimerDisplay();
                if (totalSeconds <= 0) {
                    clearInterval(countdownInterval);
                    countdownInterval = null;
                    alert("Time's up!");
                    startBtn.textContent = 'Start';
                }
            }, 1000);
            startBtn.textContent = 'Pause';
        }
    }
}

function resetTimer() {
    clearInterval(countdownInterval);
    countdownInterval = null;
    totalSeconds = 0;
    updateTimerDisplay();
    document.getElementById('timer-start-btn').textContent = 'Start';
    document.getElementById('timer-minutes').value = '';
    document.getElementById('timer-seconds').value = '';
}

function initDateTimeClock() {
    updateDateTime();
    setInterval(updateDateTime, 1000);

    document.getElementById('timer-start-btn')?.addEventListener('click', startPauseTimer);
    document.getElementById('timer-reset-btn')?.addEventListener('click', resetTimer);

    updateTimerDisplay();
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

// holidays

function initHolidays() {
  const countrySelector = document.getElementById("country-selector");
  const holidayList = document.getElementById("holiday-list");

  if (!countrySelector || !holidayList) return;

  const countries = [
    { code: "CH", name: "Switzerland" },
    { code: "US", name: "United States" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "PL", name: "Poland" },
    { code: "ES", name: "Spain" },
    { code: "IT", name: "Italy" },
    { code: "AT", name: "Austria" },
    { code: "CZ", name: "Czech Republic" },
    { code: "SK", name: "Slovakia" },
    { code: "GB", name: "United Kingdom" },
    { code: "IE", name: "Ireland" },
    { code: "NO", name: "Norway" },
    { code: "SE", name: "Sweden" },
    { code: "FI", name: "Finland" },
    { code: "NL", name: "Netherlands" },
    { code: "BE", name: "Belgium" },
    { code: "DK", name: "Denmark" },
    { code: "GR", name: "Greece" },
    { code: "PT", name: "Portugal" }
  ];

  countries.forEach(country => {
    const option = document.createElement("option");
    option.value = country.code;
    option.textContent = country.name;
    countrySelector.appendChild(option);
  });

  const savedCountry = localStorage.getItem("selectedCountry");
  if (savedCountry) {
    countrySelector.value = savedCountry;
    fetchHolidays(savedCountry);
  }

  countrySelector.addEventListener("change", () => {
    const selectedCountry = countrySelector.value;
    localStorage.setItem("selectedCountry", selectedCountry);
    fetchHolidays(selectedCountry);
  });

  async function fetchHolidays(selectedCountry) {
    holidayList.innerHTML = "";

    if (!selectedCountry) return;

    const loadingLi = document.createElement("li");
    loadingLi.className = "holiday-item";
    loadingLi.textContent = "Finding today's public holiday...";
    holidayList.appendChild(loadingLi);

    const today = new Date().toISOString().split("T")[0];

    try {
      const response = await fetch(
        `https://openholidaysapi.org/PublicHolidays?countryIsoCode=${selectedCountry}&languageIsoCode=EN&validFrom=${today}&validTo=${today}`,
        {
          headers: {
            accept: "application/json"
          }
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const holidays = await response.json();
      holidayList.innerHTML = "";

      if (holidays.length === 0) {
        const li = document.createElement("li");
        li.className = "holiday-item";
        li.textContent = "No public holiday today.";
        holidayList.appendChild(li);
        return;
      }

      holidays.forEach(holiday => {
        const li = document.createElement("li");
        li.className = "holiday-item";
        li.textContent = holiday.name.text;
        holidayList.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching holidays:", error);
      holidayList.innerHTML = "";
      const li = document.createElement("li");
      li.className = "holiday-item";
      li.textContent = "Failed to load holidays. Try again later.";
      holidayList.appendChild(li);
    }
  }
}


// loader

document.addEventListener('DOMContentLoaded', function() {
    initAccessibility();
    initDateTimeClock();
    initFunFact();
    initBiorhythm();
    initTodoList();
    initNameDays();
    initHolidays();
});

// modal

const modal = document.getElementById("myModal");
const span = document.getElementsByClassName("close")[0];

function closeModal() {
    modal.style.display = "none";
    localStorage.setItem("modalShown", "true");
}

span.onclick = closeModal;

window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

window.onload = () => {
    const hasModalBeenShown = localStorage.getItem("modalShown");
    if (!hasModalBeenShown) {
        modal.style.display = "block";
    }
};

// weather

const apiKey = 'k16AAOdVMWsolqJF4wtTpulACLjWPBtX';

async function getLocationKey(lat, lon) {
  const url = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${apiKey}&q=${lat},${lon}&language=en-us`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not retrieve location data.');
  const data = await response.json();
  return {
    key: data.Key,
    name: `${data.LocalizedName}, ${data.AdministrativeArea.LocalizedName}`
  };
}

async function getCurrentWeather(locationKey) {
  const url = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}&language=en-us&details=true`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not retrieve location data.');
  const data = await response.json();
  return data[0];
}

async function getWeather() {
  const weatherDiv = document.getElementById('weather');
  weatherDiv.innerHTML = 'Finding your location...';

  if (!navigator.geolocation) {
    weatherDiv.innerHTML = 'Finding your location...';

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
        <p><strong>Temperature:</strong> ${weather.Temperature.Metric.Value} °C</p>
        <p><strong>Conditions:</strong> ${weather.WeatherText}</p>
        <p><strong>Humidity:</strong> ${weather.RelativeHumidity}%</p>
        <p><strong>Wind:</strong> ${weather.Wind.Speed.Metric.Value} km/h</p>
      `;
    } catch (err) {
      weatherDiv.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    }
  }, () => {
    weatherDiv.innerHTML = 'Your location could not be determined. Please enable location services in your browser to get weather updates.';
  });
}

function toggleBtn() {
    const Btns = document.querySelector(".btns");
    const add = document.getElementById("add");
    const remove = document.getElementById("remove");
    const btn = document.querySelector(".btns").querySelectorAll("a");
    Btns.classList.toggle("open");
  
    if (Btns.classList.contains("open")) {
      remove.style.display = "block";
      add.style.display = "none";
      btn.forEach((e, i) => {
        setTimeout(() => {
          let bottom = 40 * i;
          e.style.bottom = bottom + "px";
        }, 100 * i);
      });
    } else {
      add.style.display = "block";
      remove.style.display = "none";
      btn.forEach(e => {
        e.style.bottom = "0px";
      });
    }
  }
  
  function openAbout(event) {
    event.stopPropagation();
    document.getElementById("about-modal").style.display = "block";
  }
  
  function closeAbout() {
    document.getElementById("about-modal").style.display = "none";
  }
  
  window.onclick = function(event) {
    const modal = document.getElementById("about-modal");
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

function initCalendarConversion() {
    const gregorianDateInput = document.getElementById('gregorian-date');
    const calendarTypeSelect = document.getElementById('calendar-type');
    const resultDiv = document.getElementById('calendar-result');

    if (!gregorianDateInput || !calendarTypeSelect || !resultDiv) {
        console.error("Calendar conversion widget elements not found.");
        return;
    }

    const convertDate = () => {
        const dateValue = gregorianDateInput.value;
        const calendarType = calendarTypeSelect.value;

        if (!dateValue) {
            resultDiv.textContent = 'Choose a date to convert';
            return;
        }

        const date = new Date(dateValue + 'T00:00:00');

        try {
            const options = {
                calendar: calendarType,
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            
            const convertedDate = new Intl.DateTimeFormat(`en-u-ca-${calendarType}`, options).format(date);
            
            resultDiv.textContent = convertedDate;
        } catch (error) {
            console.error('Error converting date:', error);
            resultDiv.textContent = 'Conversion for this date/calendar is not supported.';
        }
    };

    gregorianDateInput.addEventListener('input', convertDate);
    calendarTypeSelect.addEventListener('change', convertDate);
}
document.addEventListener('DOMContentLoaded', function () {
    initCalendarConversion();
});

