let timerInterval;
let seconds = 0;
let isRunning = false;
let startTime;
let hasSpoken = {
    1: false,
    2: false,
    5: false
};

const timerDisplay = document.getElementById('timer');
const toggleBtn = document.getElementById('toggleBtn');
const resetBtn = document.getElementById('resetBtn');
const messageArea = document.getElementById('messageArea');
const ind1m = document.getElementById('ind-1m');
const ind2m = document.getElementById('ind-2m');
const ind5m = document.getElementById('ind-5m');

// Check for Speech Synthesis support
if (!window.speechSynthesis) {
    messageArea.textContent = "お使いのブラウザは音声読み上げに対応していません。";
    toggleBtn.disabled = true;
}

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function speak(text) {
    if (window.speechSynthesis) {
        // Cancel any existing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 1.0;
        utterance.volume = 1.0;

        // Try to find a Japanese voice
        const voices = window.speechSynthesis.getVoices();
        const jpVoice = voices.find(voice => voice.lang.includes('ja'));
        if (jpVoice) {
            utterance.voice = jpVoice;
        }

        window.speechSynthesis.speak(utterance);
    }
}

function updateIndicators(minutes) {
    ind1m.classList.toggle('active', minutes >= 1);
    ind2m.classList.toggle('active', minutes >= 2);
    ind5m.classList.toggle('active', minutes >= 5);
}

function checkTime() {
    // 1 minute = 60 seconds
    if (seconds >= 60 && !hasSpoken[1]) {
        speak("1分が経過しました。血圧を測ってください。");
        messageArea.textContent = "1分経過：血圧を測ってください";
        hasSpoken[1] = true;
        updateIndicators(1);
    }
    // 2 minutes = 120 seconds
    if (seconds >= 120 && !hasSpoken[2]) {
        speak("2分が経過しました。血圧を測ってください。");
        messageArea.textContent = "2分経過：血圧を測ってください";
        hasSpoken[2] = true;
        updateIndicators(2);
    }
    // 5 minutes = 300 seconds
    if (seconds >= 300 && !hasSpoken[5]) {
        speak("5分が経過しました。血圧を測ってください。");
        messageArea.textContent = "5分経過しました。測定終了です。";
        hasSpoken[5] = true;
        updateIndicators(5);
        stopTimer();
        toggleBtn.innerHTML = '<span class="icon">↺</span> 完了';
    }
}

function startTimer() {
    if (isRunning) return;

    // Initial user interaction is needed to allow speech synthesis in some browsers
    if (seconds === 0) {
        speak("測定を開始します。");
        messageArea.textContent = "測定中...";
    }

    isRunning = true;
    // Calculate startTime relative to current seconds so resuming works
    startTime = Date.now() - (seconds * 1000);
    toggleBtn.innerHTML = '<span class="icon">II</span> ストップ';
    toggleBtn.classList.replace('btn-primary', 'btn-secondary');
    resetBtn.disabled = true;
    timerDisplay.classList.add('timer-running');

    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newSeconds = Math.floor(elapsed / 1000);

        // Update if the second has changed
        if (newSeconds > seconds) {
            seconds = newSeconds;
            timerDisplay.textContent = formatTime(seconds);
            checkTime();
        }
    }, 100);
}

function stopTimer() {
    if (!isRunning) return;

    isRunning = false;
    clearInterval(timerInterval);
    toggleBtn.innerHTML = '<span class="icon">▶</span> 再開';
    toggleBtn.classList.replace('btn-secondary', 'btn-primary');
    resetBtn.disabled = false;
    timerDisplay.classList.remove('timer-running');
    messageArea.textContent = "一時停止中";
}

function resetTimer() {
    stopTimer();
    seconds = 0;
    timerDisplay.textContent = "00:00";
    toggleBtn.innerHTML = '<span class="icon">▶</span> スタート';
    messageArea.textContent = "準備ができたらスタートを押してください";
    hasSpoken = { 1: false, 2: false, 5: false };

    ind1m.classList.remove('active');
    ind2m.classList.remove('active');
    ind5m.classList.remove('active');
}

toggleBtn.addEventListener('click', () => {
    if (isRunning) {
        stopTimer();
    } else {
        if (seconds >= 300) {
            resetTimer();
            startTimer();
        } else {
            startTimer();
        }
    }
});

resetBtn.addEventListener('click', resetTimer);

// Pre-load voices because sometimes they load asynchronously
window.speechSynthesis.getVoices();
window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
};
