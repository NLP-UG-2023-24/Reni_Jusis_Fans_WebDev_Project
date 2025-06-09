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

document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initDateTimeClock();
    initFunFact();
    initBiorhythm();
    initTodoList();
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
