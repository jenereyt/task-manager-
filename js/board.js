import { projects, closeAside, toggleFavorite } from './app.js';

export function openProject(projectId) {
  const project = projects.find(p => p.id === Number(projectId));
  if (!project) return;

  closeAside();
  renderProjectBoard(project);
  setupEventListeners(project);
  
  // Log to ensure project is found and functions are available
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
      <div id="board-content" class="board-content"><!-- Содержимое будет добавлено динамически --></div>
    </div>
  `;
}

function setupEventListeners(project) {
  // Инициализация содержимого по умолчанию
  initializeView('board');

  // FIX 1: Explicitly add event listener for project title editing
  const projectTitle = document.querySelector('.project-title');
  if (projectTitle) {
    console.log("Project title element found, adding dblclick event");
    projectTitle.addEventListener('dblclick', function(e) {
      console.log("Double click on project title detected");
      makeEditable(e);
    });
  } else {
    console.error("Project title element not found!");
  }
  
  // FIX 2: Fix favorite button event listener
  const favoriteBtn = document.querySelector('.favorite-btn');
  if (favoriteBtn) {
    console.log("Favorite button found, adding click event");
    favoriteBtn.addEventListener('click', function() {
      console.log("Favorite button clicked for project:", project.id);
      if (typeof toggleFavorite === 'function') {
        toggleFavorite(project.id);
      } else {
        console.error("toggleFavorite function is not available");
      }
    });
  } else {
    console.error("Favorite button not found!");
  }
  
  // Кнопка дополнительных опций
  document.querySelector('.more-options-btn')?.addEventListener('click', showMoreOptionsModal);
  
  // Кнопки переключения видов
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

// Инициализация выбранного вида
function initializeView(viewType) {
  const boardContent = document.getElementById('board-content');
  if (!boardContent) {
    console.error("Board content element not found!");
    return;
  }
  
  boardContent.innerHTML = '';
  
  if (viewType === 'board') {
    renderEmptyBoardView();
  } else {
    boardContent.innerHTML = `<div class="empty-view">${viewType.charAt(0).toUpperCase() + viewType.slice(1)} view will be implemented soon.</div>`;
  }
}

// Рендеринг пустого вида доски
function renderEmptyBoardView() {
  const boardContent = document.getElementById('board-content');
  if (!boardContent) {
    console.error("Board content element not found for rendering!");
    return;
  }
  
  boardContent.innerHTML = `
    <div class="board-view">
      <div class="board-column add-column">
        <button class="add-column-btn">
          <i class="fas fa-plus"></i> Добавить колонку
        </button>
      </div>
    </div>
  `;
  
  // FIX 3: Improved column adding functionality
  const addColumnBtn = document.querySelector('.add-column-btn');
  if (addColumnBtn) {
    console.log("Add column button found, adding click event");
    addColumnBtn.addEventListener('click', function() {
      console.log("Add column button clicked");
      askForColumnName();
    });
  } else {
    console.error("Add column button not found!");
  }
}

// FIX 3: Simpler approach for column name prompt
function askForColumnName() {
  const defaultName = `Колонка ${document.querySelectorAll('.board-column:not(.add-column)').length + 1}`;
  const columnName = prompt("Введите название колонки:", defaultName);
  
  if (columnName !== null) {
    // Генерируем уникальный ID для колонки
    const columnId = 'column-' + Date.now();
    // Непосредственно добавляем новую колонку
    addColumn(columnName || defaultName, columnId);
  }
}

// Добавление новой колонки
function addColumn(columnName, columnId) {
  console.log("Adding column:", columnName, columnId);
  const boardView = document.querySelector('.board-view');
  const addColumnDiv = document.querySelector('.add-column');
  
  if (!boardView || !addColumnDiv) {
    console.error("Board view or add column div not found!");
    return;
  }
  
  // Создаем элемент новой колонки
  const columnElement = document.createElement('div');
  columnElement.className = 'board-column';
  columnElement.dataset.columnId = columnId;
  columnElement.innerHTML = `
    <div class="column-header">
      <h3>${columnName}</h3>
      <div class="column-header-actions">
        <button class="btn btn-icon column-options-btn" title="Опции колонки"><i class="fas fa-ellipsis-v"></i></button>
      </div>
    </div>
    <div class="column-content" data-column="${columnId}"></div>
  `;
  
  // Вставляем новую колонку перед кнопкой "Добавить колонку"
  boardView.insertBefore(columnElement, addColumnDiv);
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
  
  // Проверка и подтверждение
  confirmBtn?.addEventListener('click', () => {
    if (onConfirm()) closeModal();
  });
  
  // Фокус на указанном элементе
  if (focusElement) {
    const element = modal.querySelector(focusElement);
    if (element) {
      element.focus();
      // Добавим обработчик Enter для ввода
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          confirmBtn.click();
        }
      });
    }
  }
  
  return modal;
}

// FIX 1: Improved project title editing
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
  inputElement.style.fontSize = window.getComputedStyle(titleElement).fontSize;
  
  // Replace title with input
  titleElement.parentNode.replaceChild(inputElement, titleElement);
  inputElement.focus();
  inputElement.select();
  
  let isSaved = false;
  
  const saveChanges = () => {
    if (isSaved) return;
    isSaved = true;
    
    const newTitle = inputElement.value.trim();
    if (newTitle) {
      // Обновляем проект
      const project = projects.find(p => p.id === Number(projectId));
      if (project) {
        console.log("Updating project name from", project.name, "to", newTitle);
        project.name = newTitle;
        updateProjectNameInSidebar(projectId, newTitle);
      } else {
        console.error("Project not found for ID:", projectId);
      }
    }
    
    // Создаем новый заголовок
    const newTitleElement = document.createElement('h1');
    newTitleElement.className = 'project-title';
    newTitleElement.textContent = newTitle || currentTitle;
    newTitleElement.title = 'Дважды кликните для редактирования';
    
    if (document.contains(inputElement)) {
      inputElement.parentNode.replaceChild(newTitleElement, inputElement);
      newTitleElement.addEventListener('dblclick', makeEditable);
    }
  };
  
  // Сохраняем при потере фокуса
  inputElement.addEventListener('blur', saveChanges);
  
  // Обработка клавиш
  inputElement.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveChanges();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      inputElement.value = currentTitle;
      saveChanges();
    }
  });
}

// Обновление имени проекта в боковом меню
function updateProjectNameInSidebar(projectId, newName) {
  console.log("Updating project name in sidebar:", projectId, newName);
  const projectItem = document.querySelector(`.project-item[data-id="${projectId}"]`);
  if (projectItem) {
    const nameElement = projectItem.querySelector('.project-name');
    if (nameElement) {
      nameElement.textContent = newName;
    } else {
      console.error("Project name element not found in sidebar item");
    }
  } else {
    console.error("Project item not found in sidebar for ID:", projectId);
  }
}

// Обработчик переключения бокового меню
function handleAsideToggle(e) {
  const board = document.querySelector('.board');
  if (board) {
    board.style.width = e.detail.isOpen ? 'calc(100% - 300px)' : 'calc(100% - 20px)';
    board.style.marginLeft = e.detail.isOpen ? '300px' : '20px';
  }
}