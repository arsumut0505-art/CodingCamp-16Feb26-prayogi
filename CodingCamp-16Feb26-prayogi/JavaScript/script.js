document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todoForm');
    const taskNameInput = document.getElementById('taskName');
    const taskDateInput = document.getElementById('taskDate');
    const todoList = document.getElementById('todoList');
    const emptyMessage = document.getElementById('emptyMessage');
    const addBtn = document.getElementById('addBtn');
    const filterBtn = document.getElementById('filterBtn');
    const deleteAllBtn = document.getElementById('deleteAllBtn');

    let tasks = [];
    let isEditing = false;
    let editId = null;
    let currentFilter = 'all'; // all, pending, completed

    // Initialize - Set min date to today
    const today = new Date().toISOString().split('T')[0];
    taskDateInput.setAttribute('min', today);

    // Initial render
    renderTasks();

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = taskNameInput.value.trim();
        const date = taskDateInput.value;

        if (!name || !date) return;

        if (isEditing) {
            updateTask(editId, name, date);
        } else {
            addTask(name, date);
        }

        todoForm.reset();
        resetSubmitButton();
    });

    deleteAllBtn.addEventListener('click', () => {
        if (tasks.length > 0 && confirm('Are you sure you want to delete all tasks?')) {
            tasks = [];
            renderTasks();
        }
    });

    filterBtn.addEventListener('click', () => {
        // Simple cycle filter: all -> pending -> completed -> all
        if (currentFilter === 'all') currentFilter = 'pending';
        else if (currentFilter === 'pending') currentFilter = 'completed';
        else currentFilter = 'all';

        filterBtn.textContent = `Filter: ${currentFilter}`;
        renderTasks();
    });

    function addTask(name, date) {
        const newTask = {
            id: Date.now().toString(),
            name,
            date,
            status: 'pending'
        };
        tasks.push(newTask);
        renderTasks();
    }

    function updateTask(id, name, date) {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, name, date } : task
        );
        isEditing = false;
        editId = null;
        renderTasks();
    }

    function toggleStatus(id) {
        tasks = tasks.map(task =>
            task.id === id ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' } : task
        );
        renderTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        renderTasks();
    }

    function startEdit(id) {
        const taskToEdit = tasks.find(task => task.id === id);
        if (!taskToEdit) return;

        taskNameInput.value = taskToEdit.name;
        taskDateInput.value = taskToEdit.date;

        isEditing = true;
        editId = id;

        addBtn.textContent = '✓';
        addBtn.style.backgroundColor = 'var(--success)';
        taskNameInput.focus();
    }

    function resetSubmitButton() {
        addBtn.textContent = '+';
        addBtn.style.backgroundColor = '';
        isEditing = false;
        editId = null;
    }

    function renderTasks() {
        todoList.innerHTML = '';

        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'all') return true;
            return task.status === currentFilter;
        });

        if (filteredTasks.length === 0) {
            emptyMessage.style.display = 'block';
            emptyMessage.textContent = currentFilter === 'all' ? 'No task found' : `No ${currentFilter} tasks found`;
        } else {
            emptyMessage.style.display = 'none';
        }

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'todo-item';

            const isCompleted = task.status === 'completed';

            li.innerHTML = `
                <h3 style="${isCompleted ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHtml(task.name)}</h3>
                <div class="date">${formatDate(task.date)}</div>
                <div>
                    <span class="status-badge status-${task.status}">${task.status.toUpperCase()}</span>
                </div>
                <div class="todo-actions">
                    <button class="btn-action btn-edit" title="Edit">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-action btn-delete" title="Delete">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;

            li.querySelector('.status-badge').addEventListener('click', () => toggleStatus(task.id));
            li.querySelector('.btn-edit').addEventListener('click', () => startEdit(task.id));
            li.querySelector('.btn-delete').addEventListener('click', () => deleteTask(task.id));

            todoList.appendChild(li);
        });
    }

    function formatDate(dateStr) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
