import { showTaskCardModal, makeTaskEditable, saveTaskFromCard, deleteTask, formatDeadline } from './card.js';
// Функция для добавления новой задачи в колонку
function addNewTask(columnElement) {
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
        taskInput.addEventListener('blur', () => {
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

// Функция для сохранения задачи после редактирования текста
function saveTask(inputField, taskElement) {
    const taskText = inputField.value.trim();
    if (!taskText) {
        taskElement.remove();
        return;
    }

    const taskId = taskElement.dataset.taskId;
    let deadline = taskElement.dataset.deadline || '';
    let isCompleted = taskElement.dataset.completed === 'true';

    // Создаем элемент для отображения задачи
    const taskContent = document.createElement('div');
    taskContent.className = 'task-wrapper';
    const completedClass = isCompleted ? 'task-completed' : '';
    taskContent.innerHTML = `
      <div class="task-content ${completedClass}" title="Дважды кликните для редактирования">
        ${taskText}
      </div>
      
      <div class="task-options-btn" title="Настройки задачи">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
          <circle cx="8" cy="4" r="1.5"/>
          <circle cx="8" cy="8" r="1.5"/>
          <circle cx="8" cy="12" r="1.5"/>
        </svg>
      </div>
    `;

    // Если указан срок выполнения, добавляем индикатор
    if (deadline) {
        const deadlineElement = document.createElement('div');
        deadlineElement.className = 'task-deadline';
        deadlineElement.textContent = formatDeadline(deadline);
        taskContent.appendChild(deadlineElement);
    }

    taskElement.innerHTML = '';
    taskElement.appendChild(taskContent);

    // Вешаем обработчики для редактирования и опций
    const taskDisplay = taskElement.querySelector('.task-content');
    taskDisplay.addEventListener('dblclick', () => {
        makeTaskEditable(taskDisplay);
    });

    const optionsButton = taskElement.querySelector('.task-options-btn');
    optionsButton.addEventListener('click', (e) => {
        e.stopPropagation();
        showTaskCardModal(taskElement);
    });
}

// --- Drag and Drop ---
let draggedElement = null;
let dragStartX = 0;
let dragStartY = 0;
let dragOffsetX = 0;
let dragOffsetY = 0;
let placeholder = null;
let originalColumn = null;

function initDragAndDrop() {
    document.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchstart', handleDragStart, { passive: false });
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
}

function handleDragStart(e) {
    // Если клик по кнопке настроек или внутри модального окна – игнорируем начало перетаскивания
    if (e.target.closest('.task-options-btn') || e.target.closest('.task-options-modal')) {
        return;
    }
    // Закрываем открытый модальный контейнер, если он есть
    const openModal = document.querySelector('.modal-container');
    if (openModal) {
        openModal.remove();
    }

    if (e.type === 'touchstart') {
        e.preventDefault();
        e = e.touches[0];
    }

    const taskElement = e.target.closest('.task');
    if (!taskElement) return;

    draggedElement = taskElement;
    originalColumn = taskElement.closest('.column-content');
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragOffsetX = e.clientX - taskElement.getBoundingClientRect().left;
    dragOffsetY = e.clientY - taskElement.getBoundingClientRect().top;

    // Создаем заполнитель для сохранения места
    placeholder = document.createElement('div');
    placeholder.className = 'task-placeholder';
    placeholder.style.height = `${taskElement.offsetHeight}px`;
    placeholder.style.width = `${taskElement.offsetWidth}px`;

    taskElement.parentNode.insertBefore(placeholder, taskElement);
    taskElement.style.position = 'absolute';
    taskElement.style.zIndex = '1000';
    taskElement.style.width = `${taskElement.offsetWidth}px`;
    taskElement.style.opacity = '0.8';
    document.body.appendChild(taskElement);

    updateDraggedPosition(e.clientX, e.clientY);
    taskElement.classList.add('dragging');
}

function handleDragMove(e) {
    if (!draggedElement) return;
    if (e.type === 'touchmove') {
        e.preventDefault();
        e = e.touches[0];
    }

    updateDraggedPosition(e.clientX, e.clientY);

    const targetColumn = findColumnUnderCursor(e.clientX, e.clientY);
    if (targetColumn) {
        const taskElements = Array.from(targetColumn.querySelectorAll('.task:not(.dragging)'));
        let nextTask = taskElements.find(task => {
            const rect = task.getBoundingClientRect();
            return e.clientY < rect.top + rect.height / 2;
        });

        if (nextTask) {
            targetColumn.insertBefore(placeholder, nextTask);
        } else {
            targetColumn.appendChild(placeholder);
        }
    }
}

function handleDragEnd(e) {
    if (!draggedElement) return;

    draggedElement.style.position = '';
    draggedElement.style.top = '';
    draggedElement.style.left = '';
    draggedElement.style.zIndex = '';
    draggedElement.style.width = '';
    draggedElement.style.opacity = '';
    draggedElement.classList.remove('dragging');

    if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.insertBefore(draggedElement, placeholder);
        placeholder.remove();
    }

    draggedElement = null;
    placeholder = null;
    originalColumn = null;
}

function updateDraggedPosition(clientX, clientY) {
    if (!draggedElement) return;
    draggedElement.style.left = `${clientX - dragOffsetX}px`;
    draggedElement.style.top = `${clientY - dragOffsetY}px`;
}

function findColumnUnderCursor(clientX, clientY) {
    const columns = document.querySelectorAll('.column-content');
    for (const column of columns) {
        const rect = column.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
            return column;
        }
    }
    return null;
}

export { addNewTask, saveTask, initDragAndDrop, handleDragStart, handleDragMove, handleDragEnd, updateDraggedPosition, findColumnUnderCursor };