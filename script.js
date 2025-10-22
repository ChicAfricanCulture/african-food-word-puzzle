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

const SIZE = 12;
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
  for (const [dr, dc] of dirs) {
    for (let t = 0; t < 200; t++) {
      const r0 = rand(0, SIZE - 1), c0 = rand(0, SIZE - 1);
      let r = r0, c = c0, ok = true, cells = [];
      
      for (let k = 0; k < word.length; k++) {
        if (!inBounds(r, c)) { ok = false; break; }
        const ch = grid[r][c];
        if (ch !== "" && ch !== word[k]) { ok = false; break; }
        cells.push({r, c}); 
        r += dr; 
        c += dc;
      }
      
      if (ok) {
        cells.forEach((p, i) => grid[p.r][p.c] = word[i]);
        return cells;
      }
    }
  }
  return null;
}

function fillRandom() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!grid[r][c]) {
        grid[r][c] = String.fromCharCode(65 + rand(0, 25));
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
  
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const d = document.createElement("div");
      d.className = "cell";
      d.textContent = grid[r][c];
      d.dataset.r = r;
      d.dataset.c = c;
      g.appendChild(d);
    }
  }
}

function resetGame() {
  grid = Array.from({length: SIZE}, () => Array(SIZE).fill(""));
  placed = [];
  foundCount = 0;
  selectedCells = [];
  isSelecting = false;
  
  const order = shuffle([...WORDS]);
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
    }
  }
  
  fillRandom();
  renderGrid();
  buildList();
  
  $("#gridWrap").style.visibility = "visible";
  $("#finale").classList.remove("show");
  
  // Clear any existing event listeners and reattach
  setupEventListeners();
}

function setupEventListeners() {
  const gridElement = $("#grid");
  
  // Clear existing listeners by cloning
  const newGrid = gridElement.cloneNode(true);
  gridElement.parentNode.replaceChild(newGrid, gridElement);
  
  // Add new listeners
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
  
  // Check if it matches any placed word
  const foundWord = placed.find(w => 
    w.text === selectedWord && !w.found
  );
  
  if (foundWord) {
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
    $("#sndFound").play().catch(e => console.log("Audio play failed:", e));
    foundCount++;
    
    if (foundCount === WORDS.length) {
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
    if (placed[index].found) {
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
    $("#drumBeat").play().catch(e => console.log("Drum audio failed:", e));
    $("#desertWind").play().catch(e => console.log("Wind audio failed:", e));
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

// Initialize game
resetGame();
