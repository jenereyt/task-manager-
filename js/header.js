// Функция создания хедера в стиле Trello

export function createTrelloHeader() {
  let headerHTML = `
    <header class="trello-header">
      <div class="header-left">
        <button class="header-btn home-btn">
          <i class="fas fa-home"></i>
        </button>
        <button class="header-btn boards-btn">
          <i class="fas fa-th-large"></i>
          <span>Доски</span>
        </button>
        <div class="search-container">
          <input type="text" class="search-input" placeholder="Поиск...">
          <i class="fas fa-search search-icon"></i>
        </div>
      </div>
      
      <div class="header-center">
        <div class="logo">
          <i class="fab fa-trello"></i>
          <span>Task Manager</span>
        </div>
      </div>
      
      <div class="header-right">
        <button class="header-btn create-btn">
          <i class="fas fa-plus"></i>
        </button>
        <button class="header-btn info-btn">
          <i class="fas fa-info-circle"></i>
        </button>
        <button class="header-btn notifications-btn">
          <i class="fas fa-bell"></i>
          <span class="notification-badge">2</span>
        </button>
        <div class="user-menu">
          <div class="avatar-circle">
            <span>A</span>
          </div>
        </div>
      </div>
    </header>
  `;

  // Вставляем хедер перед основным контейнером
  let appContainer = document.querySelector('.app');
  appContainer.insertAdjacentHTML('afterbegin', headerHTML);

  // Добавляем функциональность хедера
  setupTrelloHeaderFunctionality();
}

// Функция для настройки функциональности хедера в стиле Trello
 export function setupTrelloHeaderFunctionality() {
  // Выпадающее меню для кнопки "Доски"
  const boardsBtn = document.querySelector('.boards-btn');
  boardsBtn.addEventListener('click', function (e) {
    e.stopPropagation();

    // Проверяем, существует ли уже меню
    let boardsMenu = document.querySelector('.boards-dropdown');
    if (boardsMenu) {
      boardsMenu.remove();
      return;
    }

    const menuHTML = `
      <div class="boards-dropdown">
        <div class="dropdown-header">
          <span>Ваши доски</span>
          <button class="view-all-btn">Просмотреть все</button>
        </div>
        <ul class="boards-list">
          <li class="board-item">
            <div class="board-color" style="background-color: #0079bf;"></div>
            <span class="board-name">Веб-разработка</span>
            <span class="board-star"><i class="far fa-star"></i></span>
          </li>
          <li class="board-item">
            <div class="board-color" style="background-color: #70b500;"></div>
            <span class="board-name">Маркетинг</span>
            <span class="board-star"><i class="fas fa-star"></i></span>
          </li>
          <li class="board-item">
            <div class="board-color" style="background-color: #ff9f1a;"></div>
            <span class="board-name">Дизайн проекты</span>
            <span class="board-star"><i class="far fa-star"></i></span>
          </li>
        </ul>
        <div class="dropdown-footer">
          <button class="create-board-btn">
            <i class="fas fa-plus"></i>
            <span>Создать доску</span>
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', menuHTML);
    boardsMenu = document.querySelector('.boards-dropdown');

    // Позиционируем меню под кнопкой
    const rect = boardsBtn.getBoundingClientRect();
    boardsMenu.style.top = `${rect.bottom}px`;
    boardsMenu.style.left = `${rect.left}px`;

    // Закрываем при клике вне меню
    document.addEventListener('click', function closeMenu() {
      boardsMenu.remove();
      document.removeEventListener('click', closeMenu);
    }, { once: true });

    // Добавляем функциональность звездочек
    const stars = boardsMenu.querySelectorAll('.board-star');
    stars.forEach(star => {
      star.addEventListener('click', function (e) {
        e.stopPropagation();
        const icon = this.querySelector('i');
        if (icon.classList.contains('far')) {
          icon.classList.remove('far');
          icon.classList.add('fas');
        } else {
          icon.classList.remove('fas');
          icon.classList.add('far');
        }
      });
    });
  });

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
            <i class="fas fa-th-large"></i>
            <span>Доска</span>
          </li>
          <li data-action="create-card">
            <i class="fas fa-sticky-note"></i>
            <span>Карточка</span>
          </li>
          <li data-action="create-workspace">
            <i class="fas fa-users"></i>
            <span>Рабочее пространство</span>
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
      if (action) {
        console.log(`Действие: ${action}`);
        // Здесь можно добавить обработку соответствующих действий
      }
      createMenu.remove();
    });

    // Закрываем при клике вне меню
    document.addEventListener('click', function closeMenu() {
      createMenu.remove();
      document.removeEventListener('click', closeMenu);
    }, { once: true });
  });

  // Уведомления
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
          <button class="settings-btn"><i class="fas fa-cog"></i></button>
        </div>
        <div class="notifications-list">
          <div class="notification-item unread">
            <div class="notification-avatar">
              <div class="avatar-circle small">
                <span>И</span>
              </div>
            </div>
            <div class="notification-content">
              <p><strong>Иван</strong> добавил вас на доску <strong>Веб-разработка</strong></p>
              <span class="notification-time">2 часа назад</span>
            </div>
            <div class="notification-actions">
              <button class="notification-btn"><i class="fas fa-check"></i></button>
            </div>
          </div>
          <div class="notification-item unread">
            <div class="notification-avatar">
              <div class="avatar-circle small">
                <span>О</span>
              </div>
            </div>
            <div class="notification-content">
              <p><strong>Ольга</strong> прокомментировала карточку <strong>Дизайн лендинга</strong></p>
              <span class="notification-time">вчера</span>
            </div>
            <div class="notification-actions">
              <button class="notification-btn"><i class="fas fa-check"></i></button>
            </div>
          </div>
          <div class="notification-item">
            <div class="notification-avatar">
              <div class="avatar-circle small">
                <span>С</span>
              </div>
            </div>
            <div class="notification-content">
              <p>Срок выполнения задачи <strong>Написать документацию</strong> истекает завтра</p>
              <span class="notification-time">3 дня назад</span>
            </div>
            <div class="notification-actions">
              <button class="notification-btn"><i class="fas fa-check"></i></button>
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

    // Обработчики для кнопок подтверждения уведомлений
    const confirmButtons = notificationsPanel.querySelectorAll('.notification-btn');
    confirmButtons.forEach(button => {
      button.addEventListener('click', function (e) {
        e.stopPropagation();
        const notificationItem = this.closest('.notification-item');
        notificationItem.classList.remove('unread');
        notificationItem.style.opacity = '0.6';

        // Уменьшаем счетчик непрочитанных уведомлений
        const badge = document.querySelector('.notification-badge');
        let count = parseInt(badge.textContent);
        if (count > 0) {
          count--;
          badge.textContent = count;
          if (count === 0) {
            badge.style.display = 'none';
          }
        }
      });
    });

    // Закрываем при клике вне панели
    document.addEventListener('click', function closePanel(event) {
      if (!notificationsPanel.contains(event.target) && event.target !== notificationsBtn) {
        notificationsPanel.remove();
        document.removeEventListener('click', closePanel);
      }
    });
  });

  // Пользовательское меню
  const userMenu = document.querySelector('.user-menu');
  userMenu.addEventListener('click', function (e) {
    e.stopPropagation();

    // Проверяем, существует ли уже меню
    let userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown) {
      userDropdown.remove();
      return;
    }

    const userDropdownHTML = `
      <div class="user-dropdown">
        <div class="user-dropdown-header">
          <div class="avatar-circle medium">
            <span>A</span>
          </div>
          <div class="user-info">
            <div class="user-name">Александр Иванов</div>
            <div class="user-email">alex@example.com</div>
          </div>
        </div>
        <ul class="dropdown-menu">
          <li><i class="fas fa-user"></i> Профиль</li>
          <li><i class="fas fa-cog"></i> Настройки</li>
          <li><i class="fas fa-palette"></i> Тема</li>
          <li class="divider"></li>
          <li><i class="fas fa-sign-out-alt"></i> Выйти</li>
        </ul>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', userDropdownHTML);
    userDropdown = document.querySelector('.user-dropdown');

    // Позиционируем меню
    const rect = userMenu.getBoundingClientRect();
    userDropdown.style.top = `${rect.bottom}px`;
    userDropdown.style.right = `${window.innerWidth - rect.right}px`;

    // Закрываем при клике вне меню
    document.addEventListener('click', function closeMenu() {
      userDropdown.remove();
      document.removeEventListener('click', closeMenu);
    }, { once: true });
  });
}
