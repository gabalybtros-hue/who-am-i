let targetWord = "";
let currentGuess = "";
let attempts = 0;
const maxAttempts = 6;
let todayCharacter = null;
let isGameOver = false;

window.onload = async () => {
    // 1. عرض نافذة الشرح فقط عند بداية الزيارة الأولى لليوم
    const today = new Date().toISOString().split('T')[0];
    if (localStorage.getItem('seenInstructions') !== today) {
        document.getElementById("instructions-modal").style.display = "flex";
    }

    await loadTodayCharacter();
};

function closeInstructions() {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('seenInstructions', today);
    document.getElementById("instructions-modal").style.display = "none";
}

async function loadTodayCharacter() {
    try {
        const response = await fetch('characters.json');
        const charactersData = await response.json();

        const today = new Date().toISOString().split('T')[0];
        todayCharacter = charactersData.find(item => item.date === today);

        if (!todayCharacter) {
            todayCharacter = charactersData[0];
        }

        targetWord = todayCharacter.name;
        initGame(today);

    } catch (error) {
        console.error("خطأ في تحميل ملف البيانات:", error);
    }
}

function initGame(todayDate) {
    // التأكد التام من إخفاء نافذة القصة والخسارة عند بداية اللعبة
    document.getElementById("story-modal").style.display = "none";
    document.getElementById("lose-modal").style.display = "none";

    document.getElementById("board").innerHTML = "";
    currentGuess = "";
    attempts = 0;
    isGameOver = false;

    // رسم الشبكة
    for (let i = 0; i < maxAttempts; i++) {
        const row = document.createElement("div");
        row.className = "row";
        for (let j = 0; j < targetWord.length; j++) {
            const tile = document.createElement("div");
            tile.className = "tile";
            tile.id = `tile-${i}-${j}`;
            row.appendChild(tile);
        }
        document.getElementById("board").appendChild(row);
    }

    setupKeyboard();

    // إذا كان اللاعب قد أنهى محاولات اليوم مسبقاً، نمنعه من اللعب فقط بدون إظهار القصة فوراً
    const lastPlayedDate = localStorage.getItem('lastPlayedDate');
    if (lastPlayedDate === todayDate) {
        isGameOver = true;
    }
}

function setupKeyboard() {
    const keys = [
        ["ض", "ص", "ث", "ق", "ف", "غ", "ع", "ه", "خ", "ح", "ج"],
        ["ش", "س", "ي", "ب", "ل", "ا", "ت", "ن", "م", "ك", "ط"],
        ["د", "ذ", "ر", "ز", "و", "ة", "مسح", "إدخال"]
    ];

    const keyboardContainer = document.getElementById("keyboard");
    keyboardContainer.innerHTML = "";

    keys.forEach(rowKeys => {
        const row = document.createElement("div");
        row.className = "keyboard-row";
        rowKeys.forEach(key => {
            const btn = document.createElement("button");
            btn.className = "key";
            if (key === "إدخال" || key === "مسح") btn.classList.add("wide");
            btn.innerText = key;
            btn.onclick = () => handleKeyPress(key);
            row.appendChild(btn);
        });
        keyboardContainer.appendChild(row);
    });
}

function handleKeyPress(key) {
    if (isGameOver) return;

    if (key === "مسح") {
        if (currentGuess.length > 0) {
            currentGuess = currentGuess.slice(0, -1);
            updateBoard();
        }
    } else if (key === "إدخال") {
        if (currentGuess.length === targetWord.length) {
            checkGuess();
        } else {
            alert("يرجى إكمال الحروف أولاً!");
        }
    } else if (currentGuess.length < targetWord.length) {
        currentGuess += key;
        updateBoard();
    }
}

function updateBoard() {
    for (let i = 0; i < targetWord.length; i++) {
        const tile = document.getElementById(`tile-${attempts}-${i}`);
        tile.innerText = currentGuess[i] || "";
    }
}

function checkGuess() {
    for (let i = 0; i < targetWord.length; i++) {
        const tile = document.getElementById(`tile-${attempts}-${i}`);
        const letter = currentGuess[i];

        setTimeout(() => {
            tile.classList.add("flip");

            if (letter === targetWord[i]) {
                tile.classList.add("correct");
            } else if (targetWord.includes(letter)) {
                tile.classList.add("present");
            } else {
                tile.classList.add("absent");
            }
        }, i * 200);
    }

    const totalDelay = targetWord.length * 200 + 300;

    setTimeout(() => {
        const today = new Date().toISOString().split('T')[0];

        // حالة الفوز: تُفتح القصة فقط هنا!
        if (currentGuess === targetWord) {
            isGameOver = true;
            localStorage.setItem('lastPlayedDate', today);
            localStorage.setItem('lastGameResult', 'win');
            showStory(); 
        } else {
            attempts++;
            currentGuess = "";
            // حالة الخسارة: تظهر نافذة الكلمة فقط
            if (attempts === maxAttempts) {
                isGameOver = true;
                localStorage.setItem('lastPlayedDate', today);
                localStorage.setItem('lastGameResult', 'lose');
                showLoseModal();
            }
        }
    }, totalDelay);
}

// تُستدعى فقط عند الفوز
function showStory() {
    document.getElementById("character-name").innerText = todayCharacter.name;
    document.getElementById("character-story").innerText = todayCharacter.story;
    document.getElementById("story-modal").style.display = "flex";
}

// تُستدعى فقط عند الخسارة
function showLoseModal() {
    document.getElementById("correct-word-display").innerText = targetWord;
    document.getElementById("lose-modal").style.display = "flex";
}