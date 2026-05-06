let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');

const progressPercentage = document.getElementById('progress-percentage');
const progressBarFill = document.getElementById('progress-bar-fill');
const encouragementNote = document.getElementById('encouragement-note');

document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('task-date').value = today;
});

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask();
});

searchInput.addEventListener('input', renderTasks);
filterStatus.addEventListener('change', renderTasks);

function addTask() {
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const category = document.getElementById('task-category').value;
    const priority = document.getElementById('task-priority').value;
    const dueDate = document.getElementById('task-date').value;

    const newTask = {
        id: Date.now(),
        title,
        description,
        category,
        priority,
        dueDate,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveToLocalStorage();
    taskForm.reset();
    renderTasks();
}

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function toggleTaskStatus(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveToLocalStorage();
        renderTasks();
    }
}

function deleteTask(id) {
    if (confirm('Hapus tugas ini? Sayang banget loh 🥺')) {
        tasks = tasks.filter(t => t.id !== id);
        saveToLocalStorage();
        renderTasks();
    }
}

function renderTasks() {
    taskList.innerHTML = '';
    
    // Hitung Persentase & Status Progress
    updateProgressBar();

    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterStatus.value;

    let filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) || 
                              task.category.toLowerCase().includes(searchTerm);

        let matchesFilter = true;
        if (filterValue === 'active') {
            matchesFilter = !task.completed;
        } else if (filterValue === 'completed') {
            matchesFilter = task.completed;
        }

        return matchesSearch && matchesFilter;
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<p class="empty-msg" style="grid-column: 1/-1; text-align: center; color: var(--text-muted); margin-top: 1rem;">Tidak ada tugas yang ditemukan ✨</p>`;
        return;
    }

    filteredTasks.forEach(task => {
        const taskCard = document.createElement('div');
        taskCard.className = `task-card ${task.completed ? 'completed' : ''}`;

        // Mengubah emoticon tergantung status task
        const actionIcon = task.completed ? '↩️' : '✔️';
        const cardActionClass = task.completed ? 'completed-glow' : '';

        taskCard.innerHTML = `
            <div class="task-header">
                <span class="badge-category">${task.category}</span>
                <span class="badge-priority ${task.priority}">${task.priority}</span>
            </div>
            <div class="task-content">
                <h3>${task.title} ${task.completed ? '🎉' : '📌'}</h3>
                <p>${task.description || 'Tidak ada catatan.'}</p>
            </div>
            <div class="task-footer">
                <span class="task-date">📅 ${formatDate(task.dueDate)}</span>
                <div class="task-actions">
                    <button class="btn-action done" onclick="toggleTaskStatus(${task.id})" title="Selesai/Belum Selesai">
                        ${actionIcon}
                    </button>
                    <button class="btn-action delete" onclick="deleteTask(${task.id})" title="Hapus Tugas">
                        🗑️
                    </button>
                </div>
            </div>
        `;
        taskList.appendChild(taskCard);
    });
}

function updateProgressBar() {
    if (tasks.length === 0) {
        progressPercentage.textContent = "0%";
        progressBarFill.style.width = "0%";
        encouragementNote.textContent = "Ayo mulai buat tugas pertamamu hari ini! 💪✨";
        return;
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const percentage = Math.round((completedTasks / totalTasks) * 100);

    progressPercentage.textContent = `${percentage}%`;
    progressBarFill.style.width = `${percentage}%`;

    // Menampilkan note (catatan) berdasarkan persentase atau sisa tugas
    if (percentage === 100) {
        encouragementNote.textContent = "Wah, semua tugas selesai! Hebat banget! 🎉🥳";
    } else {
        const remainingTasks = totalTasks - completedTasks;
        encouragementNote.textContent = `Masih ada ${remainingTasks} tugas yang belum selesai. Semangat, kamu pasti bisa! 💖`;
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}