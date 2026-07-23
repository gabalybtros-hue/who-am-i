let targetWord = "";
let currentGuess = "";
let attempts = 0;
const maxAttempts = 6;
let todayCharacter = null;

window.onload = async () => {
    await loadTodayCharacter();
};

async function loadTodayCharacter() {
    try {
        const response = await fetch('characters.json');
        const charactersData = await response.json();

        // 1. الحصول على تاريخ اليوم بتنسيق YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        // 2. البحث عن الكلمة المخصصة لتاريخ اليوم
        todayCharacter = charactersData.find(item => item.date === today);

        // إذا لم تجد كلمة لهذا اليوم، اختر أول كلمة كاحتياط
        if (!todayCharacter) {
            todayCharacter = charactersData[0];
        }

        targetWord = todayCharacter.name;
        
        // إعادة ضبط اللعبة للكلمة اليومية
        initGame();

    } catch (error) {
        console.error("خطأ في تحميل ملف البيانات:", error);
    }
}

function initGame() {
    document.getElementById("hint-text").innerText = todayCharacter.hint;
    document.getElementById("board").innerHTML = "";
    currentGuess = "";
    attempts = 0;

    // بناء شبكة المربعات بناءً على عدد حروف كلمة اليوم
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
        if (currentGuess === targetWord) {
            showStory();
        } else {
            attempts++;
            currentGuess = "";
            if (attempts === maxAttempts) {
                alert(`للأسف انتهت محاولات اليوم! الكلمة كانت: ${targetWord}`);
            }
        }
    }, totalDelay);
}

function showStory() {
    document.getElementById("character-name").innerText = todayCharacter.name;
    document.getElementById("character-story").innerText = todayCharacter.story;
    document.getElementById("story-modal").style.display = "flex";
}