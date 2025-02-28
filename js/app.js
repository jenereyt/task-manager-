export let projects = [];
import { openProject } from './board.js';
export let isAsideOpen = false;
export let activeTab = 'projects';

const gradients = [
  { id: 1, name: 'Океанский бриз', value: 'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)' },
  { id: 2, name: 'Пурпурное блаженство', value: 'linear-gradient(135deg, #7f7fd5 0%, #86a8e7 50%, #91eae4 100%)' },
  { id: 3, name: 'Летний закат', value: 'linear-gradient(135deg, #fd746c 0%, #ff9068 100%)' },
  { id: 4, name: 'Лесное утро', value: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' },
  { id: 5, name: 'Лавандовое поле', value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { id: 6, name: 'Песчаный пляж', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { id: 7, name: 'Ледяная ночь', value: 'linear-gradient(135deg, #1a1a2e 0%, #16222a 100%)' },
  { id: 8, name: 'Молочный туман', value: 'linear-gradient(135deg, #3f4c6b 0%, #232d3b 100%)' },
  { id: 9, name: 'Черная бездна', value: 'linear-gradient(135deg, #000000 0%, #434343 100%)' },
  { id: 10, name: 'Космическая пыль', value: 'linear-gradient(135deg, #4c4c6c 0%, #3e3e5d 100%)' },
  { id: 11, name: 'Готический стиль', value: 'linear-gradient(135deg, #212121 0%, #373737 100%)' },
  { id: 12, name: 'Ночная тень', value: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)' }
];


function createStructure() {
  const appHTML = `
    <div class="app">
      <aside class="aside">
        <button class="toggle-btn">
          <img src="/assets/right_arrow_icon.svg" alt="Toggle sidebar">
        </button>
        <div class="aside-content">
          <div class="tabs-container">
            <div class="tab-buttons">
              <button class="tab-btn active" data-tab="account">
                <i class="fas fa-user"></i> Аккаунт
              </button>
              <button class="tab-btn" data-tab="projects">
                <i class="fas fa-project-diagram"></i> Проекты
              </button>
            </div>
            
            <div class="tab-content">
              <div class="tab account-tab active" id="account-tab">
                <div class="account-placeholder">
                  <div class="avatar-circle">
                    <span>A</span>
                  </div>
                  <h3>Аккаунт</h3>
                  <p>Войдите для сохранения проектов</p>
                  <button class="login-btn">Войти</button>
                </div>
              </div>
              
              <div class="tab project-tab" id="projects-tab" style="display: none;">
                <button class="create-project-btn">
                  <span>+</span> Создать проект
                </button>
                <div class="projects-list">
                  <!-- Проекты будут добавляться сюда -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
      
      <main class="main-content">
        <div class="welcome-screen">
          <h1>Добро пожаловать в Task Manager</h1>
          <p>Выберите проект или создайте новый</p>
        </div>
      </main>
    </div>
  `;

  document.body.innerHTML = appHTML;
}

function createModal() {
  const modalHTML = `
    <div class="modal">
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2 class="modal-title">Создать проект</h2>
        <div class="modal-form">
          <div class="form-group">
            <label for="project-name">Название проекта</label>
            <input type="text" id="project-name" class="project-name-input">
          </div>
          <div class="form-group">
            <label>Выберите фон доски</label>
            <div class="gradient-grid">
              ${gradients.map(gradient => `
                <div class="gradient-option" data-gradient="${gradient.value}" 
                     style="background: ${gradient.value}">
                  <div class="gradient-check">✓</div>
                </div>
              `).join('')}
            </div>
          </div>
          <button class="save-project-btn">Сохранить</button>
        </div>
      </div>
    </div>
  `;

  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = modalHTML;
  document.body.appendChild(modalContainer.firstElementChild);
}

export function closeAside() {
  const aside = document.querySelector('.aside');
  const toggleBtnImg = document.querySelector('.toggle-btn img');

  isAsideOpen = false;
  aside.classList.remove('open');
  document.querySelector('.main-content').classList.remove('aside-open');
  toggleBtnImg.src = '/assets/right_arrow_icon.svg';

  // Сообщаем о закрытии aside
  document.dispatchEvent(new CustomEvent('asideToggled', { detail: { isOpen: false } }));
}

function setupAsideInteraction() {
  const aside = document.querySelector('.aside');
  const toggleBtn = document.querySelector('.toggle-btn');
  const toggleBtnImg = toggleBtn.querySelector('img');

  function toggleAside() {
    isAsideOpen = !isAsideOpen;
    aside.classList.toggle('open');
    document.querySelector('.main-content').classList.toggle('aside-open');
    toggleBtnImg.src = isAsideOpen
      ? '/assets/left_arrow_icon.svg'
      : '/assets/right_arrow_icon.svg';
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAside();
  });

  aside.addEventListener('click', (e) => {
    const clickX = e.clientX;
    const asideRight = aside.getBoundingClientRect().right;

    if (!isAsideOpen && clickX >= asideRight - 10 && clickX <= asideRight) {
      toggleAside();
    }
  });

  document.querySelector('.aside-content').addEventListener('click', (e) => {
    e.stopPropagation();
  });
}

function switchTab(tabName) {
  activeTab = tabName;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  document.querySelectorAll('.tab').forEach(tab => {
    if (tab.id === `${tabName}-tab`) {
      tab.style.display = 'block';
      tab.classList.add('active');
    } else {
      tab.style.display = 'none';
      tab.classList.remove('active');
    }
  });
}

function showModal(project = null) {
  const modal = document.querySelector('.modal');
  const titleEl = modal.querySelector('.modal-title');
  const nameInput = modal.querySelector('#project-name');
  const gradientOptions = modal.querySelectorAll('.gradient-option');

  gradientOptions.forEach(option => option.classList.remove('selected'));

  if (project) {
    titleEl.textContent = 'Редактировать проект';
    nameInput.value = project.name;
    if (project.background) {
      const matchingOption = Array.from(gradientOptions)
        .find(option => option.dataset.gradient === project.background);
      if (matchingOption) {
        matchingOption.classList.add('selected');
      }
    }
  } else {
    titleEl.textContent = 'Создать проект';
    nameInput.value = '';
    gradientOptions[0].classList.add('selected');
  }

  modal.style.display = 'block';
}

function setupEventListeners() {
  const createProjectBtn = document.querySelector('.create-project-btn');
  const projectsList = document.querySelector('.projects-list');
  const tabButtons = document.querySelectorAll('.tab-btn');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchTab(e.target.closest('.tab-btn').dataset.tab);
    });
  });

  createProjectBtn.addEventListener('click', () => {
    showModal();
  });

  projectsList.addEventListener('click', (e) => {
    const favoriteBtn = e.target.closest('.favorite-sidebar-btn');

    if (favoriteBtn) {
      e.stopPropagation(); 
      toggleFavorite(favoriteBtn.dataset.id);
      return; 
    }

    const projectItem = e.target.closest('.project-item');
    if (projectItem) {
      openProject(projectItem.dataset.id);
    }
  });

  const modal = document.querySelector('.modal');
  const closeBtn = modal.querySelector('.close-modal');
  const saveBtn = modal.querySelector('.save-project-btn');
  const gradientOptions = modal.querySelectorAll('.gradient-option');

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  gradientOptions.forEach(option => {
    option.addEventListener('click', () => {
      gradientOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
    });
  });

  saveBtn.addEventListener('click', () => {
    const nameInput = modal.querySelector('#project-name');
    const selectedGradient = modal.querySelector('.gradient-option.selected');

    if (!nameInput.value.trim()) {
      alert('Пожалуйста, введите название проекта');
      return;
    }

    const project = {
      id: Date.now(),
      name: nameInput.value.trim(),
      timestamp: new Date().toLocaleDateString(),
      background: selectedGradient.dataset.gradient,
      favorite: false // Свойство favorite по умолчанию
    };

    projects.unshift(project);

    // Обновляем структуру HTML для элемента проекта, изменяя расположение элементов
    const projectElement = document.createElement('div');
    projectElement.className = 'project-item';
    projectElement.dataset.id = project.id;
    projectElement.style.background = project.background;

    // Изменение структуры для лучшего расположения элементов
    projectElement.innerHTML = `
    <div class="project-info">
    <span class="project-name">${project.name}</span>
    <span class="project-date">${project.timestamp}</span>
    </div>
    <button class="btn-icon favorite-sidebar-btn" data-id="${project.id}" title="Добавить в избранное">
      <i class="far fa-star"></i>
    </button>
    `;

    projectsList.insertBefore(projectElement, projectsList.firstChild);
    modal.style.display = 'none';
  });
}

export function toggleFavorite(projectId) {
  const projectIndex = projects.findIndex(p => p.id === Number(projectId));
  if (projectIndex === -1) return;

  // Переключаем статус избранного
  projects[projectIndex].favorite = !projects[projectIndex].favorite;

  // Обновляем отображение в боковой панели
  const sidebarFavBtn = document.querySelector(`.favorite-sidebar-btn[data-id="${projectId}"]`);
  if (sidebarFavBtn) {
    const icon = sidebarFavBtn.querySelector('i');
    if (projects[projectIndex].favorite) {
      icon.className = 'fas fa-star'; // Заполненная звезда
      sidebarFavBtn.title = 'Удалить из избранного';
    } else {
      icon.className = 'far fa-star'; // Пустая звезда
      sidebarFavBtn.title = 'Добавить в избранное';
    }
  }

  // Обновляем отображение в заголовке доски, если она открыта
  const boardFavBtn = document.querySelector('.board-header .favorite-btn');
  if (boardFavBtn) {
    const openedProjectId = document.querySelector('.board').dataset.projectId;
    if (Number(openedProjectId) === Number(projectId)) {
      const icon = boardFavBtn.querySelector('i');
      if (projects[projectIndex].favorite) {
        icon.className = 'fas fa-star'; // Заполненная звезда
        boardFavBtn.title = 'Удалить из избранного';
      } else {
        icon.className = 'far fa-star'; // Пустая звезда
        boardFavBtn.title = 'Добавить в избранное';
      }
    }
  }
}

function updateExistingProjectItems() {
  const projectItems = document.querySelectorAll('.project-item');
  projectItems.forEach(item => {
    const projectId = item.dataset.id;
    const project = projects.find(p => p.id === Number(projectId));
    if (!project) return;

    // Проверяем, есть ли уже кнопка избранного
    let favBtn = item.querySelector('.favorite-sidebar-btn');

    // Если кнопки нет, создаем её
    if (!favBtn) {
      favBtn = document.createElement('button');
      favBtn.className = 'btn-icon favorite-sidebar-btn';
      favBtn.dataset.id = projectId;
      favBtn.title = project.favorite ? 'Удалить из избранного' : 'Добавить в избранное';
      favBtn.innerHTML = `<i class="${project.favorite ? 'fas' : 'far'} fa-star"></i>`;

      // Вставляем кнопку в начало элемента проекта
      item.insertBefore(favBtn, item.firstChild);
    }
  });
}

function init() {
  createStructure();
  createModal();
  setupEventListeners();
  setupAsideInteraction();
  switchTab('account');
  updateExistingProjectItems();
}

document.addEventListener('DOMContentLoaded', () => {
  init();
});







// Структура данных для хранения колонок и задач
export function initializeBoard(projectId) {
  const project = projects.find(p => p.id === Number(projectId));
  if (!project) return;

  // Если у проекта еще нет колонок, создаем стандартные
  if (!project.columns) {
      project.columns = [
          { id: 1, name: 'К выполнению', tasks: [] },
          { id: 2, name: 'В процессе', tasks: [] },
          { id: 3, name: 'Готово', tasks: [] }
      ];
  }

  renderBoardView(project);
}

// Функция для отрисовки доски
export function renderBoardView(project) {
  const board = document.querySelector('.board');

  // Находим или создаем контейнер для колонок
  let columnsContainer = board.querySelector('.columns-container');
  if (!columnsContainer) {
      columnsContainer = document.createElement('div');
      columnsContainer.className = 'columns-container';
      board.appendChild(columnsContainer);
  }

  // Очищаем предыдущее содержимое
  columnsContainer.innerHTML = '';

  // Отрисовываем колонки и задачи
  project.columns.forEach(column => {
      const columnElement = createColumnElement(column);
      columnsContainer.appendChild(columnElement);
  });

  // Добавляем кнопку для добавления новой колонки
  const addColumnBtn = document.createElement('div');
  addColumnBtn.className = 'add-column-btn';
  addColumnBtn.innerHTML = `
  <button class="btn btn-add">
    <i class="fas fa-plus"></i> Добавить колонку
  </button>
`;
  columnsContainer.appendChild(addColumnBtn);

  // Обработчик для добавления новой колонки
  addColumnBtn.addEventListener('click', () => {
      addNewColumn(project);
  });

  // Инициализируем возможность перетаскивания
  initDragAndDrop();
}

// Функция для создания элемента колонки
function createColumnElement(column) {
  const columnElement = document.createElement('div');
  columnElement.className = 'column';
  columnElement.dataset.columnId = column.id;
  columnElement.draggable = true;

  columnElement.innerHTML = `
  <div class="column-header">
    <h3 class="column-title" title="Дважды кликните для редактирования">${column.name}</h3>
    <button class="btn btn-icon column-options-btn">
      <i class="fas fa-ellipsis-v"></i>
    </button>
  </div>
  <div class="tasks-container">
    ${column.tasks.map(task => createTaskElement(task).outerHTML).join('')}
  </div>
  <div class="add-task">
    <button class="btn btn-add-task">
      <i class="fas fa-plus"></i> Добавить задачу
    </button>
  </div>
`;

  // Обработчик для редактирования названия колонки
  const columnTitle = columnElement.querySelector('.column-title');
  columnTitle.addEventListener('dblclick', () => {
      makeColumnTitleEditable(columnTitle, column);
  });

  // Обработчик для опций колонки
  const optionsBtn = columnElement.querySelector('.column-options-btn');
  optionsBtn.addEventListener('click', () => {
      showColumnOptionsModal(column);
  });

  // Обработчик для добавления новой задачи
  const addTaskBtn = columnElement.querySelector('.btn-add-task');
  addTaskBtn.addEventListener('click', () => {
      addNewTask(column);
  });

  return columnElement;
}

// Функция для создания элемента задачи
function createTaskElement(task) {
  const taskElement = document.createElement('div');
  taskElement.className = 'task';
  taskElement.dataset.taskId = task.id;
  taskElement.draggable = true;

  taskElement.innerHTML = `
  <div class="task-header">
    <h4 class="task-title" title="Дважды кликните для редактирования">${task.title}</h4>
  </div>
  <div class="task-description">
    ${task.description || ''}
  </div>
  <div class="task-footer">
    ${task.dueDate ? `<div class="task-due-date"><i class="far fa-calendar-alt"></i> ${task.dueDate}</div>` : ''}
    <div class="task-actions">
      <button class="btn btn-icon task-edit-btn">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn btn-icon task-delete-btn">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  </div>
`;

  // Обработчик для редактирования задачи
  const editBtn = taskElement.querySelector('.task-edit-btn');
  editBtn.addEventListener('click', () => {
      showTaskEditModal(task);
  });

  // Обработчик для удаления задачи
  const deleteBtn = taskElement.querySelector('.task-delete-btn');
  deleteBtn.addEventListener('click', () => {
      deleteTask(task);
  });

  return taskElement;
}

// Функция для добавления новой колонки
function addNewColumn(project) {
  // Создаем новый ID для колонки
  const newId = project.columns.length > 0
      ? Math.max(...project.columns.map(c => c.id)) + 1
      : 1;

  // Создаем новую колонку
  const newColumn = {
      id: newId,
      name: 'Новая колонка',
      tasks: []
  };

  // Добавляем в проект
  project.columns.push(newColumn);

  // Перерисовываем доску
  renderBoardView(project);

  // Находим новую колонку и запускаем редактирование названия
  setTimeout(() => {
      const newColumnElement = document.querySelector(`.column[data-column-id="${newId}"]`);
      if (newColumnElement) {
          const title = newColumnElement.querySelector('.column-title');
          makeColumnTitleEditable(title, newColumn);
      }
  }, 100);
}

// Функция для добавления новой задачи
function addNewTask(column) {
  // Создаем новый ID для задачи
  const newId = column.tasks.length > 0
      ? Math.max(...column.tasks.map(t => t.id)) + 1
      : 1;

  // Создаем новую задачу
  const newTask = {
      id: newId,
      title: 'Новая задача',
      description: '',
      dueDate: ''
  };

  // Добавляем в колонку
  column.tasks.push(newTask);

  // Находим контейнер для задач в текущей колонке
  const columnElement = document.querySelector(`.column[data-column-id="${column.id}"]`);
  const tasksContainer = columnElement.querySelector('.tasks-container');

  // Создаем и добавляем элемент новой задачи
  const taskElement = createTaskElement(newTask);
  tasksContainer.appendChild(taskElement);

  // Открываем модальное окно для редактирования задачи
  showTaskEditModal(newTask);
}

// Функция для редактирования названия колонки
function makeColumnTitleEditable(titleElement, column) {
  const currentTitle = titleElement.textContent;

  // Создаем input для редактирования
  const inputElement = document.createElement('input');
  inputElement.type = 'text';
  inputElement.value = currentTitle;
  inputElement.className = 'edit-column-title-input';

  // Заменяем h3 на input
  titleElement.parentNode.replaceChild(inputElement, titleElement);

  // Фокусируемся на input и выделяем весь текст
  inputElement.focus();
  inputElement.select();

  // Флаг, чтобы отслеживать, было ли уже выполнено сохранение
  let isSaved = false;

  // Обработчик для сохранения изменений при потере фокуса
  inputElement.addEventListener('blur', () => {
      if (!isSaved) {
          isSaved = true;
          saveColumnTitle(inputElement, column, currentTitle);
      }
  });

  // Обработчик для сохранения изменений при нажатии Enter
  inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          if (!isSaved) {
              isSaved = true;
              saveColumnTitle(inputElement, column, currentTitle);
          }
      } else if (e.key === 'Escape') {
          e.preventDefault();
          if (!isSaved) {
              isSaved = true;
              createColumnTitleElement(currentTitle, column);
          }
      }
  });
}

// Функция для сохранения названия колонки
function saveColumnTitle(inputElement, column, oldTitle) {
  const newTitle = inputElement.value.trim();

  // Если название не пустое, сохраняем его
  if (newTitle) {
      column.name = newTitle;
      createColumnTitleElement(newTitle, column);
  } else {
      createColumnTitleElement(oldTitle, column);
  }
}

// Функция для создания элемента заголовка колонки
function createColumnTitleElement(title, column) {
  const inputElement = document.querySelector('.edit-column-title-input');

  if (inputElement && inputElement.parentNode) {
      const titleElement = document.createElement('h3');
      titleElement.className = 'column-title';
      titleElement.textContent = title;
      titleElement.title = 'Дважды кликните для редактирования';

      // Заменяем input на h3
      inputElement.parentNode.replaceChild(titleElement, inputElement);

      // Добавляем обработчик двойного клика для нового заголовка
      titleElement.addEventListener('dblclick', () => {
          makeColumnTitleEditable(titleElement, column);
      });
  }
}

// Функция для показа модального окна с опциями колонки
function showColumnOptionsModal(column) {
  const modal = document.createElement('div');
  modal.className = 'modal column-options-modal';
  modal.innerHTML = `
  <div class="modal-content">
    <div class="modal-header">
      <h3>Настройки колонки</h3>
      <button class="close-modal-btn">×</button>
    </div>
    <div class="modal-body">
      <ul class="options-list">
        <li class="rename-column"><i class="fas fa-edit"></i> Переименовать</li>
        <li class="clear-column"><i class="fas fa-eraser"></i> Очистить колонку</li>
        <li class="danger delete-column"><i class="fas fa-trash"></i> Удалить колонку</li>
      </ul>
    </div>
  </div>
`;

  document.body.appendChild(modal);

  // Обработчик для закрытия модального окна
  const closeBtn = modal.querySelector('.close-modal-btn');
  closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
  });

  // Закрытие при клике вне модального окна
  modal.addEventListener('click', (e) => {
      if (e.target === modal) {
          document.body.removeChild(modal);
      }
  });

  // Обработчики для опций
  const renameOption = modal.querySelector('.rename-column');
  renameOption.addEventListener('click', () => {
      document.body.removeChild(modal);
      const columnElement = document.querySelector(`.column[data-column-id="${column.id}"]`);
      const titleElement = columnElement.querySelector('.column-title');
      makeColumnTitleEditable(titleElement, column);
  });

  const clearOption = modal.querySelector('.clear-column');
  clearOption.addEventListener('click', () => {
      column.tasks = [];
      document.body.removeChild(modal);

      // Находим текущий проект
      const projectId = document.querySelector('.board').dataset.projectId;
      const project = projects.find(p => p.id === Number(projectId));
      if (project) {
          renderBoardView(project);
      }
  });

  const deleteOption = modal.querySelector('.delete-column');
  deleteOption.addEventListener('click', () => {
      const projectId = document.querySelector('.board').dataset.projectId;
      const project = projects.find(p => p.id === Number(projectId));

      if (project) {
          // Удаляем колонку из проекта
          const columnIndex = project.columns.findIndex(c => c.id === column.id);
          if (columnIndex !== -1) {
              project.columns.splice(columnIndex, 1);
              renderBoardView(project);
          }
      }

      document.body.removeChild(modal);
  });
}

// Функция для показа модального окна редактирования задачи
function showTaskEditModal(task) {
  const modal = document.createElement('div');
  modal.className = 'modal task-edit-modal';
  modal.innerHTML = `
  <div class="modal-content">
    <div class="modal-header">
      <h3>Редактировать задачу</h3>
      <button class="close-modal-btn">×</button>
    </div>
    <div class="modal-body">
      <form class="task-edit-form">
        <div class="form-group">
          <label for="task-title">Название</label>
          <input type="text" id="task-title" class="task-title-input" value="${task.title}">
        </div>
        <div class="form-group">
          <label for="task-description">Описание</label>
          <textarea id="task-description" class="task-description-input">${task.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label for="task-due-date">Срок выполнения</label>
          <input type="date" id="task-due-date" class="task-due-date-input" value="${task.dueDate || ''}">
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-save-task">Сохранить</button>
          <button type="button" class="btn btn-cancel">Отмена</button>
        </div>
      </form>
    </div>
  </div>
`;

  document.body.appendChild(modal);

  // Обработчик для закрытия модального окна
  const closeBtn = modal.querySelector('.close-modal-btn');
  closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
  });

  // Закрытие при клике вне модального окна
  modal.addEventListener('click', (e) => {
      if (e.target === modal) {
          document.body.removeChild(modal);
      }
  });

  // Обработчик для сохранения изменений
  const saveBtn = modal.querySelector('.btn-save-task');
  saveBtn.addEventListener('click', () => {
      const titleInput = modal.querySelector('#task-title');
      const descriptionInput = modal.querySelector('#task-description');
      const dueDateInput = modal.querySelector('#task-due-date');

      // Обновляем данные задачи
      task.title = titleInput.value.trim() || 'Без названия';
      task.description = descriptionInput.value.trim();
      task.dueDate = dueDateInput.value;

      // Обновляем отображение задачи в DOM
      updateTaskElement(task);

      document.body.removeChild(modal);
  });

  // Обработчик для отмены изменений
  const cancelBtn = modal.querySelector('.btn-cancel');
  cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
  });
}

// Функция для обновления элемента задачи в DOM
function updateTaskElement(task) {
  const taskElement = document.querySelector(`.task[data-task-id="${task.id}"]`);
  if (taskElement) {
      taskElement.querySelector('.task-title').textContent = task.title;
      taskElement.querySelector('.task-description').textContent = task.description || '';

      // Обновляем дату выполнения
      let dueDateElem = taskElement.querySelector('.task-due-date');
      if (task.dueDate) {
          if (dueDateElem) {
              dueDateElem.innerHTML = `<i class="far fa-calendar-alt"></i> ${task.dueDate}`;
          } else {
              // Если элемента с датой не было, но она есть теперь, создаем новый
              dueDateElem = document.createElement('div');
              dueDateElem.className = 'task-due-date';
              dueDateElem.innerHTML = `<i class="far fa-calendar-alt"></i> ${task.dueDate}`;

              const taskFooter = taskElement.querySelector('.task-footer');
              const taskActions = taskElement.querySelector('.task-actions');
              taskFooter.insertBefore(dueDateElem, taskActions);
          }
      } else if (dueDateElem) {
          // Если дата была, но теперь её нет, удаляем элемент
          dueDateElem.remove();
      }
  }
}

// Функция для удаления задачи
function deleteTask(task) {
  // Находим колонку, содержащую эту задачу
  const projectId = document.querySelector('.board').dataset.projectId;
  const project = projects.find(p => p.id === Number(projectId));

  if (project) {
      for (const column of project.columns) {
          const taskIndex = column.tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
              // Удаляем задачу из колонки
              column.tasks.splice(taskIndex, 1);

              // Удаляем элемент задачи из DOM
              const taskElement = document.querySelector(`.task[data-task-id="${task.id}"]`);
              if (taskElement) {
                  taskElement.remove();
              }

              break;
          }
      }
  }
}

// Функция для инициализации перетаскивания
function initDragAndDrop() {
  // Переменные для хранения перетаскиваемого элемента и целевой колонки
  let draggedTask = null;
  let draggedColumn = null;
  let originalColumn = null;

  // Получаем все элементы задач и колонок
  const tasks = document.querySelectorAll('.task');
  const columns = document.querySelectorAll('.column');
  const columnsContainer = document.querySelector('.columns-container');

  // Обработчики для перетаскивания задач
  tasks.forEach(task => {
      // Начало перетаскивания
      task.addEventListener('dragstart', (e) => {
          draggedTask = task;
          setTimeout(() => {
              task.classList.add('dragging');
          }, 0);

          // Находим колонку, содержащую эту задачу
          originalColumn = task.closest('.column');
      });

      // Окончание перетаскивания
      task.addEventListener('dragend', () => {
          task.classList.remove('dragging');
          draggedTask = null;

          // Сохраняем изменения в структуре данных
          updateTasksData();
      });
  });

  // Обработчики для перетаскивания колонок
  columns.forEach(column => {
      // Начало перетаскивания колонки
      column.addEventListener('dragstart', (e) => {
          // Предотвращаем перетаскивание, если начали тащить за задачу
          if (e.target.closest('.task')) {
              e.stopPropagation();
              return;
          }

          draggedColumn = column;
          setTimeout(() => {
              column.classList.add('dragging-column');
          }, 0);
      });

      // Окончание перетаскивания колонки
      column.addEventListener('dragend', () => {
          column.classList.remove('dragging-column');
          draggedColumn = null;

          // Сохраняем изменения в структуре данных
          updateColumnsData();
      });
  });

  // Обработчики для колонок, чтобы можно было перетаскивать задачи между ними
  columns.forEach(column => {
      // Разрешаем перетаскивание над колонкой
      column.addEventListener('dragover', (e) => {
          e.preventDefault();

          // Если перетаскиваем задачу
          if (draggedTask) {
              const tasksContainer = column.querySelector('.tasks-container');

              // Находим задачу, над которой находится курсор
              const afterTask = getAfterTask(tasksContainer, e.clientY);

              if (afterTask) {
                  tasksContainer.insertBefore(draggedTask, afterTask);
              } else {
                  tasksContainer.appendChild(draggedTask);
              }
          }
          // Если перетаскиваем колонку
          else if (draggedColumn) {
              const afterColumn = getAfterColumn(e.clientX);

              if (afterColumn) {
                  columnsContainer.insertBefore(draggedColumn, afterColumn);
              } else {
                  columnsContainer.appendChild(draggedColumn);
              }
          }
      });
  });

  // Функция для определения, после какой задачи вставить перетаскиваемую
  function getAfterTask(container, y) {
      const tasks = [...container.querySelectorAll('.task:not(.dragging)')];

      return tasks.reduce((closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;

          if (offset < 0 && offset > closest.offset) {
              return { offset: offset, element: child };
          } else {
              return closest;
          }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  // Функция для определения, после какой колонки вставить перетаскиваемую
  function getAfterColumn(x) {
      const columns = [...document.querySelectorAll('.column:not(.dragging-column)')];

      return columns.reduce((closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = x - box.left - box.width / 2;

          if (offset < 0 && offset > closest.offset) {
              return { offset: offset, element: child };
          } else {
              return closest;
          }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  // Функция для обновления данных задач после перетаскивания
  function updateTasksData() {
      const projectId = document.querySelector('.board').dataset.projectId;
      const project = projects.find(p => p.id === Number(projectId));

      if (!project) return;

      // Создаем временную структуру для хранения новых расположений задач
      const newTasksData = {};

      // Проходим по всем колонкам на странице
      document.querySelectorAll('.column').forEach(columnElem => {
          const columnId = Number(columnElem.dataset.columnId);
          newTasksData[columnId] = [];

          // Проходим по всем задачам в колонке
          columnElem.querySelectorAll('.task').forEach(taskElem => {
              const taskId = Number(taskElem.dataset.taskId);

              // Находим оригинальные данные задачи
              let originalTask = null;
              for (const column of project.columns) {
                  const task = column.tasks.find(t => t.id === taskId);
                  if (task) {
                      originalTask = task;
                      break;
                  }
              }

              if (originalTask) {
                  newTasksData[columnId].push(originalTask);
              }
          });
      });

      // Обновляем структуру данных проекта
      project.columns.forEach(column => {
          if (newTasksData[column.id]) {
              column.tasks = newTasksData[column.id];
          }
      });
  }

  // Функция для обновления данных колонок после перетаскивания
  function updateColumnsData() {
      const projectId = document.querySelector('.board').dataset.projectId;
      const project = projects.find(p => p.id === Number(projectId));

      if (!project) return;

      // Создаем новый массив колонок в порядке их расположения в DOM
      const newColumns = [];

      // Проходим по всем колонкам на странице
      document.querySelectorAll('.column').forEach(columnElem => {
          const columnId = Number(columnElem.dataset.columnId);

          // Находим оригинальные данные колонки
          const originalColumn = project.columns.find(c => c.id === columnId);
          if (originalColumn) {
              newColumns.push(originalColumn);
          }
      });

      // Обновляем порядок колонок в проекте
      project.columns = newColumns;
  }
}

// Функция для отрисовки табличного представления
export function renderTableView(project) {
  const board = document.querySelector('.board');
  board.innerHTML = '';

  // Создаем таблицу
  const tableContainer = document.createElement('div');
  tableContainer.className = 'table-container';

  const table = document.createElement('table');
  table.className = 'tasks-table';

  // Создаем заголовок таблицы
  const thead = document.createElement('thead');
  thead.innerHTML = `
  <tr>
    <th>Название</th>
    <th>Колонка</th>
    <th>Описание</th>
    <th>Срок</th>
    <th>Действия</th>
  </tr>
`;

  // Создаем тело таблицы
  const tbody = document.createElement('tbody');

  // Добавляем строки с задачами
  let taskCount = 0;
  project.columns.forEach(column => {
      column.tasks.forEach(task => {
          taskCount++;
          const tr = document.createElement('tr');
          tr.innerHTML = `
      <td>${task.title}</td>
      <td>${column.name}</td>
      <td>${task.description || '-'}</td>
      <td>${task.dueDate || '-'}</td>
      <td>
        <button class="btn btn-icon task-edit-btn" data-task-id="${task.id}" data-column-id="${column.id}">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-icon task-delete-btn" data-task-id="${task.id}" data-column-id="${column.id}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;
          tbody.appendChild(tr);
      });
  });

  // Если нет задач, показываем сообщение
  if (taskCount === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
    <td colspan="5" class="empty-table-message">Нет задач. Создайте их в режиме доски.</td>
  `;
      tbody.appendChild(emptyRow);
  }

  // Собираем таблицу
  table.appendChild(thead);
  table.appendChild(tbody);
  tableContainer.appendChild(table);
  board.appendChild(tableContainer);

  // Добавляем обработчики событий для кнопок
  const editButtons = document.querySelectorAll('.task-edit-btn');
  editButtons.forEach(btn => {
      btn.addEventListener('click', () => {
          const taskId = Number(btn.dataset.taskId);
          const columnId = Number(btn.dataset.columnId);

          const column = project.columns.find(c => c.id === columnId);
          if (column) {
              const task = column.tasks.find(t => t.id === taskId);
              if (task) {
                  showTaskEditModal(task);
              }
          }
      });
  });

  const deleteButtons = document.querySelectorAll('.task-delete-btn');
  deleteButtons.forEach(btn => {
      btn.addEventListener('click', () => {
          const taskId = Number(btn.dataset.taskId);
          const columnId = Number(btn.dataset.columnId);

          const column = project.columns.find(c => c.id === columnId);
          if (column) {
              const taskIndex = column.tasks.findIndex(t => t.id === taskId);
              if (taskIndex !== -1) {
                  column.tasks.splice(taskIndex, 1);

                  // Удаляем строку из таблицы
                  const row = btn.closest('tr');
                  row.remove();

                  // Если удалили последнюю задачу, показываем сообщение
                  if (document.querySelectorAll('tbody tr').length === 0) {
                      const emptyRow = document.createElement('tr');
                      emptyRow.innerHTML = `
            <td colspan="5" class="empty-table-message">Нет задач. Создайте их в режиме доски.</td>
          `;
                      tbody.appendChild(emptyRow);
                  }
              }
          }
      }
      ) // Здесь отсутствует закрывающая скобка
  })
}

// Добавляем стили для нашей доски
export function addBoardStyles() {
  // Проверяем, не добавлены ли уже стили
  if (document.getElementById('board-styles')) return;

  const styleElement = document.createElement('style');
  styleElement.id = 'board-styles';
  styleElement.textContent = `
/* Стили для контейнера колонок */
.columns-container {
display: flex;
align-items: flex-start;
overflow-x: auto;
padding: 20px;
height: calc(100vh - 150px);
}

/* Стили для колонок */
.column {
min-width: 280px;
max-width: 280px;
background-color: #f1f3f5;
border-radius: 6px;
margin-right: 20px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.column.dragging-column {
opacity: 0.5;
border: 2px dashed #aaa;
}

.column-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 10px 15px;
background-color: rgba(0, 0, 0, 0.05);
border-top-left-radius: 6px;
border-top-right-radius: 6px;
}

.column-title {
margin: 0;
font-size: 16px;
font-weight: 600;
color: #333;
cursor: pointer;
}

.edit-column-title-input {
width: 85%;
padding: 5px;
font-size: 16px;
font-weight: 600;
border: 1px solid #ccc;
border-radius: 4px;
}

/* Стили для контейнера задач */
.tasks-container {
padding: 10px;
min-height: 50px;
max-height: calc(100vh - 250px);
overflow-y: auto;
}

/* Стили для задач */
.task {
background-color: white;
border-radius: 4px;
padding: 10px;
margin-bottom: 10px;
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
cursor: grab;
}

.task.dragging {
opacity: 0.5;
border: 2px dashed #aaa;
}

.task-header {
margin-bottom: 5px;
}

.task-title {
margin: 0;
font-size: 14px;
font-weight: 600;
}

.task-description {
font-size: 12px;
color: #666;
margin-bottom: 10px;
word-wrap: break-word;
}

.task-footer {
display: flex;
justify-content: space-between;
align-items: center;
font-size: 12px;
}

.task-due-date {
color: #666;
}

.task-actions {
display: flex;
}

.task-actions button {
margin-left: 5px;
opacity: 0.7;
}

.task-actions button:hover {
opacity: 1;
}

/* Стили для кнопки добавления задачи */
.add-task {
padding: 10px;
border-bottom-left-radius: 6px;
border-bottom-right-radius: 6px;
}

.btn-add-task {
width: 100%;
text-align: left;
padding: 8px 10px;
background-color: transparent;
border: none;
border-radius: 4px;
cursor: pointer;
color: #666;
transition: background-color 0.2s;
}

.btn-add-task:hover {
background-color: rgba(0, 0, 0, 0.05);
}

/* Стили для кнопки добавления колонки */
.add-column-btn {
min-width: 280px;
padding: 10px;
background-color: rgba(0, 0, 0, 0.05);
border-radius: 6px;
align-self: flex-start;
}

.btn-add {
width: 100%;
padding: 10px;
text-align: center;
background-color: transparent;
border: 2px dashed #ccc;
border-radius: 4px;
cursor: pointer;
color: #666;
transition: background-color 0.2s;
}

.btn-add:hover {
background-color: rgba(0, 0, 0, 0.05);
}

/* Стили для модальных окон */
.modal {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: rgba(0, 0, 0, 0.5);
display: flex;
justify-content: center;
align-items: center;
z-index: 1000;
}

.modal-content {
background-color: white;
border-radius: 6px;
width: 90%;
max-width: 500px;
box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.modal-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 15px 20px;
border-bottom: 1px solid #eee;
}

.modal-header h3 {
margin: 0;
font-size: 18px;
}

.close-modal-btn {
background: none;
border: none;
font-size: 24px;
cursor: pointer;
color: #999;
}

.modal-body {
padding: 20px;
}

.options-list {
list-style: none;
padding: 0;
margin: 0;
}

.options-list li {
padding: 10px 15px;
cursor: pointer;
border-radius: 4px;
}

.options-list li:hover {
background-color: #f5f5f5;
}

.options-list li i {
margin-right: 10px;
width: 16px;
text-align: center;
}

.options-list li.danger {
color: #e74c3c;
}

.options-list li.danger:hover {
background-color: #fee;
}

/* Стили для формы редактирования задачи */
.form-group {
margin-bottom: 15px;
}

.form-group label {
display: block;
margin-bottom: 5px;
font-weight: 600;
color: #555;
}

.form-group input,
.form-group textarea {
width: 100%;
padding: 8px 10px;
border: 1px solid #ddd;
border-radius: 4px;
font-size: 14px;
}

.form-group textarea {
min-height: 100px;
resize: vertical;
}

.form-actions {
display: flex;
justify-content: flex-end;
gap: 10px;
margin-top: 20px;
}

.btn-save-task {
background-color: #4CAF50;
color: white;
border: none;
padding: 8px 15px;
border-radius: 4px;
cursor: pointer;
}

.btn-cancel {
background-color: #eee;
border: none;
padding: 8px 15px;
border-radius: 4px;
cursor: pointer;
}

/* Стили для таблицы задач */
.table-container {
padding: 20px;
overflow-x: auto;
height: calc(100vh - 150px);
}

.tasks-table {
width: 100%;
border-collapse: collapse;
background-color: white;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tasks-table th,
.tasks-table td {
padding: 12px 15px;
text-align: left;
border-bottom: 1px solid #eee;
}

.tasks-table th {
background-color: #f8f9fa;
font-weight: 600;
color: #333;
}

.tasks-table tr:hover {
background-color: #f9f9f9;
}

.empty-table-message {
text-align: center;
color: #999;
padding: 30px 0;
}
`;

  document.head.appendChild(styleElement);
}

// Интеграция с board.js
export function setupViewSwitching(projectId) {
  const project = projects.find(p => p.id === Number(projectId));
  if (!project) return;

  // Добавляем стили для доски
  addBoardStyles();

  // Обработчики для переключения видов
  const boardViewBtn = document.querySelector('.board-view-btn');
  const tableViewBtn = document.querySelector('.table-view-btn');

  if (boardViewBtn) {
      boardViewBtn.addEventListener('click', () => {
          renderBoardView(project);
      });
  }

  if (tableViewBtn) {
      tableViewBtn.addEventListener('click', () => {
          renderTableView(project);
      });
  }

  // По умолчанию показываем доску
  renderBoardView(project);
}

// Экспортируем функцию для получения текущего активного вида
export function getActiveView() {
  const boardViewBtn = document.querySelector('.board-view-btn');
  const tableViewBtn = document.querySelector('.table-view-btn');

  if (boardViewBtn && boardViewBtn.classList.contains('active')) {
      return 'board';
  } else if (tableViewBtn && tableViewBtn.classList.contains('active')) {
      return 'table';
  }

  return 'board'; // По умолчанию
}

// Функция для обновления текущего вида
export function refreshCurrentView(projectId) {
  const project = projects.find(p => p.id === Number(projectId));
  if (!project) return;

  const activeView = getActiveView();

  if (activeView === 'board') {
      renderBoardView(project);
  } else if (activeView === 'table') {
      renderTableView(project);
  }
}