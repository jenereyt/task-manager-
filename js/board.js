import { projects, closeAside, toggleFavorite } from './app.js';
import { addNewColumn } from './column.js';
function handleAsideToggle(e) {
  console.log("asideToggled event triggered", e);
}

export function openProject(projectId) {
  const project = projects.find(p => p.id === Number(projectId));
  if (!project) return;

  closeAside();
  renderProjectBoard(project);
  setupEventListeners(project);

  // Log для отладки
  console.log("Opening project:", project);
  console.log("Is toggleFavorite available:", typeof toggleFavorite === 'function');
}

function renderProjectBoard(project) {
  document.querySelector('.main-content').innerHTML = `
    <div class="board" style="background: ${project.background}" data-project-id="${project.id}">
      <div class="board-header">
        <div class="board-header-left">
          <h1 class="project-title" title="Дважды кликните для редактирования">${project.name}</h1>
          <button class="btn btn-icon favorite-btn" title="${project.favorite ? 'Удалить из избранного' : 'Добавить в избранное'}">
            <i class="${project.favorite ? 'fas' : 'far'} fa-star"></i>
          </button>
        </div>
        <div class="board-header-right">
          <div class="view-options">
            <button class="btn btn-view board-view-btn active"><i class="fas fa-columns"></i> Board</button>
            <button class="btn btn-view table-view-btn"><i class="fas fa-table"></i> Table</button>
            <button class="btn btn-view calendar-view-btn"><i class="fas fa-calendar-alt"></i> Calendar</button>
          </div>
          <button class="btn btn-icon more-options-btn" title="More options"><i class="fas fa-ellipsis-h"></i></button>
        </div>
      </div>
      <div id="board-view"></div>
    </div>
  `;
}

function setupEventListeners(project) {
  // Инициализация содержимого по умолчанию
  initializeView('board');

  // 1. Обработчик двойного клика для редактирования названия проекта
  const projectTitle = document.querySelector('.project-title');
  if (projectTitle) {
    console.log("Project title element found, adding dblclick event");
    projectTitle.addEventListener('dblclick', function (e) {
      console.log("Double click on project title detected");
      makeEditable(e);
    });
  } else {
    console.error("Project title element not found!");
  }

  // 2. Обработчик клика для кнопки избранного
  const favoriteBtn = document.querySelector('.favorite-btn');
  if (favoriteBtn) {
    console.log("Favorite button found, adding click event");
    favoriteBtn.addEventListener('click', function () {
      console.log("Favorite button clicked for project:", project.id);
      // Обновляем иконку звезды и заголовок кнопки
      const starIcon = this.querySelector('i');
      if (starIcon) {
        const isFavorite = starIcon.classList.contains('fas');
        starIcon.className = isFavorite ? 'far fa-star' : 'fas fa-star';
        this.title = isFavorite ? 'Добавить в избранное' : 'Удалить из избранного';
      }
      // Вызываем toggleFavorite из app.js
      if (typeof toggleFavorite === 'function') {
        toggleFavorite(project.id);
      } else {
        console.error("toggleFavorite function is not available");
      }
    });
  } else {
    console.error("Favorite button not found!");
  }

  // 3. Кнопка дополнительных опций
  document.querySelector('.more-options-btn')?.addEventListener('click', showMoreOptionsModal);

  // 4. Кнопки переключения видов (board, table, calendar)
  const viewButtons = {
    board: document.querySelector('.board-view-btn'),
    table: document.querySelector('.table-view-btn'),
    calendar: document.querySelector('.calendar-view-btn')
  };

  Object.entries(viewButtons).forEach(([view, button]) => {
    if (button) {
      button.addEventListener('click', () => {
        setActiveView(button);
        initializeView(view);
      });
    }
  });

  // Слушатель для переключения бокового меню
  document.addEventListener('asideToggled', handleAsideToggle);
}

// Установка активной кнопки вида
function setActiveView(activeButton) {
  document.querySelectorAll('.btn-view').forEach(btn => btn.classList.remove('active'));
  activeButton.classList.add('active');
}

function initializeView(viewType) {
  const boardView = document.getElementById('board-view'); // Изменяем на board-view
  if (!boardView) {
    console.error("Board view element not found!");
    return;
  }

  boardView.innerHTML = ''; // Очистка только содержимого вида

  if (viewType === 'board') {
    renderEmptyBoardView();
  } else {
    boardView.innerHTML = `<div class="empty-view">${viewType.charAt(0).toUpperCase() + viewType.slice(1)} view will be implemented soon.</div>`;
  }
}

function renderEmptyBoardView() {
  const boardView = document.getElementById('board-view'); // Изменяем на board-view
  if (!boardView) {
    console.error("Board view element not found for rendering!");
    return;
  }

  boardView.innerHTML = `
    <div class="board-view-content">
      <div class="board-column add-column">
        <button class="add-column-btn">
          <i class="fas fa-plus"></i> Добавить колонку
        </button>
      </div>
    </div>
  `;

  const addColumnBtn = document.querySelector('.add-column-btn');
  if (addColumnBtn) {
    console.log("Add column button found, adding click event");
    addColumnBtn.addEventListener('click', function () {
      console.log("Add column button clicked");
      addNewColumn();
    });
  } else {
    console.error("Add column button not found!");
  }
}

// Отображение модального окна дополнительных опций
function showMoreOptionsModal() {
  console.log("Showing more options modal");
  showModal({
    title: 'Board Options',
    content: `
      <ul class="options-list">
        <li><i class="fas fa-plus"></i> Add Task</li>
        <li><i class="fas fa-user-plus"></i> Share Board</li>
        <li><i class="fas fa-filter"></i> Filter Tasks</li>
        <li><i class="fas fa-sort"></i> Sort Tasks</li>
        <li><i class="fas fa-cog"></i> Board Settings</li>
        <li class="danger"><i class="fas fa-trash"></i> Delete Board</li>
      </ul>
    `,
    onConfirm: () => true
  });

  // Добавляем обработчики для опций
  document.querySelectorAll('.options-list li').forEach(item => {
    item.addEventListener('click', () => {
      console.log('Option selected:', item.textContent.trim());
      const modal = document.querySelector('.modal');
      if (modal) modal.remove();
    });
  });
}

// Общая функция для создания модальных окон
function showModal({ title, content, onConfirm, focusElement, confirmText = 'Подтвердить' }) {
  const existingModal = document.querySelector('.modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'block';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="close-modal-btn">×</button>
      </div>
      <div class="modal-body">
        ${content}
        <div class="form-actions">
          <button class="btn btn-primary confirm-btn">${confirmText}</button>
          <button class="btn btn-secondary cancel-btn">Отмена</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  };

  const confirmBtn = modal.querySelector('.confirm-btn');

  // Обработчики событий
  modal.querySelector('.close-modal-btn')?.addEventListener('click', closeModal);
  modal.querySelector('.cancel-btn')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => e.target === modal && closeModal());

  // Подтверждение
  confirmBtn?.addEventListener('click', () => {
    if (onConfirm()) closeModal();
  });

  return modal;
}

// Функция для редактирования названия проекта по двойному клику
function makeEditable(e) {
  console.log("Making title editable");
  const titleElement = e.target;
  const boardElement = document.querySelector('.board');

  if (!boardElement) {
    console.error("Board element not found!");
    return;
  }

  const projectId = boardElement.dataset.projectId;
  const currentTitle = titleElement.textContent;

  // Создаем поле ввода
  const inputElement = document.createElement('input');
  inputElement.type = 'text';
  inputElement.value = currentTitle;
  inputElement.className = 'edit-title-input';

  // Копируем стили заголовка
  const computedStyles = window.getComputedStyle(titleElement);
  inputElement.style.fontSize = computedStyles.fontSize;
  inputElement.style.fontWeight = computedStyles.fontWeight;
  inputElement.style.width = titleElement.offsetWidth + 'px';

  // Заменяем заголовок на поле ввода
  titleElement.replaceWith(inputElement);
  inputElement.focus();
  inputElement.select();

  // Сохранение нового названия
  function saveTitle() {
    const newTitle = inputElement.value.trim() || currentTitle;
    const newTitleElement = document.createElement('h1');
    newTitleElement.className = 'project-title';
    newTitleElement.title = "Дважды кликните для редактирования";
    newTitleElement.textContent = newTitle;
    newTitleElement.addEventListener('dblclick', makeEditable);
    inputElement.replaceWith(newTitleElement);
    console.log(`Project ${projectId} title updated to: ${newTitle}`);
    // Дополнительная логика обновления проекта
  }

  inputElement.addEventListener('blur', saveTitle);

  inputElement.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputElement.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      inputElement.value = currentTitle;
      inputElement.blur();
    }
  });
}

