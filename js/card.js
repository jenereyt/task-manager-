// Глобальная переменная для отслеживания недавно открытой модалки
let modalJustOpened = false;

// Функция для отображения модального окна настроек задачи
function showTaskOptionsModal(taskElement) {
    // Отмечаем, что модалка только что открылась
    modalJustOpened = true;

    // Закрываем предыдущую модалку, если есть
    const existingModal = document.querySelector('.task-options-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Получаем данные задачи
    const taskId = taskElement.dataset.taskId;
    const taskContent = taskElement.querySelector('.task-content').textContent.trim();
    const deadline = taskElement.dataset.deadline || '';
    const isCompleted = taskElement.dataset.completed === 'true';

    // Создаем модальное окно
    const modalElement = document.createElement('div');
    modalElement.className = 'task-options-modal';
    modalElement.dataset.forTaskId = taskId;

    // Позиционируем модалку рядом с задачей
    const taskRect = taskElement.getBoundingClientRect();
    modalElement.style.position = 'absolute';
    modalElement.style.top = `${taskRect.bottom + window.scrollY + 5}px`;
    modalElement.style.left = `${taskRect.left + window.scrollX}px`;
    modalElement.style.zIndex = '1001';

    // Заполняем содержимое модалки
    modalElement.innerHTML = `
        <div class="task-modal-header">
            <h3>Настройки задачи</h3>
            <button class="task-modal-close">&times;</button>
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

    // Предотвращаем закрытие модалки при клике на неё
    modalElement.addEventListener('click', function(e) {
        // Останавливаем распространение клика чтобы не дойти до документа
        e.stopPropagation();
    });

    // Добавляем модалку в DOM
    document.body.appendChild(modalElement);

    // Добавляем обработчики событий
    modalElement.querySelector('.task-modal-close').addEventListener('click', function () {
        modalElement.remove();
    });

    modalElement.querySelector('.task-modal-save').addEventListener('click', function () {
        saveTaskFromModal(modalElement, taskElement);
    });

    modalElement.querySelector('.task-modal-delete').addEventListener('click', function () {
        deleteTask(taskElement);
        modalElement.remove();
    });

    // Вместо обработчика документа для закрытия, добавляем его на отдельную оверлейную область
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.zIndex = '1000'; // Ниже модалки но выше всего остального
    overlay.style.backgroundColor = 'transparent'; // Прозрачный фон

    document.body.appendChild(overlay);

    overlay.addEventListener('click', function() {
        modalElement.remove();
        overlay.remove();
    });

    // Сбрасываем флаг после того как модалка отрисована
    setTimeout(() => {
        modalJustOpened = false;
    }, 100);
}

// Остальной код остается без изменений
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

    // Получаем ID задачи из атрибута data-task-id
    const taskId = taskElement.dataset.taskId;

    // Проверяем, есть ли у задачи deadline и статус выполнения
    let deadline = taskElement.dataset.deadline || '';
    let isCompleted = taskElement.dataset.completed === 'true';

    // Заменяем поле ввода на статичный элемент с текстом задачи и кнопкой опций
    const taskContent = document.createElement('div');
    taskContent.className = 'task-wrapper';

    // Добавляем класс, если задача выполнена
    const completedClass = isCompleted ? 'task-completed' : '';

    taskContent.innerHTML = `
        <div class="task-content ${completedClass}" title="Дважды кликните для редактирования">
            ${taskText}
        </div>
        <div class="task-options-btn" title="Настройки задачи">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="4" r="1.5"/>
                <circle cx="8" cy="8" r="1.5"/>
                <circle cx="8" cy="12" r="1.5"/>
            </svg>
        </div>
    `;

    // Если есть срок, добавляем индикатор дедлайна
    if (deadline) {
        const deadlineElement = document.createElement('div');
        deadlineElement.className = 'task-deadline';
        deadlineElement.textContent = formatDeadline(deadline);
        taskContent.appendChild(deadlineElement);
    }

    taskElement.innerHTML = '';
    taskElement.appendChild(taskContent);

    // Добавляем обработчики событий
    const taskDisplay = taskElement.querySelector('.task-content');
    taskDisplay.addEventListener('dblclick', function () {
        makeTaskEditable(taskDisplay);
    });

    const optionsButton = taskElement.querySelector('.task-options-btn');
    optionsButton.addEventListener('click', function (e) {
        e.stopPropagation();
        showTaskOptionsModal(taskElement);
    });
}

export function makeTaskEditable(taskContentElement) {
    const currentText = taskContentElement.textContent.trim();
    const taskElement = taskContentElement.closest('.task');
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = currentText;
    inputElement.className = 'task-input';

    // Сохраняем содержимое задачи, чтобы восстановить его при отмене
    const originalContent = taskElement.innerHTML;

    const editableWrapper = document.createElement('div');
    editableWrapper.className = 'editable-task';
    editableWrapper.appendChild(inputElement);

    taskElement.innerHTML = '';
    taskElement.appendChild(editableWrapper);

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
            // Восстанавливаем оригинальное содержимое при отмене
            taskElement.innerHTML = originalContent;

            // Повторно добавляем обработчики событий
            const taskDisplay = taskElement.querySelector('.task-content');
            taskDisplay.addEventListener('dblclick', function () {
                makeTaskEditable(taskDisplay);
            });

            const optionsButton = taskElement.querySelector('.task-options-btn');
            optionsButton.addEventListener('click', function (e) {
                e.stopPropagation();
                showTaskOptionsModal(taskElement);
            });
        }
    });
}

// Функция для сохранения задачи из модального окна
function saveTaskFromModal(modalElement, taskElement) {
    const taskId = taskElement.dataset.taskId;
    const textInput = modalElement.querySelector(`#task-modal-text-${taskId}`);
    const deadlineInput = modalElement.querySelector(`#task-modal-deadline-${taskId}`);
    const completedCheckbox = modalElement.querySelector('.task-modal-completed');

    // Получаем новые значения
    const newText = textInput.value.trim();
    const newDeadline = deadlineInput.value;
    const isCompleted = completedCheckbox.checked;

    // Обновляем атрибуты задачи
    taskElement.dataset.deadline = newDeadline;
    taskElement.dataset.completed = isCompleted.toString();

    // Обновляем отображение задачи
    const taskDisplay = taskElement.querySelector('.task-content');
    taskDisplay.textContent = newText;

    // Добавляем или удаляем класс выполненной задачи
    if (isCompleted) {
        taskDisplay.classList.add('task-completed');
    } else {
        taskDisplay.classList.remove('task-completed');
    }

    // Обновляем или добавляем дедлайн
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

    // Удаляем оверлейный слой, если есть
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.remove();
    }

    // Закрываем модальное окно
    modalElement.remove();
}

// Функция для удаления задачи
function deleteTask(taskElement) {
    if (taskElement && taskElement.parentNode) {
        taskElement.parentNode.removeChild(taskElement);
    }
    
    // Удаляем оверлейный слой, если есть
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.remove();
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
    // Если модалка только что открылась, игнорируем начало перетаскивания
    if (modalJustOpened) {
        return;
    }

    // Закрываем модальное окно при начале перетаскивания
    const existingModal = document.querySelector('.task-options-modal');
    if (existingModal) {
        existingModal.remove();
        // Удаляем оверлейный слой, если есть
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // Проверяем, что клик не на кнопке опций и не в модальном окне
    if (e.target.closest('.task-options-btn') || e.target.closest('.task-options-modal')) {
        return;
    }

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

// Инициализация всех функций при запуске приложения
export function initTaskManagement() {
    // Инициализация перетаскивания
    initDragAndDrop();

    // Инициализация обработчиков для существующих задач
    document.querySelectorAll('.task').forEach(taskElement => {
        const taskContent = taskElement.querySelector('.task-content');
        if (taskContent) {
            taskContent.addEventListener('dblclick', function () {
                makeTaskEditable(taskContent);
            });
        }

        const optionsButton = taskElement.querySelector('.task-options-btn');
        if (optionsButton) {
            optionsButton.addEventListener('click', function (e) {
                e.stopPropagation();
                showTaskOptionsModal(taskElement);
            });
        }
    });
}