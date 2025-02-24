let isAsideOpen = false;
let projects = [];
let activeTab = 'projects';
const gradients = [
  { id: 1, name: 'Океанский бриз', value: 'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)' },
  { id: 2, name: 'Пурпурное блаженство', value: 'linear-gradient(135deg, #7f7fd5 0%, #86a8e7 50%, #91eae4 100%)' },
  { id: 3, name: 'Летний закат', value: 'linear-gradient(135deg, #fd746c 0%, #ff9068 100%)' },
  { id: 4, name: 'Лесное утро', value: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' },
  { id: 5, name: 'Лавандовое поле', value: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { id: 6, name: 'Песчаный пляж', value: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }
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
              <button class="tab-btn active" d  ata-tab="account">
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

function toggleAside() {
  isAsideOpen = !isAsideOpen;
  document.querySelector('.aside').classList.toggle('open');
  document.querySelector('.main-content').classList.toggle('aside-open');
  const toggleBtnImg = document.querySelector('.toggle-btn img');
  toggleBtnImg.src = isAsideOpen ? '/assets/left_arrow_icon.svg' : '/assets/right_arrow_icon.svg';
}

function closeAside() {
  isAsideOpen = false;
  document.querySelector('.aside').classList.remove('open');
  document.querySelector('.main-content').classList.remove('aside-open');
  document.querySelector('.toggle-btn').innerHTML = '☰';
}

function setupAsideInteraction() {
  const aside = document.querySelector('.aside');
  const toggleBtn = document.querySelector('.toggle-btn');
  const toggleBtnImg = toggleBtn.querySelector('img');

  function toggleAside() {
    isAsideOpen = !isAsideOpen;
    aside.classList.toggle('open');
    document.querySelector('.main-content').classList.toggle('aside-open');

    // Update arrow icon
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

  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Update tab content
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

function openProject(projectId) {
  const project = projects.find(p => p.id === Number(projectId));
  if (!project) return;

  closeAside();
  const mainContent = document.querySelector('.main-content');
  mainContent.innerHTML = `
    <div class="board" style="background: ${project.background}">
      <h1>${project.name}</h1>
      <!-- Здесь будет содержимое доски -->
    </div>
  `;
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
  // Основные элементы интерфейса
  const toggleBtn = document.querySelector('.toggle-btn');
  const aside = document.querySelector('.aside');
  const createProjectBtn = document.querySelector('.create-project-btn');
  const projectsList = document.querySelector('.projects-list');
  const tabButtons = document.querySelectorAll('.tab-btn');

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleAside();
  });

  // Обработчики для табов
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchTab(e.target.closest('.tab-btn').dataset.tab);
    });
  });

  // Обработчик создания проекта
  createProjectBtn.addEventListener('click', () => {
    showModal();
  });

  // Обработчик открытия проекта
  projectsList.addEventListener('click', (e) => {
    const projectItem = e.target.closest('.project-item');
    if (projectItem) {
      openProject(projectItem.dataset.id);
    }
  });

  // Настройка модального окна
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
      background: selectedGradient.dataset.gradient
    };

    projects.unshift(project);

    const projectElement = document.createElement('div');
    projectElement.className = 'project-item';
    projectElement.dataset.id = project.id;
    projectElement.style.background = project.background;
    projectElement.innerHTML = `
      <div class="project-info">
        <span class="project-name">${project.name}</span>
        <span class="project-date">${project.timestamp}</span>
      </div>
    `;

    const projectsList = document.querySelector('.projects-list');
    projectsList.insertBefore(projectElement, projectsList.firstChild);

    modal.style.display = 'none';
  });
}

function init() {
  createStructure();
  createModal();
  setupEventListeners();
  setupAsideInteraction();
  switchTab('account');
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
  init();
});
