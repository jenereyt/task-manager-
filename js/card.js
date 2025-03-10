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
export function initDragAndDrop() {
    document.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);

    // Для сенсорных устройств
    document.addEventListener('touchstart', handleDragStart, { passive: false });
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
}

// Переменные для операций перетаскивания
let draggedElement = null;
let dragStartX = 0;
let dragStartY = 0;
let dragOffsetX = 0;
let dragOffsetY = 0;
let placeholder = null;
let originalColumn = null;

// Обработка начала перетаскивания
function handleDragStart(e) {
    // Для сенсорных событий
    if (e.type === 'touchstart') {
        e.preventDefault();
        e = e.touches[0];
    }

    // Находим элемент задачи, которую перетаскивают
    const taskElement = e.target.closest('.task');
    if (!taskElement) return;

    // Сохраняем начальную позицию и создаем клон
    draggedElement = taskElement;
    originalColumn = taskElement.closest('.column-content');
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragOffsetX = e.clientX - taskElement.getBoundingClientRect().left;
    dragOffsetY = e.clientY - taskElement.getBoundingClientRect().top;

    // Создаем заполнитель для сохранения места в колонке
    placeholder = document.createElement('div');
    placeholder.className = 'task-placeholder';
    placeholder.style.height = `${taskElement.offsetHeight}px`;
    placeholder.style.width = `${taskElement.offsetWidth}px`;

    // Вставляем заполнитель и стилизуем перетаскиваемый элемент
    taskElement.parentNode.insertBefore(placeholder, taskElement);
    taskElement.style.position = 'absolute';
    taskElement.style.zIndex = '1000';
    taskElement.style.width = `${taskElement.offsetWidth}px`;
    taskElement.style.opacity = '0.8';
    document.body.appendChild(taskElement);

    // Позиционируем перетаскиваемый элемент
    updateDraggedPosition(e.clientX, e.clientY);

    // Добавляем класс для стилизации
    taskElement.classList.add('dragging');
}

// Обработка движения при перетаскивании
function handleDragMove(e) {
    if (!draggedElement) return;

    // Для сенсорных событий
    if (e.type === 'touchmove') {
        e.preventDefault();
        e = e.touches[0];
    }

    updateDraggedPosition(e.clientX, e.clientY);

    // Находим колонку, над которой находится задача
    const targetColumn = findColumnUnderCursor(e.clientX, e.clientY);
    if (targetColumn) {
        // Находим задачи в колонке
        const taskElements = Array.from(targetColumn.querySelectorAll('.task:not(.dragging)'));

        // Находим задачу, после которой должна идти перетаскиваемая задача
        let nextTask = taskElements.find(task => {
            const rect = task.getBoundingClientRect();
            return e.clientY < rect.top + rect.height / 2;
        });

        // Перемещаем заполнитель
        if (nextTask) {
            targetColumn.insertBefore(placeholder, nextTask);
        } else {
            targetColumn.appendChild(placeholder);
        }
    }
}

// Обработка окончания перетаскивания
function handleDragEnd(e) {
    if (!draggedElement) return;

    // Сбрасываем стили перетаскиваемого элемента
    draggedElement.style.position = '';
    draggedElement.style.top = '';
    draggedElement.style.left = '';
    draggedElement.style.zIndex = '';
    draggedElement.style.width = '';
    draggedElement.style.opacity = '';
    draggedElement.classList.remove('dragging');

    // Заменяем заполнитель на задачу
    if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.insertBefore(draggedElement, placeholder);
        placeholder.parentNode.removeChild(placeholder);
    }

    // Сбрасываем переменные
    draggedElement = null;
    placeholder = null;
    originalColumn = null;
}

// Обновляем позицию перетаскиваемого элемента
function updateDraggedPosition(clientX, clientY) {
    if (!draggedElement) return;

    draggedElement.style.left = `${clientX - dragOffsetX}px`;
    draggedElement.style.top = `${clientY - dragOffsetY}px`;
}

// Находим колонку под курсором
function findColumnUnderCursor(clientX, clientY) {
    const columns = document.querySelectorAll('.column-content');

    for (const column of columns) {
        const rect = column.getBoundingClientRect();
        if (
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom
        ) {
            return column;
        }
    }

    return null;
}