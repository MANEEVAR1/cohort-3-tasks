// script.js
function openFeatures() {
  document.querySelectorAll(".elem").forEach(elem => {
    elem.addEventListener("click", () => {
      document.getElementById(`fullElem${elem.id}`).style.display = "block"; // Wait, fix IDs below
    });
  });
  document.querySelectorAll(".back").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.parentElement.style.display = "none";
    });
  });
}

// Fix fullElem IDs in HTML or use querySelector
document.querySelectorAll('.fullElem').forEach((el, i) => el.id = `fullElem${i}`);

openFeatures();

function weatherFunctionality() {
  const apiKey = WEATHER_API_KEY;
  const city = "London"; // Change as needed

  async function getWeather() {
    try {
      const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`);
      const data = await res.json();
      document.querySelector('.header2 h2').textContent = `${data.current.temp_c}°C`;
      document.querySelector('.header2 h4').textContent = data.current.condition.text;
      document.querySelector('.Humidity').textContent = `Humidity: ${data.current.humidity}%`;
      document.querySelector('.Wind').textContent = `Wind: ${data.current.wind_kph} km/h`;
    } catch(e) { console.log("Weather unavailable"); }
  }
  getWeather();
}

weatherFunctionality();

// Live Clock
function updateTime() {
  const now = new Date();
  const options = { weekday: 'long', hour: 'numeric', minute: '2-digit' };
  document.querySelector('.header1 h1').textContent = now.toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'});
  document.querySelector('.header1 h2').textContent = now.toLocaleDateString('en-US', {day:'numeric', month:'long', year:'numeric'});
}
setInterval(updateTime, 1000);
updateTime();

// Todo List
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
function renderTasks() {
  const container = document.querySelector('.allTask');
  container.innerHTML = tasks.map((t, i) => `
    <div class="task">
      <div>
        <strong>${t.text}</strong>
        ${t.details ? `<p>${t.details}</p>` : ''}
      </div>
      <button onclick="completeTask(${i})">Done</button>
    </div>
  `).join('');
}
window.completeTask = (i) => { tasks.splice(i, 1); localStorage.setItem('tasks', JSON.stringify(tasks)); renderTasks(); };
document.querySelector('.todo-list-fullpage form').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('task-input');
  const details = document.querySelector('.todo-list-fullpage textarea');
  if (input.value) {
    tasks.push({text: input.value, details: details.value});
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    input.value = ''; details.value = '';
  }
});
renderTasks();

// Similar for Goals (copy todo logic, target .allGoals and #goal-input)
let goals = JSON.parse(localStorage.getItem('goals')) || [];
// ... (mirror the todo code for goals)

// Pomodoro
let timeLeft = 25 * 60;
let timerId = null;
const timerDisplay = document.querySelector('.pomo-timer h1');

function updateDisplay() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  timerDisplay.textContent = `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

document.querySelector('.start-timer').addEventListener('click', () => {
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      clearInterval(timerId);
      alert("Session complete! Take a break.");
    }
  }, 1000);
});

document.querySelector('.pause-timer').addEventListener('click', () => clearInterval(timerId));
document.querySelector('.reset-timer').addEventListener('click', () => {
  clearInterval(timerId);
  timeLeft = 25 * 60;
  updateDisplay();
});
updateDisplay();

// Quote
async function loadQuote() {
  try {
    const res = await fetch('https://quotes.freeapi.app/api/v1/public/quotes/quote/random');
    const data = await res.json();
    document.querySelector('.motivation-2 h1').textContent = data.data.content;
    document.querySelector('.motivation-3 h2').textContent = `— ${data.data.author}`;
  } catch {
    document.querySelector('.motivation-2 h1').textContent = "The only way to do great work is to love what you do.";
  }
}
loadQuote();

// Theme
document.querySelector('.theme').addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  const icon = document.querySelector('.theme i');
  icon.classList.toggle('ri-sun-line');
  icon.classList.toggle('ri-moon-line');
});

// Swiper init (mobile)
if (window.innerWidth <= 768) {
  new Swiper('.features-swiper', { slidesPerView: 'auto', spaceBetween: 20 });
}
