const addPlayerBtn = document.getElementById('addPlayerBtn');
const playerNameInput = document.getElementById('playerName');
const playersList = document.getElementById('playersList');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const resetScoresBtn = document.getElementById('resetScoresBtn');
const leaderboard = document.getElementById('leaderboard');

let players = [
  { id: 1, name: "Alice", scores: [10, 20, 15] },
  // ...
];
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

// Example player data structure
const playersData = [
  { name: "Waqas", score: 3 },
  { name: "Ross", score: 1 },
  { name: "Ranin", score: 1 },
  { name: "Asia", score: 0 }
];

function getBarColor(percent) {
  if (percent >= 0.7) return "#27ae60";      // Green
  if (percent >= 0.4) return "#f39c12";      // Orange
  if (percent > 0)    return "#f1c40f";      // Yellow
  return "#e0e7ef";                          // Gray for zero
}

// Function to render leaderboard
function renderLeaderboard() {
  const leaderboardBody = document.querySelector("#leaderboard tbody");
  leaderboardBody.innerHTML = "";

  const maxScore = Math.max(...players.map(p => p.score), 1);

  players
    .sort((a, b) => b.score - a.score)
    .forEach((player, idx) => {
      const row = document.createElement("tr");

      // Total Score column with progress bar
      const percent = player.score / maxScore;
      const barColor = getBarColor(percent);

      const scoreCell = document.createElement("td");
      scoreCell.className = "score-cell";
      scoreCell.innerHTML = `
        <div class="score-bar-container">
          <span class="score-value big-score">${player.score}</span>
          <div class="score-bar-bg">
            <div class="score-bar-fill" style="width: ${(percent * 100)}%; background: ${barColor};"></div>
          </div>
        </div>
      `;
      row.appendChild(scoreCell);

      // Player Name column with +1 and -1 buttons
      const nameCell = document.createElement("td");
      nameCell.innerHTML = `
        ${player.name}
        <button class="score-btn minus-btn" data-idx="${idx}" data-action="minus">-1</button>
        <button class="score-btn plus-btn" data-idx="${idx}" data-action="plus">+1</button>
      `;
      row.appendChild(nameCell);

      leaderboardBody.appendChild(row);
    });

  // Add event listeners for the buttons
  leaderboardBody.querySelectorAll('.score-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = parseInt(this.getAttribute('data-idx'));
      const action = this.getAttribute('data-action');
      if (action === 'plus') players[idx].score += 1;
      if (action === 'minus') players[idx].score = Math.max(0, players[idx].score - 1);
      renderLeaderboard();
    });
  });
}

// Call this function whenever the leaderboard needs to update
renderLeaderboard();

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

const playersWithTotals = players.map(player => ({
  ...player,
  totalPoints: player.scores.reduce((sum, score) => sum + score, 0)
}));
// Use playersWithTotals in your render instead of players