import { projects, closeAside } from './app.js';

export function openProject(projectId) {
  const project = projects.find(p => p.id === Number(projectId));
  if (!project) return;

  closeAside();
  const mainContent = document.querySelector('.main-content');
  mainContent.innerHTML = `
    <div class="board" style="background: ${project.background}">
      <div class="board-header">
        <div class="board-header-left">
          <h1>${project.name}</h1>
          <button class="btn btn-icon favorite-btn" title="Add to favorites">
            <i class="far fa-star"></i>
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

  // Add event listeners for the buttons
  const favoriteBtn = document.querySelector('.favorite-btn');
  favoriteBtn.addEventListener('click', () => {
    // Placeholder for favorite function that will be added later
    console.log('Add to favorites clicked');
    favoriteBtn.innerHTML = '<i class="fas fa-star"></i>'; // Change to filled star
    // This will be replaced with proper function later
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


// Function to show more options modal
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
document.addEventListener('asideToggled', handleAsideToggle);