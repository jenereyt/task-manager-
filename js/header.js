// Добавляем HTML структуру хедера
function createHeader() {
  const headerHTML = `
    <header class="app-header">
      <div class="header-left">
        <div class="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#2684FF"/>
            <rect x="5" y="5" width="6" height="9" rx="1" fill="white"/>
            <rect x="13" y="5" width="6" height="14" rx="1" fill="white"/>
          </svg>
          <span>Task Manager</span>
        </div>
        
        <div class="quick-actions">
          <button class="header-btn recent-btn">
            <i class="fas fa-clock"></i>
            <span>Недавние</span>
          </button>
          <button class="header-btn starred-btn">
            <i class="fas fa-star"></i>
            <span>Избранное</span>
          </button>
          <button class="header-btn templates-btn">
            <i class="fas fa-layer-group"></i>
            <span>Шаблоны</span>
          </button>
        </div>
      </div>
      
      <div class="header-center">
        <div class="search-container">
          <input type="text" class="search-input" placeholder="Поиск...">
          <i class="fas fa-search search-icon"></i>
        </div>
      </div>
      
      <div class="header-right">
        <button class="header-btn create-btn">
          <i class="fas fa-plus"></i>
          <span>Создать</span>
        </button>
        <button class="header-btn notifications-btn">
          <i class="fas fa-bell"></i>
          <span class="notification-badge">2</span>
        </button>
        <div class="user-menu">
          <div class="avatar-circle header-avatar">
            <span>A</span>
          </div>
        </div>
      </div>
    </header>
  `;

  // Вставляем хедер перед основным контейнером
  const appContainer = document.querySelector('.app');
  appContainer.insertAdjacentHTML('afterbegin', headerHTML);
}
// Функции для работы с хедером
function setupHeaderFunctionality() {
  // Выпадающее меню для кнопки "Создать"
  const createBtn = document.querySelector('.create-btn');
  createBtn.addEventListener('click', function (e) {
    e.stopPropagation();

    // Проверяем, существует ли уже меню
    let createMenu = document.querySelector('.create-dropdown');
    if (createMenu) {
      createMenu.remove();
      return;
    }

    const menuHTML = `
      <div class="create-dropdown">
        <div class="dropdown-header">Создать</div>
        <ul>
          <li data-action="create-board">
            <i class="fas fa-chalkboard"></i>
            <span>Доска</span>
          </li>
          <li data-action="create-project">
            <i class="fas fa-project-diagram"></i>
            <span>Проект</span>
          </li>
          <li data-action="create-task">
            <i class="fas fa-tasks"></i>
            <span>Задача</span>
          </li>
          <li class="divider"></li>
          <li data-action="create-template">
            <i class="fas fa-copy"></i>
            <span>Шаблон</span>
          </li>
        </ul>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', menuHTML);
    createMenu = document.querySelector('.create-dropdown');

    // Позиционируем меню под кнопкой
    const rect = createBtn.getBoundingClientRect();
    createMenu.style.top = `${rect.bottom}px`;
    createMenu.style.left = `${rect.left}px`;

    // Обработчик выбора пункта меню
    createMenu.addEventListener('click', function (e) {
      const action = e.target.closest('li')?.dataset.action;
      if (action === 'create-project') {
        showModal();
      }
      createMenu.remove();
    });

    // Закрываем при клике вне меню
    document.addEventListener('click', function closeMenu() {
      createMenu.remove();
      document.removeEventListener('click', closeMenu);
    }, { once: true });
  });

  // Всплывающие уведомления
  const notificationsBtn = document.querySelector('.notifications-btn');
  notificationsBtn.addEventListener('click', function (e) {
    e.stopPropagation();

    // Проверяем, существует ли уже панель уведомлений
    let notificationsPanel = document.querySelector('.notifications-panel');
    if (notificationsPanel) {
      notificationsPanel.remove();
      return;
    }

    const notificationsHTML = `
      <div class="notifications-panel">
        <div class="panel-header">
          <h3>Уведомления</h3>
          <button class="mark-read-btn">Отметить все как прочитанные</button>
        </div>
        <div class="notifications-list">
          <div class="notification-item unread">
            <div class="notification-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <div class="notification-content">
              <p>Иван пригласил вас в проект "Веб-разработка"</p>
              <span class="notification-time">2 часа назад</span>
            </div>
          </div>
          <div class="notification-item unread">
            <div class="notification-icon">
              <i class="fas fa-comment"></i>
            </div>
            <div class="notification-content">
              <p>Ольга оставила комментарий к задаче "Создать дизайн"</p>
              <span class="notification-time">вчера</span>
            </div>
          </div>
          <div class="notification-item">
            <div class="notification-icon">
              <i class="fas fa-tasks"></i>
            </div>
            <div class="notification-content">
              <p>Задача "Написать документацию" выполнена</p>
              <span class="notification-time">3 дня назад</span>
            </div>
          </div>
        </div>
        <div class="panel-footer">
          <a href="#">Все уведомления</a>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', notificationsHTML);
    notificationsPanel = document.querySelector('.notifications-panel');

    // Позиционируем панель
    const rect = notificationsBtn.getBoundingClientRect();
    notificationsPanel.style.top = `${rect.bottom}px`;
    notificationsPanel.style.right = `${window.innerWidth - rect.right}px`;

    // Закрываем при клике вне панели
    document.addEventListener('click', function closePanel(event) {
      if (!notificationsPanel.contains(event.target) && event.target !== notificationsBtn) {
        notificationsPanel.remove();
        document.removeEventListener('click', closePanel);
      }
    });

    // Обработчик кнопки "Отметить все как прочитанные"
    const markReadBtn = notificationsPanel.querySelector('.mark-read-btn');
    markReadBtn.addEventListener('click', function () {
      const unreadItems = notificationsPanel.querySelectorAll('.notification-item.unread');
      unreadItems.forEach(item => item.classList.remove('unread'));
      notificationsBtn.querySelector('.notification-badge').style.display = 'none';
    });
  });

  // Поиск
  const searchInput = document.querySelector('.search-input');
  searchInput.addEventListener('focus', function () {
    // Показать подсказки недавних поисковых запросов
    const searchTipsHTML = `
      <div class="search-tips">
        <div class="search-tips-header">
          <span>Недавние запросы</span>
          <button class="clear-search-btn">Очистить</button>
        </div>
        <ul class="recent-searches">
          <li><i class="fas fa-history"></i> Дизайн лендинга</li>
          <li><i class="fas fa-history"></i> Баг в мобильной версии</li>
          <li><i class="fas fa-history"></i> Копирайтинг</li>
        </ul>
      </div>
    `;

    // Проверяем, существуют ли уже подсказки
    let searchTips = document.querySelector('.search-tips');
    if (!searchTips) {
      const searchContainer = document.querySelector('.search-container');
      searchContainer.insertAdjacentHTML('beforeend', searchTipsHTML);
      searchTips = document.querySelector('.search-tips');

      // Обработчик клика на кнопку очистки
      const clearBtn = searchTips.querySelector('.clear-search-btn');
      clearBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const recentSearches = searchTips.querySelector('.recent-searches');
        recentSearches.innerHTML = '<li class="empty-search">Нет недавних запросов</li>';
      });
    }
  });

  searchInput.addEventListener('blur', function () {
    // Скрываем подсказки с задержкой для возможности клика
    setTimeout(() => {
      const searchTips = document.querySelector('.search-tips');
      if (searchTips) {
        searchTips.remove();
      }
    }, 150);
  });
}
// Модифицируем функцию инициализации
function init() {
  createStructure();
  createHeader();  // Добавляем создание хедера
  createModal();
  setupEventListeners();
  setupHeaderFunctionality();  // Добавляем функциональность хедера
  addHeaderStyles();  // Добавляем стили для хедера
}
