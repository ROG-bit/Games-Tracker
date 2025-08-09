const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerNameInput = document.getElementById('playerName');
const playersList = document.getElementById('playersList');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const resetScoresBtn = document.getElementById('resetScoresBtn');
const leaderboard = document.getElementById('leaderboard');

let players = [];
let undoStack = [];
let redoStack = [];

// Load saved players from localStorage when app starts
const savedPlayers = localStorage.getItem('players');
if (savedPlayers) {
  players = JSON.parse(savedPlayers);
}

// Save players to localStorage
function savePlayers() {
  localStorage.setItem('players', JSON.stringify(players));
}

// Save current state to undo stack
function saveState() {
  undoStack.push(JSON.stringify(players));
  // Clear redo stack on new action
  redoStack = [];
  updateUndoRedoButtons();
}

// Undo last change
undoBtn.addEventListener('click', () => {
  if (undoStack.length === 0) return;
  redoStack.push(JSON.stringify(players));
  players = JSON.parse(undoStack.pop());
  savePlayers();
  renderPlayers();
  updateUndoRedoButtons();
});

// Redo last undone change
redoBtn.addEventListener('click', () => {
  if (redoStack.length === 0) return;
  undoStack.push(JSON.stringify(players));
  players = JSON.parse(redoStack.pop());
  savePlayers();
  renderPlayers();
  updateUndoRedoButtons();
});

// Reset all scores to zero
resetScoresBtn.addEventListener('click', () => {
  if (players.length === 0) return alert('No players to reset.');

  saveState();
  players.forEach(player => {
    player.score = 0;
  });
  savePlayers();
  renderPlayers();
});

// Enable/disable undo and redo buttons
function updateUndoRedoButtons() {
  undoBtn.disabled = undoStack.length === 0;
  redoBtn.disabled = redoStack.length === 0;
}

function renderPlayers() {
  playersList.innerHTML = ''; // Clear list

  players.forEach((player, index) => {
    const li = document.createElement('li');

    // Player name and score container
    const nameSpan = document.createElement('span');
    nameSpan.textContent = `${player.name}: ${player.score} points`;
    nameSpan.style.cursor = 'pointer';
    nameSpan.style.userSelect = 'none';

    // Clicking player name enters edit mode
    nameSpan.addEventListener('click', () => {
      enterEditMode(index, li);
    });

    li.appendChild(nameSpan);

    // +1 score button
    const addPointBtn = document.createElement('button');
    addPointBtn.textContent = '+1';
    addPointBtn.style.marginLeft = '10px';
    addPointBtn.addEventListener('click', () => {
      saveState();
      player.score++;
      savePlayers();
      renderPlayers();
    });
    li.appendChild(addPointBtn);

    playersList.appendChild(li);
  });

  updateUndoRedoButtons();
  renderLeaderboard();
}

function enterEditMode(playerIndex, listItem) {
  const player = players[playerIndex];

  // Clear the list item content
  listItem.innerHTML = '';

  // Create input box prefilled with current name
  const input = document.createElement('input');
  input.type = 'text';
  input.value = player.name;

  // Save and cancel buttons
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.classList.add('save-btn');
  saveBtn.style.marginLeft = '10px';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.classList.add('cancel-btn');
  cancelBtn.style.marginLeft = '5px';

  // Save changes handler
  saveBtn.addEventListener('click', () => {
    const newName = input.value.trim();
    if (!newName) {
      alert('Name cannot be empty');
      return;
    }
    if (players.find((p, i) => p.name === newName && i !== playerIndex)) {
      alert('Name must be unique');
      return;
    }
    saveState();
    player.name = newName;
    savePlayers();
    renderPlayers();
  });

  // Cancel editing handler
  cancelBtn.addEventListener('click', () => {
    renderPlayers();
  });

  listItem.appendChild(input);
  listItem.appendChild(saveBtn);
  listItem.appendChild(cancelBtn);

  input.focus();
}

function renderLeaderboard() {
  leaderboard.innerHTML = '';
  if (players.length === 0) {
    leaderboard.innerHTML = '<li>No players yet</li>';
    return;
  }

  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const maxScore = Math.max(...players.map(p => p.score), 1);

  // Find highest score to mark leader(s)
  const highestScore = sortedPlayers[0].score;

  sortedPlayers.forEach((player) => {
    const li = document.createElement('li');

    // Name and crown if top scorer
    const nameDiv = document.createElement('div');
    nameDiv.className = 'leaderboard-name';
    nameDiv.textContent = player.name;
    if (player.score === highestScore && highestScore > 0) {
      nameDiv.textContent += ' 👑';
    }

    // Add -1 button (red)
    const subtractBtn = document.createElement('button');
    subtractBtn.textContent = '-1';
    subtractBtn.style.marginLeft = '10px';
    subtractBtn.style.padding = '5px 10px';
    subtractBtn.style.fontSize = '14px';
    subtractBtn.style.borderRadius = '6px';
    subtractBtn.style.border = 'none';
    subtractBtn.style.backgroundColor = '#e74c3c'; // red
    subtractBtn.style.color = 'white';
    subtractBtn.style.cursor = 'pointer';
    subtractBtn.addEventListener('click', () => {
      if (player.score > 0) {
        saveState();
        player.score--;
        savePlayers();
        renderPlayers();
      }
    });

    // Add +1 button (blue)
    const addPointBtn = document.createElement('button');
    addPointBtn.textContent = '+1';
    addPointBtn.style.marginLeft = '10px';
    addPointBtn.style.padding = '5px 10px';
    addPointBtn.style.fontSize = '14px';
    addPointBtn.style.borderRadius = '6px';
    addPointBtn.style.border = 'none';
    addPointBtn.style.backgroundColor = '#3498db'; // blue
    addPointBtn.style.color = 'white';
    addPointBtn.style.cursor = 'pointer';
    addPointBtn.addEventListener('click', () => {
      saveState();
      player.score++;
      savePlayers();
      renderPlayers();
    });

    const barDiv = document.createElement('div');
    barDiv.className = 'leaderboard-bar';

    // Width proportional to score (max 100%)
    const widthPercent = (player.score / maxScore) * 100;
    barDiv.style.width = `${widthPercent}%`;

    // Show points inside the bar (always)
    barDiv.textContent = player.score;

    li.appendChild(nameDiv);
    li.appendChild(subtractBtn);
    li.appendChild(addPointBtn);
    li.appendChild(barDiv);
    leaderboard.appendChild(li);
  });
}

addPlayerBtn.addEventListener('click', () => {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert('Enter a player name');
    return;
  }
  if (players.find(p => p.name === name)) {
    alert('Name must be unique');
    return;
  }
  saveState();
  players.push({ name, score: 0 });
  playerNameInput.value = '';
  savePlayers();
  renderPlayers();
});

// Initial render and button states
renderPlayers();
updateUndoRedoButtons();