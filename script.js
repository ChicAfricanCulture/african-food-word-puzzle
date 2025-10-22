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

const SIZE = 12, DIRS = [[1,0],[0,1],[1,1],[-1,0],[0,-1],[-1,-1],[1,-1],[-1,1]];
let grid=[], placed=[], foundCount=0;

const $ = s => document.querySelector(s);

function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function inBounds(r,c){return r>=0&&r<SIZE&&c>=0&&c<SIZE;}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function tryPlace(word){
  const dirs=shuffle(DIRS.slice());
  for(const [dr,dc] of dirs){
    for(let t=0;t<200;t++){
      const r0=rand(0,SIZE-1),c0=rand(0,SIZE-1);
      let r=r0,c=c0,ok=true,cells=[];
      for(let k=0;k<word.length;k++){
        if(!inBounds(r,c)){ok=false;break;}
        const ch=grid[r][c];
        if(ch!==""&&ch!==word[k]){ok=false;break;}
        cells.push({r,c});r+=dr;c+=dc;
      }
      if(ok){cells.forEach((p,i)=>grid[p.r][p.c]=word[i]);return cells;}
    }
  }
  return null;
}

function fillRandom(){
  for(let r=0;r<SIZE;r++)
    for(let c=0;c<SIZE;c++)
      if(!grid[r][c])grid[r][c]=String.fromCharCode(65+rand(0,25));
}

function buildList(){
  const ul=$("#wordList");ul.innerHTML="";
  WORDS.forEach(w=>{
    const li=document.createElement("li");
    li.innerHTML=`${w.flag} <a href="${w.url}" target="_blank">${w.text}</a>`;
    ul.appendChild(li);
  });
}

function renderGrid(){
  const g=$("#grid");g.innerHTML="";
  for(let r=0;r<SIZE;r++)
    for(let c=0;c<SIZE;c++){
      const d=document.createElement("div");
      d.className="cell";d.textContent=grid[r][c];
      d.dataset.r=r;d.dataset.c=c;
      g.appendChild(d);
    }
}

function resetGame(){
  grid=Array.from({length:SIZE},()=>Array(SIZE).fill(""));
  placed=[];foundCount=0;
  const order=shuffle(WORDS.slice());
  for(const w of order){
    const cells=tryPlace(w.text);
    if(cells)placed.push({text:w.text,cells,found:false});
  }
  fillRandom();renderGrid();buildList();
  $("#gridWrap").style.visibility="visible";
  $("#finale").classList.remove("show");
}

function showFinale(){
  const wrap=$("#gridWrap"),fin=$("#finale");
  wrap.classList.add("fade-out");
  setTimeout(()=>{
    wrap.style.visibility="hidden";
    fin.classList.add("show");
    $("#drumBeat").play();$("#desertWind").play();
  },2800);
}

/* simple cell-selection demo */
$("#grid").addEventListener("click",e=>{
  if(!e.target.classList.contains("cell"))return;
  const el=e.target;
  if(el.classList.contains("found"))return;
  el.classList.add("found");
  $("#sndFound").play();
  foundCount++;
  if(foundCount===WORDS.length)showFinale();
});

/* UI buttons */
$("#resetBtn").onclick=resetGame;
$("#darkToggle").onclick=()=>{
  document.body.classList.toggle("dark");
  $("#darkToggle").classList.toggle("active");
};
$("#shapeToggle").onclick=()=>{
  $("#gridWrap").classList.toggle("africa-mask");
  $("#shapeToggle").classList.toggle("active");
};

resetGame();
