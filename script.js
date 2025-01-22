// 初期設定
let score = 0;
let timeLeft = 90; // 制限時間を90秒に変更
let timer;
let currentWord = "";
let silentMode = false; // 静かモードの初期状態
const words = [
  { kana: "さくら", romaji: "sakura" },
  { kana: "すし", romaji: "sushi" },
  { kana: "たいやき", romaji: "taiyaki" },
  { kana: "ねこ", romaji: "neko" },
  { kana: "いぬ", romaji: "inu" },
  { kana: "とうきょう", romaji: "toukyou" },
  { kana: "おおさか", romaji: "oosaka" },
  { kana: "やま", romaji: "yama" },
  { kana: "きりん", romaji: "kirin" },
  { kana: "かんがるー", romaji: "kangaroo" },
  { kana: "しょうがっこう", romaji: "shougakkou" },
  { kana: "ぱそこん", romaji: "pasokon" },
  { kana: "すいか", romaji: "suika" },
  { kana: "りんご", romaji: "ringo" },
  { kana: "さとう", romaji: "satou" },
  { kana: "くも", romaji: "kumo" },
  { kana: "いんたーねっと", romaji: "inta-netto" },
  { kana: "みずうみ", romaji: "mizuumi" },
  { kana: "かみなり", romaji: "kaminari" },
  { kana: "じてんしゃ", romaji: "jitensha" },
  { kana: "でんしゃ", romaji: "densha" },
  { kana: "あめ", romaji: "ame" },
  { kana: "はなび", romaji: "hanabi" },
  // ここにさらに多くのお題を追加可能
];

// DOM 要素の取得
const scoreElement = document.getElementById("score");
const timeElement = document.getElementById("time");
const currentWordElement = document.getElementById("current-word");
const inputBox = document.getElementById("input-box");
const startButton = document.getElementById("start-button");

// サウンド要素の準備
const startSound = new Audio("./sounds/start.mp3");
const bgmSound = new Audio("./sounds/bgm.mp3");
const niceSounds = [
  new Audio("./sounds/nice1.mp3"),
  new Audio("./sounds/nice2.mp3"),
  new Audio("./sounds/nice3.mp3"),
];
const niceSilentSound = new Audio("./sounds/niceSilent.mp3");
const badSound = new Audio("./sounds/bad.mp3");

// 設定と遊び方ボタンのコンテナを作成
const controlsContainer = document.createElement("div");
controlsContainer.style.display = "flex";
controlsContainer.style.justifyContent = "space-between";
controlsContainer.style.marginBottom = "10px";

// 設定ボタンの追加
const settingsButton = document.createElement("button");
settingsButton.textContent = "⚙ 設定";
settingsButton.style.fontSize = "1rem";
controlsContainer.appendChild(settingsButton);

// 遊び方ボタンの追加
const rulesButton = document.createElement("button");
rulesButton.textContent = "📖 遊び方";
rulesButton.style.fontSize = "1rem";
controlsContainer.appendChild(rulesButton);

// タイピングゲームの白いウィンドウ内にボタンを追加
const gameContainer = document.querySelector("#game-container");
gameContainer.insertBefore(controlsContainer, gameContainer.firstChild);

// 設定モーダル作成
const settingsModal = document.createElement("div");
settingsModal.style.position = "fixed";
settingsModal.style.top = "50%";
settingsModal.style.left = "50%";
settingsModal.style.transform = "translate(-50%, -50%)";
settingsModal.style.padding = "20px";
settingsModal.style.backgroundColor = "white";
settingsModal.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
settingsModal.style.borderRadius = "10px";
settingsModal.style.display = "none";
settingsModal.style.zIndex = "1000";
document.body.appendChild(settingsModal);

settingsModal.innerHTML = `
    <h2>設定</h2>
    <label>
        BGM音量:
        <input type="range" id="bgm-volume" min="0" max="100" value="100">
    </label>
    <br>
    <label>
        効果音音量:
        <input type="range" id="effect-volume" min="0" max="100" value="100">
    </label>
    <br>
    <label>
        静かモード:
        <input type="checkbox" id="silent-mode">
    </label>
    <br><br>
    <button id="close-settings">閉じる</button>
`;

// 遊び方モーダル作成
const rulesModal = document.createElement("div");
rulesModal.style.position = "fixed";
rulesModal.style.top = "50%";
rulesModal.style.left = "50%";
rulesModal.style.transform = "translate(-50%, -50%)";
rulesModal.style.padding = "20px";
rulesModal.style.backgroundColor = "white";
rulesModal.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
rulesModal.style.borderRadius = "10px";
rulesModal.style.display = "none";
rulesModal.style.zIndex = "1000";
document.body.appendChild(rulesModal);

fetch("./rule.txt")
  .then((response) => response.text())
  .then((text) => {
    rulesModal.innerHTML = `
            <h2>遊び方</h2>
            <pre>${text}</pre>
            <button id="close-rules">閉じる</button>
        `;
    const closeRulesButton = document.getElementById("close-rules");
    closeRulesButton.addEventListener("click", () => {
      rulesModal.style.display = "none";
    });
  });

// 設定ボタンのイベント
settingsButton.addEventListener("click", () => {
  settingsModal.style.display = "block";
});

const closeSettingsButton = document.getElementById("close-settings");
closeSettingsButton.addEventListener("click", () => {
  settingsModal.style.display = "none";
});

const silentModeCheckbox = document.getElementById("silent-mode");
silentModeCheckbox.addEventListener("change", (event) => {
  silentMode = event.target.checked;
});

// 音量調整
const bgmVolumeInput = document.getElementById("bgm-volume");
bgmVolumeInput.addEventListener("input", (event) => {
  bgmSound.volume = event.target.value / 100;
});

const effectVolumeInput = document.getElementById("effect-volume");
effectVolumeInput.addEventListener("input", (event) => {
  niceSounds.forEach((sound) => (sound.volume = event.target.value / 100));
  niceSilentSound.volume = event.target.value / 100;
  startSound.volume = event.target.value / 100;
  badSound.volume = event.target.value / 100;
});

// デフォルト音量を設定
bgmSound.volume = 1;
niceSounds.forEach((sound) => (sound.volume = 1));
niceSilentSound.volume = 1;
startSound.volume = 1;
badSound.volume = 1;

// ゲーム開始時の処理
startButton.addEventListener("click", startGame);

function startGame() {
  startCountdown(() => {
    score = 0;
    timeLeft = 90;
    inputBox.value = "";
    inputBox.disabled = false;
    inputBox.focus();
    startButton.disabled = true;
    scoreElement.textContent = score;
    timeElement.textContent = timeLeft;

    bgmSound.loop = true;
    bgmSound.play();

    showNewWord();
    timer = setInterval(countDown, 1000);

    inputBox.addEventListener("input", checkInput);
  });
}

// カウントダウン処理
function startCountdown(callback) {
  let countdown = 3;
  const countdownElement = document.createElement("div");
  countdownElement.style.position = "absolute";
  countdownElement.style.top = "50%";
  countdownElement.style.left = "50%";
  countdownElement.style.transform = "translate(-50%, -50%)";
  countdownElement.style.fontSize = "3rem";
  countdownElement.style.fontWeight = "bold";
  document.body.appendChild(countdownElement);

  const countdownInterval = setInterval(() => {
    if (countdown > 0) {
      countdownElement.textContent = countdown;
      if (countdown === 3) {
        startSound.play();
      }
      countdown--;
    } else {
      clearInterval(countdownInterval);
      countdownElement.textContent = "スタート！";
      setTimeout(() => {
        document.body.removeChild(countdownElement);
        callback();
      }, 1000);
    }
  }, 1000);
}

// タイマーのカウントダウン
function countDown() {
  timeLeft--;
  timeElement.textContent = timeLeft;

  if (timeLeft <= 0) {
    clearInterval(timer);
    endGame();
  }
}

// ゲーム終了時の処理
function endGame() {
  startButton.disabled = false;
  inputBox.disabled = true;
  bgmSound.pause();
  alert(`ゲーム終了！スコア: ${score}`);
}

// 新しいお題を表示
function showNewWord() {
  const wordObj = words[Math.floor(Math.random() * words.length)];
  currentWord = wordObj.romaji;
  currentWordElement.textContent = `${wordObj.kana} (${wordObj.romaji})`;
}

// 入力の判定
function checkInput() {
  const userInput = inputBox.value.toLowerCase().trim();
  if (userInput.length > currentWord.length + 2) {
    inputBox.value = ""; // 入力欄をリセット
    badSound.play();
    return;
  }
  if (
    userInput === currentWord ||
    (currentWord.includes("xtu") &&
      userInput === currentWord.replace("xtu", "ttu"))
  ) {
    score++;
    scoreElement.textContent = score;
    inputBox.value = "";
    inputBox.blur();
    setTimeout(() => {
      inputBox.focus();
    }, 10); // 入力欄のバグを防ぐためのリセット

    if (silentMode) {
      niceSilentSound.play();
    } else {
      const randomNiceSound =
        niceSounds[Math.floor(Math.random() * niceSounds.length)];
      randomNiceSound.play();
    }

    showNewWord();
  }
}
