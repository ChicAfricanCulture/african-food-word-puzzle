/* African Food Word Search – mobile & desktop
   - Tap/Click & drag selection
   - Words show country info on discovery
   - Drum sound on hit (toggleable)
   - Reward screen with 3 gifts
*/

const WORDS = [
  { word:"JOLLOF", label:"Jollof", country:"Nigeria/Ghana/Senegal", fact:"A West African party rice with tomato, pepper, and spice." },
  { word:"EGUSI", label:"Egusi", country:"Nigeria", fact:"Melon seed soup; rich, nutty, and often paired with fufu." },
  { word:"SUKUMA", label:"Sukuma", country:"Kenya", fact:"Sukuma wiki means 'push the week'—affordable collard greens." },
  { word:"INJERA", label:"Injera", country:"Ethiopia", fact:"Sour teff flatbread used as both plate and utensil." },
  { word:"MOAMBA", label:"Moamba", country:"Angola", fact:"Moamba de galinha—chicken stew with palm fruit sauce." },
  { word:"COUSCOUS", label:"Couscous", country:"Morocco", fact:"Steamed semolina granules—Friday family staple." },
  { word:"BILTONG", label:"Biltong", country:"South Africa", fact:"Air-dried spiced meat, a beloved snack." },
  { word:"BOBOTIE", label:"Bobotie", country:"South Africa", fact:"Curried mince baked with an egg custard top." },
  { word:"FUFU", label:"Fufu", country:"Ghana/Nigeria", fact:"Pounded starch—plantain, cassava, or yam—served with soups." },
  { word:"ZOBODRINK", label:"Zobo", country:"Nigeria", fact:"Hibiscus drink, also called bissap or sorrel in other regions." },
  { word:"YASSA", label:"Yassa", country:"Senegal", fact:"Onion-lemon-mustard marinade for chicken or fish." }
];

const GRID = 12;          // 12x12 grid
const DIRECTIONS = [ [1,0],[0,1],[1,1],[-1,0],[0,-1],[-1,-1],[1,-1],[-1,1] ];
let grid = [];            // 2D letters
let placed = [];          // placed words with coords
let selecting = false, start=null, currentPath=[];
let found = new Set();
let soundOn = true;

const el = sel => document.querySelector(sel);
const gridEl = el('#grid');
const wordListEl = el('#wordList');
const infoEl = el('#info');
const hitAudio = el('#hit');

function init(){
  buildGrid();
  renderGrid();
  renderWordList();
  infoEl.innerHTML = "";
  el('#reward').hidden = true; el('#reward').setAttribute('aria-hidden','true');
}
function buildGrid(){
  grid = Array.from({length:GRID}, ()=>Array(GRID).fill(''));
  placed = [];

  // place words
  for(const w of WORDS){
    placeWord(w.word);
  }
  // fill leftovers
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for(let r=0;r<GRID;r++){
    for(let c=0;c<GRID;c++){
      if(!grid[r][c]) grid[r][c] = letters[Math.floor(Math.random()*letters.length)];
    }
  }
  found.clear();
}
function placeWord(word){
  const maxTries = 500;
  for(let t=0;t<maxTries;t++){
    const dir = DIRECTIONS[Math.floor(Math.random()*DIRECTIONS.length)];
    const len = word.length;
    const startR = randInt(0, GRID-1);
    const startC = randInt(0, GRID-1);
    const endR = startR + dir[0]*(len-1);
    const endC = startC + dir[1]*(len-1);
    if(endR<0||endR>=GRID||endC<0||endC>=GRID) continue;

    // check fits
    let ok = true;
    for(let i=0;i<len;i++){
      const r = startR + dir[0]*i;
      const c = startC + dir[1]*i;
      const cell = grid[r][c];
      if(cell && cell !== word[i]) { ok=false; break; }
    }
    if(!ok) continue;

    // place
    for(let i=0;i<len;i++){
      const r = startR + dir[0]*i;
      const c = startC + dir[1]*i;
      grid[r][c] = word[i];
    }
    placed.push({word, start:[startR,startC], dir});
    return true;
  }
  console.warn("Failed to place:", word); return false;
}
function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

function renderGrid(){
  gridEl.style.setProperty('--size', GRID);
  gridEl.innerHTML = "";
  for(let r=0;r<GRID;r++){
    for(let c=0;c<GRID;c++){
      const d = document.createElement('div');
      d.className = 'cell';
      d.setAttribute('role','gridcell');
      d.setAttribute('data-r', r);
      d.setAttribute('data-c', c);
      d.textContent = grid[r][c];
      gridEl.appendChild(d);
    }
  }
}

// word list
function renderWordList(){
  wordListEl.innerHTML = "";
  for(const w of WORDS){
    const li = document.createElement('li');
    li.id = "w-"+w.word;
    li.textContent = w.label;
    wordListEl.appendChild(li);
  }
}

// selection handlers (mouse + touch)
gridEl.addEventListener('pointerdown', e=>{
  const cell = e.target.closest('.cell'); if(!cell) return;
  selecting = true; start = cell; currentPath = [cell]; markSelected();
});
gridEl.addEventListener('pointermove', e=>{
  if(!selecting) return;
  const cell = e.target.closest('.cell'); if(!cell || cell===currentPath.at(-1)) return;
  currentPath.push(cell); markSelected();
});
window.addEventListener('pointerup', ()=>{
  if(!selecting) return;
  selecting = false;
  checkPath();
  clearSelected();
});

function markSelected(){
  clearSelected();
  currentPath.forEach(c=>c.classList.add('selected'));
}
function clearSelected(){
  gridEl.querySelectorAll('.cell.selected').forEach(c=>c.classList.remove('selected'));
}

// check if currentPath matches any placed word (in either direction)
function checkPath(){
  const coords = currentPath.map(c=>[+c.dataset.r, +c.dataset.c]);
  // derive direction
  if(coords.length<2) return;
  const dr = coords[1][0]-coords[0][0];
  const dc = coords[1][1]-coords[0][1];
  // ensure straight line
  for(let i=2;i<coords.length;i++){
    if(coords[i][0]-coords[i-1][0]!==dr || coords[i][1]-coords[i-1][1]!==dc) return;
  }
  const letters = coords.map(([r,c])=>grid[r][c]).join('');
  const reversed = letters.split('').reverse().join('');
  let hit = WORDS.find(w=>w.word===letters || w.word===reversed);
  if(!hit) return;

  // mark cells as found
  currentPath.forEach(c=>c.classList.add('found'));
  document.getElementById("w-"+hit.word).classList.add('found');
  found.add(hit.word);
  if(soundOn){ try{ hitAudio.currentTime=0; hitAudio.play(); }catch{} }
  announce(hit);

  // win?
  if(found.size === WORDS.length){
    setTimeout(showReward, 550);
  }
}

function announce(item){
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<div><strong>${item.label}</strong> · <span class="country">${item.country}</span><br>${item.fact}</div>`;
  infoEl.prepend(card);
}

function showReward(){
  const layer = document.getElementById('reward');
  layer.hidden = false; layer.setAttribute('aria-hidden','false');
  // minimal confetti (CSS-light)
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    confetti(120);
  }
}

// lightweight confetti
function confetti(n){
  const f = document.createDocumentFragment();
  for(let i=0;i<n;i++){
    const s = document.createElement('span');
    s.style.position='fixed';
    s.style.left=(Math.random()*100)+'vw';
    s.style.top='-2vh';
    s.style.width=s.style.height=(8+Math.random()*6)+'px';
    s.style.background=['#b8860b','#f2d388','#8c6239','#e6c072'][i%4];
    s.style.transform=`rotate(${Math.random()*360}deg)`;
    s.style.borderRadius='2px';
    s.style.zIndex='9999';
    document.body.appendChild(s);
    const dy= 110 + Math.random()*30;
    const duration = 2500 + Math.random()*1200;
    s.animate([{transform:`translateY(0) rotate(0)`},{transform:`translateY(${dy}vh) rotate(720deg)`}],
              {duration, easing:'ease-in'}).onfinish=()=>s.remove();
  }
}

document.getElementById('newGameBtn').addEventListener('click', init);
document.getElementById('playAgainBtn').addEventListener('click', init);
document.getElementById('soundBtn').addEventListener('click', e=>{
  soundOn = !soundOn;
  e.currentTarget.setAttribute('aria-pressed', String(soundOn));
  e.currentTarget.textContent = soundOn ? '🔈 Sound' : '🔇 Muted';
});
document.getElementById('hintBtn').addEventListener('click', ()=>{
  // reveal first not-found word's first/last letter cells by pulsing
  const target = placed.find(p=>!found.has(p.word));
  if(!target) return;
  pulse(target.start[0], target.start[1]); // start
  const end = [ target.start[0] + target.dir[0]*(target.word.length-1),
                target.start[1] + target.dir[1]*(target.word.length-1) ];
  pulse(end[0], end[1]); // end
});
function pulse(r,c){
  const cell = gridEl.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
  if(!cell) return;
  cell.classList.add('path');
  setTimeout(()=>cell.classList.remove('path'), 900);
}

init();