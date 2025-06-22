// Helper to get tasks from LocalStorage
function getTasks() {
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}

// Helper to save tasks to LocalStorage
function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks to the UI
function renderTasks(filter = 'all') {
  const taskList = document.getElementById('taskList');
  taskList.innerHTML = '';
  const tasks = getTasks();
  const today = new Date().toISOString().split('T')[0];
  let filtered = tasks;
  if (filter === 'completed') filtered = tasks.filter(t => t.completed);
  if (filter === 'pending') filtered = tasks.filter(t => !t.completed);
  filtered.sort((a, b) => {
    // High priority first, then due date
    const priorityOrder = {High: 0, Medium: 1, Low: 2};
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
  filtered.forEach((task, idx) => {
    const li = document.createElement('li');
    li.className = `list-group-item d-flex justify-content-between align-items-center priority-${task.priority} ${task.completed ? 'completed' : ''} ${task.dueDate === today ? 'due-today' : ''}`;
    li.setAttribute('role', 'listitem');
    li.setAttribute('aria-checked', task.completed ? 'true' : 'false');
    li.innerHTML = `
      <div class=\"d-flex align-items-center flex-wrap gap-2\">
        <input type=\"checkbox\" class=\"form-check-input me-2 complete-task\" data-id=\"${task.id}\" ${task.completed ? 'checked' : ''} aria-label=\"Mark task as completed\">
        <span>${task.title}</span>
        <span class=\"badge bg-secondary ms-2\">${task.priority}</span>
        ${task.dueDate ? `<span class=\"badge bg-info ms-2\">Due: ${task.dueDate}</span>` : ''}
      </div>
      <button class=\"btn btn-sm btn-danger delete-task\" data-id=\"${task.id}\" aria-label=\"Delete task\">&times;</button>
    `;
    taskList.appendChild(li);
  });
}

// Add new task
function addTask(e) {
  e.preventDefault();
  const title = document.getElementById('taskTitle').value.trim();
  const dueDate = document.getElementById('dueDate').value;
  const priority = document.getElementById('priority').value;
  if (!title || !dueDate || !priority) {
    alert('Please fill in all fields, including Due Date and Priority.');
    return;
  }
  const tasks = getTasks();
  tasks.push({
    id: Date.now(),
    title,
    dueDate,
    priority,
    completed: false
  });
  saveTasks(tasks);
  document.getElementById('taskForm').reset();
  renderTasks(currentFilter);
}

// Handle complete/delete
function handleTaskAction(e) {
  if (e.target.classList.contains('complete-task')) {
    const id = Number(e.target.getAttribute('data-id'));
    const tasks = getTasks();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx > -1) {
      tasks[idx].completed = !tasks[idx].completed;
      saveTasks(tasks);
      renderTasks(currentFilter);
    }
  }
  if (e.target.classList.contains('delete-task')) {
    const id = Number(e.target.getAttribute('data-id'));
    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
    renderTasks(currentFilter);
  }
}

// Filter buttons
let currentFilter = 'all';
document.addEventListener('DOMContentLoaded', function() {
  renderTasks();
  document.getElementById('taskForm').addEventListener('submit', addTask);
  document.getElementById('taskList').addEventListener('click', handleTaskAction);
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      currentFilter = btn.getAttribute('data-filter');
      renderTasks(currentFilter);
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}); 