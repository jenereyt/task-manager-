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
}

export function saveColumnName(inputField, columnElement) {
    const columnName = inputField.value.trim();
    const defaultName = `Колонка ${document.querySelectorAll('.board-column:not(.add-column)').length}`;
    const finalName = columnName || defaultName;

    // Заменяем поле ввода на заголовок
    const columnHeader = columnElement.querySelector('.editable-column-name');
    if (columnHeader) {
        columnHeader.innerHTML = `<h3 class="column-title" title="Дважды кликните для редактирования">${finalName}</h3>`;

        const columnTitle = columnHeader.querySelector('.column-title');
        if (columnTitle) {
            columnTitle.addEventListener('dblclick', function () {
                makeColumnTitleEditable(this);
            });
        }
    }
}

export function makeColumnTitleEditable(titleElement) {
    const currentTitle = titleElement.textContent;
    const container = titleElement.parentNode;

    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = currentTitle;
    inputElement.className = 'column-name-input';

    container.innerHTML = '';
    container.appendChild(inputElement);

    inputElement.addEventListener('blur', function () {
        const columnElement = this.closest('.board-column');
        saveColumnName(this, columnElement);
    });

    inputElement.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.value = currentTitle;
            this.blur();
        }
    });
}
