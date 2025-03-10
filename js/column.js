// Импортируем необходимые функции
import { addNewTask } from './card.js';

export function addNewColumn() {
    const boardView = document.querySelector('.board-view');
    const addColumnDiv = document.querySelector('.add-column');

    if (!boardView || !addColumnDiv) {
        console.error("Board view or add column div not found!");
        return;
    }

    // Генерируем уникальный ID для колонки
    const columnId = 'column-' + Date.now();

    // Создаем элемент новой колонки
    const columnElement = document.createElement('div');
    columnElement.className = 'board-column';
    columnElement.dataset.columnId = columnId;

    // Разметка колонки с полем ввода и кнопкой для задач
    columnElement.innerHTML = `
    <div class="column-header">
      <div class="editable-column-name">
        <input type="text" class="column-name-input" placeholder="Введите название колонки..." autofocus>
      </div>
      <div class="column-header-actions">
        <button class="btn btn-icon column-options-btn" title="Опции колонки"><i class="fas fa-ellipsis-v"></i></button>
      </div>
    </div>
    <div class="column-content" data-column="${columnId}"></div>
    <button class="btn btn-icon add-task-btn" title="Добавить задачу"><i class="fas fa-plus"></i> Добавить задачу</button>
  `;

    // Вставляем колонку перед кнопкой "Добавить колонку"
    boardView.insertBefore(columnElement, addColumnDiv);

    // Фокус на поле ввода названия колонки
    const inputField = columnElement.querySelector('.column-name-input');
    if (inputField) {
        inputField.focus();

        inputField.addEventListener('blur', function () {
            saveColumnName(this, columnElement);
        });

        inputField.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            } else if (e.key === 'Escape') {
                if (!this.value.trim()) {
                    boardView.removeChild(columnElement);
                } else {
                    this.blur();
                }
            }
        });
    }

    // Обработчик для кнопки добавления задач
    const addTaskBtn = columnElement.querySelector('.add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function () {
            addNewTask(columnElement);
        });
    }

    // Добавляем обработчик для кнопки опций колонки
    const optionsBtn = columnElement.querySelector('.column-options-btn');
    if (optionsBtn) {
        optionsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openColumnModal(columnElement);
        });
    }
}

export function saveColumnName(inputField, columnElement) {
    const columnName = inputField.value.trim();
    const defaultName = `Колонка ${document.querySelectorAll('.board-column:not(.add-column)').length}`;
    const finalName = columnName || defaultName;

    // Заменяем поле ввода на заголовок
    const columnHeader = columnElement.querySelector('.editable-column-name');
    if (columnHeader) {
        columnHeader.innerHTML = `<h3 class="column-title" title="Двойной клик для редактирования">${finalName}</h3>`;
        
        // Добавляем возможность редактирования по двойному клику
        const columnTitle = columnHeader.querySelector('.column-title');
        if (columnTitle) {
            columnTitle.addEventListener('dblclick', function() {
                makeColumnNameEditable(columnElement);
            });
        }
    }
}

// Функция для редактирования названия колонки
export function makeColumnNameEditable(columnElement) {
    const columnHeader = columnElement.querySelector('.editable-column-name');
    const columnTitle = columnHeader.querySelector('.column-title');
    const currentName = columnTitle.textContent;
    
    columnHeader.innerHTML = `<input type="text" class="column-name-input" value="${currentName}" autofocus>`;
    
    const inputField = columnHeader.querySelector('.column-name-input');
    inputField.focus();
    inputField.select();
    
    inputField.addEventListener('blur', function() {
        saveColumnName(this, columnElement);
    });
    
    inputField.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.value = currentName;
            this.blur();
        }
    });
}

// Функция для открытия модального окна колонки
export function openColumnModal(columnElement) {
    // Удаляем существующее модальное окно, если оно есть
    const existingModal = document.querySelector('.column-modal-overlay');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    const columnId = columnElement.dataset.columnId;
    const columnTitle = columnElement.querySelector('.column-title')?.textContent || 'Колонка без названия';
    const tasksCount = columnElement.querySelectorAll('.task').length;
    const creationDate = columnElement.dataset.creationDate || new Date().toLocaleDateString();
    
    // Сохраняем дату создания, если она еще не была сохранена
    if (!columnElement.dataset.creationDate) {
        columnElement.dataset.creationDate = creationDate;
    }
    
    // Создаем оверлей и модальное окно
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'column-modal-overlay';
    
    modalOverlay.innerHTML = `
        <div class="column-modal" data-column-id="${columnId}">
            <div class="modal-header">
                <h2>Настройки колонки</h2>
                <button class="btn btn-icon close-modal-btn" title="Закрыть"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-content">
                <div class="modal-section">
                    <label for="modal-column-name">Название колонки:</label>
                    <input type="text" id="modal-column-name" class="modal-input" value="${columnTitle}">
                </div>
                
                <div class="modal-section">
                    <h3>Информация о колонке</h3>
                    <div class="column-stats">
                        <p>Количество задач: <span class="tasks-count">${tasksCount}</span></p>
                        <p>Дата создания: <span>${creationDate}</span></p>
                        <p>ID колонки: <span class="column-id">${columnId}</span></p>
                    </div>
                </div>
                
                <div class="modal-section">
                    <h3>Настройки отображения</h3>
                    <div class="color-settings">
                        <label for="column-color">Цвет колонки:</label>
                        <input type="color" id="column-color" value="#f1f1f1">
                    </div>
                    <div class="display-settings">
                        <label>
                            <input type="checkbox" id="collapsed-mode" ${columnElement.classList.contains('collapsed') ? 'checked' : ''}>
                            Свернутый режим
                        </label>
                    </div>
                </div>
                
                <div class="modal-section">
                    <h3>Дополнительные действия</h3>
                    <div class="column-actions">
                        <button class="btn btn-secondary archive-tasks-btn">Архивировать все задачи</button>
                        <button class="btn btn-secondary sort-tasks-btn">Сортировать задачи по дате</button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary save-column-btn">Сохранить</button>
                <button class="btn btn-danger delete-column-btn">Удалить колонку</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalOverlay);
    
    // Добавляем обработчики событий для модального окна
    setupModalEventListeners(modalOverlay, columnElement);
}

// Настройка обработчиков событий для модального окна
function setupModalEventListeners(modalOverlay, columnElement) {
    // Закрытие модального окна
    const closeBtn = modalOverlay.querySelector('.close-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            document.body.removeChild(modalOverlay);
        });
    }
    
    // Закрытие по клику на оверлей
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });
    
    // Сохранение изменений
    const saveBtn = modalOverlay.querySelector('.save-column-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveColumnSettings(modalOverlay, columnElement);
        });
    }
    
    // Удаление колонки
    const deleteBtn = modalOverlay.querySelector('.delete-column-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            // Запрашиваем подтверждение перед удалением
            if (confirm('Вы уверены, что хотите удалить эту колонку со всеми задачами?')) {
                columnElement.remove();
                document.body.removeChild(modalOverlay);
            }
        });
    }
    
    // Изменение цвета колонки при выборе в color picker
    const colorPicker = modalOverlay.querySelector('#column-color');
    if (colorPicker) {
        // Установка текущего цвета
        const currentColor = window.getComputedStyle(columnElement).backgroundColor;
        if (currentColor !== 'rgba(0, 0, 0, 0)' && currentColor !== 'transparent') {
            // Преобразуем RGB в HEX для color picker
            const rgbToHex = function(rgb) {
                if (/^rgb/.test(rgb)) {
                    const matches = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                    if (matches) {
                        return '#' + 
                            parseInt(matches[1]).toString(16).padStart(2, '0') +
                            parseInt(matches[2]).toString(16).padStart(2, '0') +
                            parseInt(matches[3]).toString(16).padStart(2, '0');
                    }
                }
                return '#f1f1f1'; // Возвращаем цвет по умолчанию
            };
            colorPicker.value = rgbToHex(currentColor);
        }
        
        // Предпросмотр изменения цвета
        colorPicker.addEventListener('input', function() {
            columnElement.style.backgroundColor = this.value;
        });
    }
    
    // Переключение свернутого режима
    const collapsedMode = modalOverlay.querySelector('#collapsed-mode');
    if (collapsedMode) {
        collapsedMode.addEventListener('change', function() {
            if (this.checked) {
                columnElement.classList.add('collapsed');
            } else {
                columnElement.classList.remove('collapsed');
            }
        });
    }
    
    // Архивирование всех задач
    const archiveBtn = modalOverlay.querySelector('.archive-tasks-btn');
    if (archiveBtn) {
        archiveBtn.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите архивировать все задачи в этой колонке?')) {
                // Здесь можно добавить логику архивирования
                // Для простоты просто удалим все задачи
                const tasks = columnElement.querySelectorAll('.task');
                tasks.forEach(task => task.remove());
                
                // Обновим счетчик в модальном окне
                const tasksCount = modalOverlay.querySelector('.tasks-count');
                if (tasksCount) {
                    tasksCount.textContent = '0';
                }
                
                alert('Все задачи были архивированы');
            }
        });
    }
    
    // Сортировка задач по дате
    const sortBtn = modalOverlay.querySelector('.sort-tasks-btn');
    if (sortBtn) {
        sortBtn.addEventListener('click', function() {
            // Здесь можно реализовать логику сортировки
            // Для демонстрации просто покажем сообщение
            alert('Функция сортировки задач будет реализована в следующем обновлении');
        });
    }
}

// Функция для сохранения настроек колонки
function saveColumnSettings(modalOverlay, columnElement) {
    // Обновление названия колонки
    const nameInput = modalOverlay.querySelector('#modal-column-name');
    if (nameInput && nameInput.value.trim()) {
        const columnHeader = columnElement.querySelector('.editable-column-name');
        if (columnHeader) {
            columnHeader.innerHTML = `<h3 class="column-title" title="Двойной клик для редактирования">${nameInput.value.trim()}</h3>`;
            
            // Восстанавливаем обработчик двойного клика
            const columnTitle = columnHeader.querySelector('.column-title');
            if (columnTitle) {
                columnTitle.addEventListener('dblclick', function() {
                    makeColumnNameEditable(columnElement);
                });
            }
        }
    }
    
    // Сохранение цвета колонки
    const colorPicker = modalOverlay.querySelector('#column-color');
    if (colorPicker) {
        columnElement.style.backgroundColor = colorPicker.value;
    }
    
    // Сохранение режима отображения (свернутый/развернутый)
    const collapsedMode = modalOverlay.querySelector('#collapsed-mode');
    if (collapsedMode) {
        if (collapsedMode.checked) {
            columnElement.classList.add('collapsed');
        } else {
            columnElement.classList.remove('collapsed');
        }
    }
    
    // Закрываем модальное окно
    document.body.removeChild(modalOverlay);
}