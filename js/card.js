export function addNewTask(columnElement) {
    const columnContent = columnElement.querySelector('.column-content');
    if (!columnContent) {
        console.error("Column content element not found for adding task!");
        return;
    }

    // Генерируем уникальный ID для задачи
    const taskId = 'task-' + Date.now();

    // Создаем элемент задачи с полем ввода
    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    taskElement.dataset.taskId = taskId;
    taskElement.innerHTML = `
      <div class="editable-task">
        <input type="text" class="task-input" placeholder="Введите задачу..." autofocus>
      </div>
    `;

    // Добавляем задачу в колонку
    columnContent.appendChild(taskElement);

    const taskInput = taskElement.querySelector('.task-input');
    if (taskInput) {
        taskInput.focus();
        taskInput.addEventListener('blur', function () {
            saveTask(taskInput, taskElement);
        });
        taskInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                taskInput.blur();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                if (!taskInput.value.trim()) {
                    columnContent.removeChild(taskElement);
                } else {
                    taskInput.blur();
                }
            }
        });
    }
}

export function saveTask(inputField, taskElement) {
    const taskText = inputField.value.trim();
    if (!taskText) {
        taskElement.remove();
        return;
    }

    // Заменяем поле ввода на статичный элемент с текстом задачи
    const taskDisplay = document.createElement('div');
    taskDisplay.className = 'task-content';
    taskDisplay.textContent = taskText;
    taskDisplay.title = "Дважды кликните для редактирования";
    taskDisplay.addEventListener('dblclick', function () {
        makeTaskEditable(taskDisplay);
    });

    taskElement.innerHTML = '';
    taskElement.appendChild(taskDisplay);
}

export function makeTaskEditable(taskContentElement) {
    const currentText = taskContentElement.textContent;
    const taskElement = taskContentElement.closest('.task');
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = currentText;
    inputElement.className = 'task-input';

    taskElement.innerHTML = '';
    taskElement.appendChild(inputElement);

    inputElement.focus();
    inputElement.select();

    inputElement.addEventListener('blur', function () {
        saveTask(inputElement, taskElement);
    });

    inputElement.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            inputElement.blur();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            inputElement.value = currentText;
            inputElement.blur();
        }
    });
}
