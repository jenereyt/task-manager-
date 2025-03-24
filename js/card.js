// Функция для отображения модального окна с объединённым оверлеем
function showTaskCardModal(taskElement) {
  const existingContainer = document.querySelector('.tm-modal-container');
  if (existingContainer) {
    existingContainer.remove();
  }

  const taskId = taskElement.dataset.taskId;
  const taskContent = taskElement.querySelector('.task-content').textContent.trim();
  const deadline = taskElement.dataset.deadline || '';
  const isCompleted = taskElement.dataset.completed === 'true';
  const checklist = taskElement.dataset.checklist ? JSON.parse(taskElement.dataset.checklist) : [];
  const assignees = taskElement.dataset.assignees || '';
  const attachments = taskElement.dataset.attachments ? JSON.parse(taskElement.dataset.attachments) : [];

  const modalContainer = document.createElement('div');
  modalContainer.className = 'tm-modal-container';
  Object.assign(modalContainer.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    zIndex: '1000',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  });

  const modalElement = document.createElement('div');
  modalElement.className = 'tm-task-card-modal';
  Object.assign(modalElement.style, {
    backgroundColor: '#2a2a2a',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    width: '700px',
    maxWidth: '90vw',
    height: '500px',
    maxHeight: '90vh',
    display: 'flex',
    overflow: 'hidden'
  });

  modalElement.innerHTML = `
    <div class="tm-task-card-left">
      <div class="tm-task-card-header">
        <input type="text" class="tm-task-card-title" value="${taskContent}">
        <label class="tm-task-card-completed-label">
          <input type="checkbox" class="tm-task-card-completed" ${isCompleted ? 'checked' : ''}>
          Выполнено
        </label>
        <button class="tm-task-card-close" title="Закрыть">×</button>
      </div>
      <div class="tm-task-card-content" id="tm-task-card-content-${taskId}">
        <!-- Здесь будет динамический контент -->
      </div>
    </div>
    <div class="tm-task-card-right">
      <div class="tm-task-card-menu">
        <button class="tm-task-card-menu-item" data-section="assignees">Участники</button>
        <button class="tm-task-card-menu-item" data-section="checklist">Чек-лист</button>
        <button class="tm-task-card-menu-item" data-section="attachments">Вложения</button>
        <button class="tm-task-card-menu-item" data-section="deadline">Дата</button>
      </div>
      <div class="tm-task-card-buttons">
        <button class="tm-task-card-save">Сохранить</button>
      </div>
    </div>
  `;

  modalElement.addEventListener('click', (e) => e.stopPropagation());
  modalContainer.addEventListener('click', (e) => {
    if (!modalElement.contains(e.target)) modalContainer.remove();
  });

  modalContainer.appendChild(modalElement);
  document.body.appendChild(modalContainer);

  // Динамическое содержимое для левой части
  const contentContainer = modalElement.querySelector(`#tm-task-card-content-${taskId}`);
  const menuItems = modalElement.querySelectorAll('.tm-task-card-menu-item');

  function updateContent(section) {
    contentContainer.innerHTML = '';
    switch (section) {
      case 'assignees':
        contentContainer.innerHTML = `
          <label>Участники:</label>
          <input type="text" class="tm-task-card-assignees" value="${assignees}" placeholder="Введите имена через запятую">
        `;
        break;
      case 'checklist':
        contentContainer.innerHTML = `
          <label>Чек-лист:</label>
          <div id="tm-checklist-items-${taskId}" class="tm-checklist-items">
            ${checklist.map((item, index) => `
              <div class="tm-checklist-item">
                <input type="checkbox" class="tm-checklist-checkbox" ${item.completed ? 'checked' : ''} data-index="${index}">
                <input type="text" class="tm-checklist-text" value="${item.text}" data-index="${index}">
                <button class="tm-checklist-delete" data-index="${index}">×</button>
              </div>
            `).join('')}
          </div>
          <button id="tm-add-checklist-item-${taskId}" class="tm-add-checklist-item">+ Добавить пункт</button>
        `;
        const checklistContainer = modalElement.querySelector(`#tm-checklist-items-${taskId}`);
        modalElement.querySelector(`#tm-add-checklist-item-${taskId}`).addEventListener('click', () => {
          const newItem = document.createElement('div');
          newItem.className = 'tm-checklist-item';
          newItem.innerHTML = `
            <input type="checkbox" class="tm-checklist-checkbox">
            <input type="text" class="tm-checklist-text" placeholder="Введите пункт">
            <button class="tm-checklist-delete">×</button>
          `;
          checklistContainer.appendChild(newItem);
        });
        checklistContainer.addEventListener('click', (e) => {
          if (e.target.className === 'tm-checklist-delete') e.target.parentElement.remove();
        });
        break;
      case 'attachments':
        contentContainer.innerHTML = `
          <label>Вложения:</label>
          <div id="tm-attachments-list-${taskId}" class="tm-attachments-list">
            ${attachments.map((file, index) => `
              <div class="tm-attachment-item" data-index="${index}">
                <span>${file.name}</span>
                <button class="tm-attachment-delete" data-index="${index}">×</button>
              </div>
            `).join('')}
          </div>
          <input type="file" id="tm-attachment-input-${taskId}" class="tm-attachment-input" multiple>
        `;
        const attachmentsList = modalElement.querySelector(`#tm-attachments-list-${taskId}`);
        modalElement.querySelector(`#tm-attachment-input-${taskId}`).addEventListener('change', (e) => {
          const files = Array.from(e.target.files);
          files.forEach(file => {
            const attachmentItem = document.createElement('div');
            attachmentItem.className = 'tm-attachment-item';
            attachmentItem.innerHTML = `
              <span>${file.name}</span>
              <button class="tm-attachment-delete">×</button>
            `;
            attachmentsList.appendChild(attachmentItem);
          });
          e.target.value = '';
        });
        attachmentsList.addEventListener('click', (e) => {
          if (e.target.className === 'tm-attachment-delete') e.target.parentElement.remove();
        });
        break;
      case 'deadline':
        contentContainer.innerHTML = `
          <label>Дата выполнения:</label>
          <input type="datetime-local" class="tm-task-card-deadline" value="${deadline}">
        `;
        break;
    }
  }

  // Обработчики кликов по меню
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      updateContent(item.dataset.section);
    });
  });

  // Устанавливаем начальный раздел (например, участники)
  menuItems[0].classList.add('active');
  updateContent('assignees');

  // Кнопки управления
  modalElement.querySelector('.tm-task-card-close').addEventListener('click', () => modalContainer.remove());
  modalElement.querySelector('.tm-task-card-save').addEventListener('click', () => {
    saveTaskFromCard(modalElement, taskElement);
    modalContainer.remove();
  });
}

function saveTaskFromCard(modalElement, taskElement) {
  const taskId = taskElement.dataset.taskId;
  const titleInput = modalElement.querySelector('.tm-task-card-title');
  const completedCheckbox = modalElement.querySelector('.tm-task-card-completed');
  const assigneesInput = modalElement.querySelector('.tm-task-card-assignees');
  const deadlineInput = modalElement.querySelector('.tm-task-card-deadline');

  const newText = titleInput.value.trim();
  const isCompleted = completedCheckbox.checked;
  const newAssignees = assigneesInput ? assigneesInput.value.trim() : taskElement.dataset.assignees || '';
  const newDeadline = deadlineInput ? deadlineInput.value : taskElement.dataset.deadline || '';

  const checklistItems = modalElement.querySelectorAll(`#tm-checklist-items-${taskId} .tm-checklist-item`);
  const newChecklist = checklistItems.length ? Array.from(checklistItems).map(item => ({
    text: item.querySelector('.tm-checklist-text').value.trim(),
    completed: item.querySelector('.tm-checklist-checkbox').checked
  })) : (taskElement.dataset.checklist ? JSON.parse(taskElement.dataset.checklist) : []);

  const attachmentItems = modalElement.querySelectorAll(`#tm-attachments-list-${taskId} .tm-attachment-item`);
  const newAttachments = attachmentItems.length ? Array.from(attachmentItems).map(item => ({ name: item.querySelector('span').textContent })) : (taskElement.dataset.attachments ? JSON.parse(taskElement.dataset.attachments) : []);

  taskElement.dataset.deadline = newDeadline;
  taskElement.dataset.completed = isCompleted.toString();
  taskElement.dataset.assignees = newAssignees;
  taskElement.dataset.checklist = JSON.stringify(newChecklist);
  taskElement.dataset.attachments = JSON.stringify(newAttachments);

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

// Остальные функции остаются без изменений
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

function deleteTask(taskElement) {
  if (taskElement && taskElement.parentNode) {
    taskElement.parentNode.removeChild(taskElement);
  }
}

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
export { showTaskCardModal, makeTaskEditable, saveTaskFromCard, deleteTask, formatDeadline };                 