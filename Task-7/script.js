let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentEditId = null;

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateStats();
}

function updateStats() {
    const pending = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    document.getElementById('stats-pending').textContent = `${pending} Pending`;
    document.getElementById('stats-completed').textContent = `${completed} Completed`;
}

function renderTasks(filteredTasks) {
    const container = document.getElementById('task-container');
    container.innerHTML = '';

    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-20 text-zinc-500">
                <i class="fas fa-clipboard text-6xl mb-4 opacity-30"></i>
                <p class="text-xl">No tasks found</p>
            </div>`;
        return;
    }

    filteredTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card bg-zinc-900 border ${task.completed ? 'border-emerald-500/30' : 'border-zinc-700'} rounded-3xl p-6`;
        card.dataset.id = task.id;
        card.dataset.status = task.completed ? 'completed' : 'pending';
        card.dataset.category = task.category;

        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <span onclick="toggleComplete(${task.id})" class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${task.completed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'} cursor-pointer">
                        ${task.category.toUpperCase()}
                    </span>
                </div>
                <div class="flex gap-2">
                    <button onclick="editTask(${task.id}); event.stopImmediatePropagation()" class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 rounded-xl transition-colors">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteTask(${task.id}); event.stopImmediatePropagation()" class="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div onclick="toggleComplete(${task.id})" class="cursor-pointer">
                <h3 class="text-xl font-medium mb-2 ${task.completed ? 'completed' : ''}">${task.title}</h3>
                <p class="text-xs text-zinc-500">Created: ${new Date(task.createdAt).toLocaleDateString()}</p>
            </div>
            
            <div class="mt-6 pt-6 border-t border-zinc-800 flex justify-between items-center">
                <button onclick="toggleComplete(${task.id}); event.stopImmediatePropagation()" class="flex items-center gap-2 text-sm ${task.completed ? 'text-emerald-400' : 'text-zinc-400 hover:text-emerald-400'} transition-colors">
                    <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                    <span>${task.completed ? 'Completed' : 'Mark Done'}</span>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function addTask(e) {
    e.preventDefault();
    const titleInput = document.getElementById('task-title');
    const categorySelect = document.getElementById('task-category');
    
    if (!titleInput.value.trim()) return;

    const newTask = {
        id: Date.now(),
        title: titleInput.value.trim(),
        category: categorySelect.value,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask);
    saveTasks();
    renderTasks(getFilteredTasks());
    
    titleInput.value = '';
    
    const btn = e.target.querySelector('button');
    const original = btn.innerHTML;
    btn.innerHTML = '✅ ADDED!';
    setTimeout(() => btn.innerHTML = original, 1200);
}

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks(getFilteredTasks());
    }
}

function deleteTask(id) {
    if (confirm('Delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks(getFilteredTasks());
    }
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    currentEditId = id;
    document.getElementById('edit-title').value = task.title;
    document.getElementById('edit-category').value = task.category;
    document.getElementById('edit-modal').classList.remove('hidden');
}

function saveEdit() {
    if (!currentEditId) return;
    const task = tasks.find(t => t.id === currentEditId);
    if (task) {
        task.title = document.getElementById('edit-title').value.trim();
        task.category = document.getElementById('edit-category').value;
        saveTasks();
        renderTasks(getFilteredTasks());
    }
    cancelEdit();
}

function cancelEdit() {
    currentEditId = null;
    document.getElementById('edit-modal').classList.add('hidden');
}

function clearAllTasks() {
    if (confirm('Clear ALL tasks?')) {
        tasks = [];
        saveTasks();
        renderTasks([]);
    }
}

function getFilteredTasks() {
    if (currentFilter === 'pending') return tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
}

function filterTasks(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderTasks(getFilteredTasks());
}

function searchTasks() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    if (!query) {
        renderTasks(getFilteredTasks());
        return;
    }
    const filtered = tasks.filter(task => task.title.toLowerCase().includes(query));
    renderTasks(filtered);
}

// Theme
function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    const icon = document.getElementById('theme-icon');
    const text = document.getElementById('theme-text');
    if (saved === 'dark') {
        icon.classList.replace('fa-moon', 'fa-sun');
        text.textContent = 'Light Mode';
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    initTheme();
}

// Event Propagation Demo
function demoClick(e) {
    e.stopImmediatePropagation();
    document.getElementById('bubbling-log').textContent = '';
    document.getElementById('capturing-log').textContent = '';

    const gp = document.getElementById('grandparent');
    const p = document.getElementById('parent');
    const c = document.getElementById('child');

    const capLog = [], bubLog = [];

    const captureHandler = (ev) => {
        capLog.push(ev.currentTarget.id.charAt(0).toUpperCase() + ev.currentTarget.id.slice(1));
        document.getElementById('capturing-log').textContent = capLog.join('\n');
    };

    const bubbleHandler = (ev) => {
        bubLog.push(ev.currentTarget.id.charAt(0).toUpperCase() + ev.currentTarget.id.slice(1));
        document.getElementById('bubbling-log').textContent = bubLog.join('\n');
    };

    gp.addEventListener('click', captureHandler, {once: true});
    p.addEventListener('click', captureHandler, {once: true});
    c.addEventListener('click', captureHandler, {once: true});

    setTimeout(() => {
        c.addEventListener('click', bubbleHandler, {once: true});
        p.addEventListener('click', bubbleHandler, {once: true});
        gp.addEventListener('click', bubbleHandler, {once: true});
        e.target.click();
    }, 10);
}

// Attributes vs Properties Demo
function demoAttributes() {
    console.log('%c=== Attributes vs Properties Demo ===', 'color:#eab308; font-size:14px');
    const demoInput = document.createElement('input');
    demoInput.setAttribute('value', 'Initial');
    demoInput.value = 'Changed';
    console.log('getAttribute("value"):', demoInput.getAttribute('value'));
    console.log('input.value (property):', demoInput.value);
    console.log('%c→ getAttribute returns HTML attribute. .value is the live DOM property.', 'color:#888');
}

function initialize() {
    document.getElementById('task-form').addEventListener('submit', addTask);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    initTheme();
    renderTasks(tasks);
    updateStats();
    
    setTimeout(demoAttributes, 1000);

    document.addEventListener('keydown', e => {
        if (e.key === '/' && document.getElementById('search-input') !== document.activeElement) {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
    });
}

window.onload = initialize;
