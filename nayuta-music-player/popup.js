const GENRES = {
  "エジプト":     { emoji: "🏺", videos: ["uRV8nVHUdi8","vHGs-lkf_XI","SHueyoNjWl4","2Wve_s_MbOA","jMKB2mZO3q4","QBH0eJf2a_U","rsTDdVafCrk","Be395oo8h50","wE3lRvA25ME","LyDS_eHknv0","6v9F1dmCkHg"] },
  "インド":       { emoji: "🪔", videos: ["shZHb0WUfXc","Qom98Pi4gTM","wXy4I9pJw4k","XFefev26ZZg","lcY7fAQT2AU","Qxy0wKlgF0Q"] },
  "タイ":         { emoji: "🌸", videos: ["Ds-ksBOzhNc","7GJ_qmMxEwk"] },
  "ケルト":       { emoji: "🍀", videos: ["SOdcY_eoxUw","2EuSCTPrJRE"] },
  "シティポップ": { emoji: "🌆", videos: ["WBgsAU64dx4","C4lADI4VFi8","WSSyRwS6M8g","J3tzo-Oc9Qw","3hpUoS6kGFk","BbBCohnpuKs","JFDqJjKUB8k","waNAcdhcu6E","cV_fadvQ9Yg","beFy47SP76Q"] },
  "lofi":         { emoji: "☕", videos: ["FXGt6RcJYXE","Gy5LhOZynmU","vJV9B7PiUHk","LAeqC5as708","0JBYxEZOspk","fz_C-rKefsY","S5pOlo0Pg5Q","8wVrwtR10E4","A3B6tpHAPzw","s7y5SmPzfLM"] },
  "クリスマス":   { emoji: "🎄", videos: ["UcOug3XYB2M","B9-0z1X72ks","G2lNXXQRO-w","SOdcY_eoxUw","RUrE39UoCqg"] },
  "ハロウィン":   { emoji: "🎃", videos: ["CHLy5ijhWjc","E4rW5QQr24M","cCKW9fSL3uY"] },
  "猫":           { emoji: "🐈", videos: ["l57b4gwXhKA","oxYhWR4atpw","nY1_ToJ1Yb8","YEKPaLyeRck","0uXl-5YO2as","XvZrKrYgppA","AoyjZwBICHU","XBxpSh9GW2c","5lwcstIq2Vk"] },
  "和風":         { emoji: "⛩️", videos: ["fjb-O0UBuwo","qRGwTjPEl04","76xTrT6BrGA"] },
  "瞑想":         { emoji: "🧘", videos: ["u6F0sQ0uHyM","djEGYE8ukU0","rZ4-gUUBKLY","5Xr_wicUD0M","dkiQos3bO_E","r2LeWkdDo8s","q7aKM23L-D4","qIoczenJVt8","W688iHu8YW8","TveodHUSQVM"] },
  "カリンバ":     { emoji: "🎵", videos: ["ZZ_npJ_9Ero","6OxJIyerODc","BFBpz4aF5QE","VMFYJOfJFbw","r0h5F_V7L4o"] },
  "アコギ":       { emoji: "🎸", videos: ["yfcXzad69UU","2e12V1Dp9pU","G44XT0DCtaA","96eVmN-2ycA","ITBxhd04xDk"] },
  "恐怖":         { emoji: "👻", videos: ["9LMLtBj7UbE","Iue3as_icrc","M2j6bBRi2Sk","Orh8q6jJ-EU"] }
};

let currentGenre = null;
let currentList  = [];
let currentIndex = -1;
let isShuffle    = true;

const thumbImg    = document.getElementById('thumbImg');
const playerCover = document.getElementById('playerCover');
const genrePill   = document.getElementById('genrePill');
const trackNum    = document.getElementById('trackNum');
const shuffleBtn  = document.getElementById('shuffleBtn');
const hamburger   = document.getElementById('hamburger');
const genreMenu   = document.getElementById('genreMenu');

// --- 初期化 ---
function init() {
  buildGenreMenu();
  chrome.storage.local.get(['genre', 'index', 'shuffle'], (data) => {
    if (data.shuffle !== undefined) { isShuffle = data.shuffle; updateShuffleUI(); }
    if (data.genre && GENRES[data.genre]) {
      currentGenre = data.genre;
      buildList();
      currentIndex = (data.index !== undefined && data.index < currentList.length) ? data.index : 0;
      updateUI();
    }
  });
}

// --- ジャンルメニュー ---
function buildGenreMenu() {
  genreMenu.innerHTML = '';
  Object.keys(GENRES).forEach(name => {
    const g = GENRES[name];
    const el = document.createElement('div');
    el.className = 'genre-item' + (name === currentGenre ? ' active' : '');
    el.innerHTML = `<span>${g.emoji}</span>${name}`;
    el.onclick = () => { selectGenre(name); closeMenu(); };
    genreMenu.appendChild(el);
  });
}

function selectGenre(name) {
  currentGenre = name;
  buildList();
  currentIndex = 0;
  buildGenreMenu();
  updateUI();
  openCurrent(); // ジャンル選択したらすぐ再生
  saveState();
}

// --- プレイリスト ---
function buildList() {
  const vids = [...GENRES[currentGenre].videos];
  currentList = isShuffle ? shuffle(vids) : vids;
}

// --- 再生（タブで開く） ---
function openCurrent() {
  if (!currentGenre || currentIndex < 0) return;
  const vid = currentList[currentIndex];
  chrome.tabs.create({ url: `https://www.youtube.com/watch?v=${vid}` });
  saveState();
}

// --- 再生ボタン ---
function onPlayBtn() {
  if (!currentGenre) {
    // 未選択ならランダムジャンルで開始
    const keys = Object.keys(GENRES);
    currentGenre = keys[Math.floor(Math.random() * keys.length)];
    buildList();
    currentIndex = 0;
    buildGenreMenu();
    updateUI();
  }
  openCurrent();
}

function nextTrack() {
  if (!currentList.length) return;
  currentIndex = (currentIndex + 1) % currentList.length;
  updateUI();
  openCurrent();
}

function prevTrack() {
  if (!currentList.length) return;
  currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
  updateUI();
  openCurrent();
}

// --- UI更新 ---
function updateUI() {
  if (!currentGenre) return;
  const g = GENRES[currentGenre];
  const vid = currentList[currentIndex];

  // サムネ
  thumbImg.src = `https://img.youtube.com/vi/${vid}/mqdefault.jpg`;
  thumbImg.style.display = 'block';
  playerCover.classList.add('hidden');

  // ジャンルピル・曲番号
  genrePill.textContent = `${g.emoji} ${currentGenre}`;
  genrePill.style.display = 'inline-block';
  trackNum.textContent = `${currentIndex + 1} / ${currentList.length}`;
}

function updateShuffleUI() {
  shuffleBtn.classList.toggle('on', isShuffle);
}

function saveState() {
  chrome.storage.local.set({ genre: currentGenre, index: currentIndex, shuffle: isShuffle });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- イベント ---
document.getElementById('playBtn').onclick = onPlayBtn;
document.getElementById('nextBtn').onclick = nextTrack;
document.getElementById('prevBtn').onclick = prevTrack;

shuffleBtn.onclick = () => {
  isShuffle = !isShuffle;
  updateShuffleUI();
  if (currentGenre) { buildList(); currentIndex = 0; updateUI(); }
  saveState();
};

hamburger.onclick = (e) => { e.stopPropagation(); genreMenu.classList.toggle('open'); };
document.addEventListener('click', closeMenu);
genreMenu.addEventListener('click', (e) => e.stopPropagation());
function closeMenu() { genreMenu.classList.remove('open'); }

init();
