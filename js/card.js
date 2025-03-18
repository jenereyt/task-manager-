// Функция для отображения модального окна с объединённым оверлеем
function showTaskOptionsModal(taskElement) {
    // Удаляем существующий контейнер модального окна (если есть)
    const existingContainer = document.querySelector('.modal-container');
    if (existingContainer) {
        existingContainer.remove();
    }

    // Получаем данные задачи
    const taskId = taskElement.dataset.taskId;
    const taskContent = taskElement.querySelector('.task-content').textContent.trim();
    const deadline = taskElement.dataset.deadline || '';
    const isCompleted = taskElement.dataset.completed === 'true';

    // Создаем контейнер модального окна (оверлей)
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    Object.assign(modalContainer.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: '1000',
        backgroundColor: 'rgba(0, 0, 0, 0.3)' // полупрозрачный фон
    });

    // Создаем само модальное окно
    const modalElement = document.createElement('div');
    modalElement.className = 'task-options-modal';
    // Позиционируем модалку рядом с задачей
    const taskRect = taskElement.getBoundingClientRect();
    Object.assign(modalElement.style, {
        position: 'absolute',
        top: `${taskRect.bottom + window.scrollY + 5}px`,
        left: `${taskRect.left + window.scrollX}px`,
        zIndex: '1001',
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '5px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    });

    // Заполняем содержимое модалки
    modalElement.innerHTML = `
      <div class="task-modal-header">
        <h3>Настройки задачи</h3>
        <button class="task-modal-close" title="Закрыть">&times;</button>
      </div>
      <div class="task-modal-content">
        <div class="task-modal-field">
          <label for="task-modal-text-${taskId}">Текст задачи:</label>
          <input type="text" id="task-modal-text-${taskId}" class="task-modal-text" value="${taskContent}">
        </div>
        <div class="task-modal-field">
          <label for="task-modal-deadline-${taskId}">Срок выполнения:</label>
          <input type="datetime-local" id="task-modal-deadline-${taskId}" class="task-modal-deadline" value="${deadline}">
        </div>
        <div class="task-modal-field">
          <label class="task-completion-label">
            <input type="checkbox" class="task-modal-completed" ${isCompleted ? 'checked' : ''}>
            Задача выполнена
          </label>
        </div>
        <div class="task-modal-buttons">
          <button class="task-modal-save">Сохранить</button>
          <button class="task-modal-delete">Удалить задачу</button>
        </div>
      </div>
    `;

    // Предотвращаем закрытие модалки при клике внутри неё
    modalElement.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    // Если клик происходит вне модального окна, закрываем его
    modalContainer.addEventListener('click', function (e) {
        if (!modalElement.contains(e.target)) {
            modalContainer.remove();
        }
    });

    // Добавляем модалку в контейнер и контейнер в документ
    modalContainer.appendChild(modalElement);
    document.body.appendChild(modalContainer);

    // Обработчики для кнопок модального окна
    modalElement.querySelector('.task-modal-close').addEventListener('click', () => {
        modalContainer.remove();
    });

    modalElement.querySelector('.task-modal-save').addEventListener('click', () => {
        saveTaskFromModal(modalElement, taskElement);
        modalContainer.remove();
    });

    modalElement.querySelector('.task-modal-delete').addEventListener('click', () => {
        deleteTask(taskElement);
        modalContainer.remove();
    });
}

// Функция для добавления новой задачи в колонку
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
        showTaskOptionsModal(taskElement);
    });
}

// Функция для перевода задачи в режим редактирования
function makeTaskEditable(taskContentElement) {
    const currentText = taskContentElement.textContent.trim();
    const taskElement = taskContentElement.closest('.task');
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = currentText;
    inputElement.className = 'task-input';

    const originalContent = taskElement.innerHTML;
    const editableWrapper = document.createElement('div');
    editableWrapper.className = 'editable-task';
    editableWrapper.appendChild(inputElement);

    taskElement.innerHTML = '';
    taskElement.appendChild(editableWrapper);

    inputElement.focus();
    inputElement.select();

    inputElement.addEventListener('blur', () => {
        saveTask(inputElement, taskElement);
    });

    inputElement.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            inputElement.blur();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            // Восстанавливаем оригинальное содержимое
            taskElement.innerHTML = originalContent;
            const taskDisplay = taskElement.querySelector('.task-content');
            taskDisplay.addEventListener('dblclick', () => {
                makeTaskEditable(taskDisplay);
            });
            const optionsButton = taskElement.querySelector('.task-options-btn');
            optionsButton.addEventListener('click', (e) => {
                e.stopPropagation();
                showTaskOptionsModal(taskElement);
            });
        }
    });
}

// Функция для сохранения изменений задачи через модальное окно
function saveTaskFromModal(modalElement, taskElement) {
    const taskId = taskElement.dataset.taskId;
    const textInput = modalElement.querySelector(`#task-modal-text-${taskId}`);
    const deadlineInput = modalElement.querySelector(`#task-modal-deadline-${taskId}`);
    const completedCheckbox = modalElement.querySelector('.task-modal-completed');

    const newText = textInput.value.trim();
    const newDeadline = deadlineInput.value;
    const isCompleted = completedCheckbox.checked;

    taskElement.dataset.deadline = newDeadline;
    taskElement.dataset.completed = isCompleted.toString();

    const taskDisplay = taskElement.querySelector('.task-content');
    taskDisplay.textContent = newText;
    if (isCompleted) {
        taskDisplay.classList.add('task-completed');
    } else {
        taskDisplay.classList.remove('task-completed');
    }

    let deadlineElement = taskElement.querySelector('.task-deadline');
    if (newDeadline) {
        if (!deadlineElement) {
            deadlineElement = document.createElement('div');
            deadlineElement.className = 'task-deadline';
            taskElement.querySelector('.task-wrapper').appendChild(deadlineElement);
        }
        deadlineElement.textContent = formatDeadline(newDeadline);
    } else if (deadlineElement) {
        deadlineElement.remove();
    }
}

// Функция для удаления задачи
function deleteTask(taskElement) {
    if (taskElement && taskElement.parentNode) {
        taskElement.parentNode.removeChild(taskElement);
    }
}

// Функция для форматирования даты дедлайна
function formatDeadline(isoDateString) {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    const isTomorrow = date.getDate() === tomorrow.getDate() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getFullYear() === tomorrow.getFullYear();

    const options = { hour: '2-digit', minute: '2-digit' };
    const timeString = date.toLocaleTimeString('ru-RU', options);

    if (isToday) {
        return `Сегодня, ${timeString}`;
    } else if (isTomorrow) {
        return `Завтра, ${timeString}`;
    } else {
        const dateOptions = { day: 'numeric', month: 'short' };
        return `${date.toLocaleDateString('ru-RU', dateOptions)}, ${timeString}`;
    }
}

// --- Drag and Drop ---

let draggedElement = null;
let dragStartX = 0;
let dragStartY = 0;
let dragOffsetX = 0;
let dragOffsetY = 0;
let placeholder = null;
let originalColumn = null;

export function initDragAndDrop() {
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

// Инициализация всех функций при запуске приложения
function initTaskManagement() {
    initDragAndDrop();

    // Инициализация обработчиков для уже существующих задач
    document.querySelectorAll('.task').forEach(taskElement => {
        const taskContent = taskElement.querySelector('.task-content');
        if (taskContent) {
            taskContent.addEventListener('dblclick', () => {
                makeTaskEditable(taskContent);
            });
        }
        const optionsButton = taskElement.querySelector('.task-options-btn');
        if (optionsButton) {
            optionsButton.addEventListener('click', (e) => {
                e.stopPropagation();
                showTaskOptionsModal(taskElement);
            });
        }
    });
}
