import { projects, closeAside, toggleFavorite } from './app.js';
import { initializeBoard, setupViewSwitching } from './app.js';

export function openProject(projectId) {
  const project = projects.find(p => p.id === Number(projectId));
  if (!project) return;

  closeAside();
  const mainContent = document.querySelector('.main-content');
  mainContent.innerHTML = `
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
            <button class="btn btn-view board-view-btn active">
              <i class="fas fa-columns"></i> Board
            </button>
            <button class="btn btn-view table-view-btn">
              <i class="fas fa-table"></i> Table
            </button>
            <button class="btn btn-view calendar-view-btn">
              <i class="fas fa-calendar-alt"></i> Calendar
            </button>
          </div>
          <button class="btn btn-icon more-options-btn" title="More options">
            <i class="fas fa-ellipsis-h"></i>
          </button>
        </div>
      </div>
      <!-- Здесь будет содержимое доски -->
    </div>
  `;

  // Добавляем обработчик двойного клика для заголовка
  const projectTitle = document.querySelector('.project-title');
  projectTitle.addEventListener('dblclick', makeEditable);

  // Обновляем обработчик события для кнопки избранного
  const favoriteBtn = document.querySelector('.favorite-btn');
  favoriteBtn.addEventListener('click', () => {
    // Используем функцию toggleFavorite вместо существующего кода
    toggleFavorite(project.id);
  });

  // Инициализируем доску и установим переключение видов
  setupViewSwitching(project.id);

  // More options button (ellipsis)
  document.querySelector('.more-options-btn').addEventListener('click', () => {
    console.log('More options clicked');
    showMoreOptionsModal();
  });

  // View switching buttons
  const boardViewBtn = document.querySelector('.board-view-btn');
  const tableViewBtn = document.querySelector('.table-view-btn');
  const calendarViewBtn = document.querySelector('.calendar-view-btn');

  boardViewBtn.addEventListener('click', () => {
    setActiveView(boardViewBtn);
    console.log('Board view selected');
    // Add board view rendering logic here
  });

  tableViewBtn.addEventListener('click', () => {
    setActiveView(tableViewBtn);
    console.log('Table view selected');
    // Add table view rendering logic here
  });

  calendarViewBtn.addEventListener('click', () => {
    setActiveView(calendarViewBtn);
    console.log('Calendar view selected');
    // Add calendar view rendering logic here
  });

  // More options button (ellipsis)
  document.querySelector('.more-options-btn').addEventListener('click', () => {
    console.log('More options clicked');
    showMoreOptionsModal();
  });

}
// Helper function to set active view button
function setActiveView(activeButton) {
  const viewButtons = document.querySelectorAll('.btn-view');
  viewButtons.forEach(btn => btn.classList.remove('active'));
  activeButton.classList.add('active');
}

const handleAsideToggle = (e) => {
  const board = document.querySelector('.board');
  if (board) {
    // Настраиваем доску в зависимости от состояния aside
    if (e.detail.isOpen) {
      board.style.width = 'calc(100% - 300px)';
      board.style.marginLeft = '300px';
    } else {
      board.style.width = 'calc(100% - 20px)';
      board.style.marginLeft = '20px';
    }
  }
};

function showMoreOptionsModal() {
  const modal = document.createElement('div');
  modal.className = 'modal more-options-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Board Options</h3>
        <button class="close-modal-btn">×</button>
      </div>
      <div class="modal-body">
        <ul class="options-list">
          <li><i class="fas fa-plus"></i> Add Task</li>
          <li><i class="fas fa-user-plus"></i> Share Board</li>
          <li><i class="fas fa-filter"></i> Filter Tasks</li>
          <li><i class="fas fa-sort"></i> Sort Tasks</li>
          <li><i class="fas fa-cog"></i> Board Settings</li>
          <li class="danger"><i class="fas fa-trash"></i> Delete Board</li>
        </ul>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listener for closing the modal
  const closeBtn = modal.querySelector('.close-modal-btn');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  // Close modal when clicking outside of it
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  // Add event listeners for options list items
  const optionItems = modal.querySelectorAll('.options-list li');
  optionItems.forEach(item => {
    item.addEventListener('click', () => {
      console.log('Option selected:', item.textContent.trim());
      document.body.removeChild(modal);
    });
  });
}

// Функция для преобразования заголовка в редактируемое поле
// Исправленная функция makeEditable
function makeEditable(e) {
  const titleElement = e.target;
  const projectId = document.querySelector('.board').dataset.projectId;
  const currentTitle = titleElement.textContent;

  // Создаем input для редактирования
  const inputElement = document.createElement('input');
  inputElement.type = 'text';
  inputElement.value = currentTitle;
  inputElement.className = 'edit-title-input';
  inputElement.style.fontSize = window.getComputedStyle(titleElement).fontSize;
  inputElement.style.fontWeight = 'bold';
  inputElement.style.width = '100%';

  // Заменяем h1 на input
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
      saveTitle(inputElement, projectId);
    }
  });

  // Обработчик для сохранения изменений при нажатии Enter
  inputElement.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Предотвращаем стандартное поведение
      if (!isSaved) {
        isSaved = true;
        saveTitle(inputElement, projectId);
      }
    } else if (e.key === 'Escape') {
      // Восстанавливаем исходное название при нажатии Escape
      e.preventDefault();
      if (!isSaved) {
        isSaved = true;
        createTitleElement(currentTitle, projectId);
      }
    }
  });
}

// Исправленная функция saveTitle
function saveTitle(inputElement, projectId) {
  const newTitle = inputElement.value.trim();

  // Если название не пустое, сохраняем его
  if (newTitle) {
    // Находим проект в массиве проектов и обновляем название
    const project = projects.find(p => p.id === Number(projectId));
    if (project) {
      project.name = newTitle;

      // Обновляем название в боковой панели
      updateProjectNameInSidebar(projectId, newTitle);
    }

    // Создаем новый элемент заголовка с обновленным названием
    createTitleElement(newTitle, projectId);
  } else {
    // Если название пустое, восстанавливаем исходное название
    const project = projects.find(p => p.id === Number(projectId));
    if (project) {
      createTitleElement(project.name, projectId);
    }
  }
}

// Исправленная функция createTitleElement
function createTitleElement(title, projectId) {
  const inputElement = document.querySelector('.edit-title-input');

  if (inputElement && inputElement.parentNode) {
    const titleElement = document.createElement('h1');
    titleElement.className = 'project-title';
    titleElement.textContent = title;
    titleElement.title = 'Дважды кликните для редактирования';

    // Проверяем, что inputElement всё ещё в DOM
    if (document.contains(inputElement)) {
      // Заменяем input на h1
      inputElement.parentNode.replaceChild(titleElement, inputElement);

      // Добавляем обработчик двойного клика для нового заголовка
      titleElement.addEventListener('dblclick', makeEditable);
    }
  }
}

// Новая функция для обновления названия в боковой панели
function updateProjectNameInSidebar(projectId, newName) {
  // Находим элемент проекта в боковой панели по его ID
  const projectItem = document.querySelector(`.project-item[data-id="${projectId}"]`);
  if (projectItem) {
    // Находим элемент с названием проекта и обновляем его текст
    const projectNameElement = projectItem.querySelector('.project-name');
    if (projectNameElement) {
      projectNameElement.textContent = newName;
    }
  }
}

document.addEventListener('asideToggled', handleAsideToggle);