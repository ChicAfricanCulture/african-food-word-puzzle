
const WORDS = [
  {text:"JOLLOF",country:"Nigeria",flag:"🇳🇬",url:"https://africanfood.recipes/search?q=jollof"},
  {text:"INJERA",country:"Ethiopia",flag:"🇪🇹",url:"https://africanfood.recipes/search?q=injera"},
  {text:"FUFU",country:"Ghana",flag:"🇬🇭",url:"https://africanfood.recipes/search?q=fufu"},
  {text:"TAGINE",country:"Morocco",flag:"🇲🇦",url:"https://africanfood.recipes/search?q=tagine"},
  {text:"NDOLE",country:"Cameroon",flag:"🇨🇲",url:"https://africanfood.recipes/search?q=ndole"},
  {text:"BOBOTIE",country:"South Africa",flag:"🇿🇦",url:"https://africanfood.recipes/search?q=bobotie"},
  {text:"THIEB",country:"Senegal",flag:"🇸🇳",url:"https://africanfood.recipes/search?q=thieboudienne"},
  {text:"UGALI",country:"Kenya",flag:"🇰🇪",url:"https://africanfood.recipes/search?q=ugali"},
  {text:"KACHUMBARI",country:"Tanzania",flag:"🇹🇿",url:"https://africanfood.recipes/search?q=kachumbari"},
  {text:"SUYA",country:"Nigeria",flag:"🇳🇬",url:"https://africanfood.recipes/search?q=suya"}
];

const SIZE = 15; // Increased size to make word placement easier
const DIRS = [[1,0],[0,1],[1,1],[-1,0],[0,-1],[-1,-1],[1,-1],[-1,1]];

let grid = [];
let placed = [];
let foundCount = 0;
let isSelecting = false;
let selectedCells = [];

const $ = s => document.querySelector(s);

// Utility functions
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function inBounds(r, c) { return r >= 0 && r < SIZE && c >= 0 && c < SIZE; }
function shuffle(a) { 
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a; 
}

// Game functions
function tryPlace(word) {
  const dirs = shuffle([...DIRS]);
  const wordLen = word.length;
  
  for (const [dr, dc] of dirs) {
    // Try multiple starting positions
    for (let attempt = 0; attempt < 100; attempt++) {
      // Calculate max possible starting position for this direction
      let r0, c0;
      if (dr === 1) r0 = rand(0, SIZE - wordLen);
      else if (dr === -1) r0 = rand(wordLen - 1, SIZE - 1);
      else r0 = rand(0, SIZE - 1);
      
      if (dc === 1) c0 = rand(0, SIZE - wordLen);
      else if (dc === -1) c0 = rand(wordLen - 1, SIZE - 1);
      else c0 = rand(0, SIZE - 1);
      
      let r = r0, c = c0;
      let ok = true;
      let cells = [];
      
      // Check if word can be placed
      for (let k = 0; k < wordLen; k++) {
        if (!inBounds(r, c)) {
          ok = false;
          break;
        }
        const currentChar = grid[r][c];
        if (currentChar !== "" && currentChar !== word[k]) {
          ok = false;
          break;
        }
        cells.push({r, c});
        r += dr;
        c += dc;
      }
      
      if (ok) {
        // Place the word
        cells.forEach((cell, index) => {
          grid[cell.r][cell.c] = word[index];
        });
        return cells;
      }
    }
  }
  console.warn(`Could not place word: ${word}`);
  return null;
}

function fillRandom() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

function buildList() {
  const ul = $("#wordList");
  ul.innerHTML = "";
  
  WORDS.forEach(w => {
    const li = document.createElement("li");
    li.innerHTML = `${w.flag} <a href="${w.url}" target="_blank" title="${w.country}">${w.text}</a>`;
    ul.appendChild(li);
  });
}

function renderGrid() {
  const g = $("#grid");
  g.innerHTML = "";
  g.style.gridTemplateColumns = `repeat(${SIZE}, 1fr)`;
  
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = grid[r][c] || "?";
      cell.dataset.r = r;
      cell.dataset.c = c;
      g.appendChild(cell);
    }
  }
  
  console.log("Grid rendered with", SIZE * SIZE, "cells");
}

function resetGame() {
  console.log("Resetting game...");
  
  // Initialize empty grid
  grid = [];
  for (let r = 0; r < SIZE; r++) {
    grid[r] = [];
    for (let c = 0; c < SIZE; c++) {
      grid[r][c] = "";
    }
  }
  
  placed = [];
  foundCount = 0;
  selectedCells = [];
  isSelecting = false;
  
  // Try to place words
  const order = shuffle([...WORDS]);
  let placedCount = 0;
  
  for (const w of order) {
    const cells = tryPlace(w.text);
    if (cells) {
      placed.push({
        text: w.text,
        cells: cells,
        found: false,
        country: w.country,
        flag: w.flag
      });
      placedCount++;
    }
  }
  
  console.log(`Placed ${placedCount} out of ${WORDS.length} words`);
  
  // Fill remaining cells with random letters
  fillRandom();
  
  // Render the grid
  renderGrid();
  buildList();
  
  // Show the grid
  $("#gridWrap").style.visibility = "visible";
  $("#gridWrap").classList.remove("fade-out");
  $("#finale").classList.remove("show");
  
  // Setup event listeners
  setupEventListeners();
}

function setupEventListeners() {
  const gridElement = $("#grid");
  
  // Remove existing listeners by replacing the grid
  const newGrid = gridElement.cloneNode(true);
  gridElement.parentNode.replaceChild(newGrid, gridElement);
  
  // Add event listeners to new grid
  newGrid.addEventListener("mousedown", handleStartSelection);
  newGrid.addEventListener("touchstart", handleStartSelection, { passive: false });
}

function handleStartSelection(e) {
  e.preventDefault();
  const cell = e.target.closest(".cell");
  if (!cell || cell.classList.contains("found")) return;
  
  isSelecting = true;
  selectedCells = [cell];
  cell.classList.add("selected");
  
  document.addEventListener("mousemove", handleSelectionMove);
  document.addEventListener("touchmove", handleSelectionMove, { passive: false });
  document.addEventListener("mouseup", handleEndSelection);
  document.addEventListener("touchend", handleEndSelection);
}

function handleSelectionMove(e) {
  if (!isSelecting) return;
  
  e.preventDefault();
  const clientX = e.clientX || (e.touches && e.touches[0].clientX);
  const clientY = e.clientY || (e.touches && e.touches[0].clientY);
  
  if (!clientX || !clientY) return;
  
  const element = document.elementFromPoint(clientX, clientY);
  const cell = element?.closest(".cell");
  
  if (cell && !selectedCells.includes(cell) && !cell.classList.contains("found")) {
    selectedCells.push(cell);
    cell.classList.add("selected");
  }
}

function handleEndSelection() {
  if (!isSelecting) return;
  
  isSelecting = false;
  
  // Get the selected word
  const selectedWord = selectedCells.map(cell => cell.textContent).join("");
  console.log("Selected word:", selectedWord);
  
  // Check if it matches any placed word
  const foundWord = placed.find(w => 
    w.text === selectedWord && !w.found
  );
  
  if (foundWord) {
    console.log("Found word:", foundWord.text);
    // Mark word as found
    foundWord.found = true;
    foundWord.cells.forEach(cellPos => {
      const cellElement = document.querySelector(`[data-r="${cellPos.r}"][data-c="${cellPos.c}"]`);
      if (cellElement) {
        cellElement.classList.add("found");
        cellElement.classList.remove("selected");
      }
    });
    
    // Update word list
    updateWordList();
    
    // Play sound and check for completion
    try {
      $("#sndFound").play();
    } catch (e) {
      console.log("Audio play failed:", e);
    }
    foundCount++;
    
    if (foundCount === placed.length) {
      setTimeout(showFinale, 800);
    }
  } else {
    // Clear selection if no word found
    selectedCells.forEach(cell => cell.classList.remove("selected"));
  }
  
  selectedCells = [];
  
  // Remove event listeners
  document.removeEventListener("mousemove", handleSelectionMove);
  document.removeEventListener("touchmove", handleSelectionMove);
  document.removeEventListener("mouseup", handleEndSelection);
  document.removeEventListener("touchend", handleEndSelection);
}

function updateWordList() {
  const wordItems = $("#wordList").querySelectorAll("li");
  wordItems.forEach((li, index) => {
    if (placed[index] && placed[index].found) {
      li.classList.add("found");
    }
  });
}

function showFinale() {
  const wrap = $("#gridWrap");
  const fin = $("#finale");
  
  wrap.classList.add("fade-out");
  setTimeout(() => {
    wrap.style.visibility = "hidden";
    fin.classList.add("show");
    
    // Play celebration sounds
    try {
      $("#drumBeat").play();
      $("#desertWind").play();
    } catch (e) {
      console.log("Audio play failed:", e);
    }
  }, 2800);
}

// UI Event Handlers
$("#resetBtn").onclick = resetGame;

$("#darkToggle").onclick = () => {
  document.body.classList.toggle("dark");
  $("#darkToggle").classList.toggle("active");
};

$("#shapeToggle").onclick = () => {
  $("#gridWrap").classList.toggle("africa-mask");
  $("#shapeToggle").classList.toggle("active");
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM loaded, initializing game...");
  resetGame();
});

// Also try initializing if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', resetGame);
} else {
  setTimeout(resetGame, 100);
}


