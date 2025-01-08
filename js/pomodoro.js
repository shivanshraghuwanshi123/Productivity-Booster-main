document.addEventListener("DOMContentLoaded", () => {
    const timerDisplay = document.getElementById("timerDisplay");
    if (timerDisplay) {
        let timer;
        const startTimerBtn = document.getElementById("startTimer");
        const pauseTimerBtn = document.getElementById("pauseTimer");
        const resetTimerBtn = document.getElementById("resetTimer");
        const setTimerBtn = document.getElementById("setTimer");
        const timerInput = document.getElementById("timerInput");

        let timeLeft = 1500; // 25 minutes in seconds

        const updateTimerDisplay = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        };

        const startTimer = () => {
            clearInterval(timer);
            timer = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timer);
                    alert("Time's up!");
                }
            }, 1000);
        };

        const pauseTimer = () => {
            clearInterval(timer);
        };

        const resetTimer = () => {
            clearInterval(timer);
            timeLeft = 1500; // Reset to 25 minutes
            updateTimerDisplay();
        };

        const setTimer = () => {
            const minutes = parseInt(timerInput.value);
            if (!isNaN(minutes) && minutes > 0) {
                timeLeft = minutes * 60;
                updateTimerDisplay();
            } else {
                alert("Please enter a valid number of minutes.");
            }
        };

        startTimerBtn.addEventListener("click", startTimer);
        pauseTimerBtn.addEventListener("click", pauseTimer);
        resetTimerBtn.addEventListener("click", resetTimer);
        setTimerBtn.addEventListener("click", setTimer);

        updateTimerDisplay(); // Initialize the display
    }
});
