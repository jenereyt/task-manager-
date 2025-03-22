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

    const modalElement = document.createElement('div');
    modalElement.className = 'task-options-modal';
    // Позиционируем модалку рядом с задачей
    const taskRect = taskElement.getBoundingClientRect();
    Object.assign(modalElement.style, {
        position: 'absolute',
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

export { showTaskOptionsModal, makeTaskEditable, saveTaskFromModal, deleteTask, formatDeadline };
