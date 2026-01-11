const PRESET_GRIDS = { 9: 3, 25: 5, 49: 7, 100: 10 };

const inputImg = document.getElementById("inputImg");
const previewImg = document.getElementById("previewImg");
const startBtn = document.querySelector(".start-btn");
const gameField = document.getElementById("gameField");
const timerDisplay = document.getElementById("timerDisplay");

let selectedPieces = 9;
let imgSrc = null;
let timerInterval = null;
let seconds = 0;
let gridSize = 3;

inputImg.addEventListener("change", () => {
    const file = inputImg.files[0];
    if (!file) return;
    imgSrc = URL.createObjectURL(file);
    previewImg.src = imgSrc;
    previewImg.style.display = "block";
});

document.querySelectorAll('input[name="pieces"]').forEach(el => {
    el.addEventListener("change", () => {
        selectedPieces = +el.value;
        gridSize = PRESET_GRIDS[selectedPieces];
    });
});

startBtn.addEventListener("click", () => {
    if (!imgSrc) return alert("Upload an image first!");
    clearInterval(timerInterval);
    seconds = 0;
    timerDisplay.textContent = "Time: 0s";
    gameField.innerHTML = "";

    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
        const imgRatio = img.width / img.height;
        const maxWidth = window.innerWidth * 0.6;
        const maxHeight = window.innerHeight * 0.6;

        let fieldWidth, fieldHeight;

        if (imgRatio > 1) {
            fieldWidth = maxWidth;
            fieldHeight = fieldWidth / imgRatio;
            if (fieldHeight > maxHeight) {
                fieldHeight = maxHeight;
                fieldWidth = fieldHeight * imgRatio;
            }
        } else {
            fieldHeight = maxHeight;
            fieldWidth = fieldHeight * imgRatio;
            if (fieldWidth > maxWidth) {
                fieldWidth = maxWidth;
                fieldHeight = fieldWidth / imgRatio;
            }
        }

        gameField.style.width = fieldWidth + "px";
        gameField.style.height = fieldHeight + "px";

        createPuzzle(imgSrc, gridSize, fieldWidth, fieldHeight);
    };

    startTimer();
});

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        timerDisplay.textContent = `Time: ${seconds}s`;
    }, 1000);
}

function createPuzzle(src, grid, fieldWidth, fieldHeight) {
    const cellWidth = fieldWidth / grid;
    const cellHeight = fieldHeight / grid;

    for (let r = 0; r < grid; r++) {
        for (let c = 0; c < grid; c++) {
            const piece = document.createElement("div");
            piece.classList.add("puzzle-piece");
            piece.style.width = `${cellWidth}px`;
            piece.style.height = `${cellHeight}px`;
            piece.style.backgroundImage = `url(${src})`;
            piece.style.backgroundSize = `${grid * 100}% ${grid * 100}%`;
            piece.style.backgroundPosition = `${-(c * 100)}% ${-(r * 100)}%`;
            piece.dataset.row = r;
            piece.dataset.col = c;
            piece.dataset.placed = "false";
            piece.style.position = "absolute";

            const maxX = fieldWidth - cellWidth;
            const maxY = fieldHeight - cellHeight;
            piece.style.left = `${Math.random() * maxX}px`;
            piece.style.top = `${Math.random() * maxY}px`;
            piece.style.zIndex = 1;

            gameField.appendChild(piece);

            piece.addEventListener("mousedown", e => {
                if (piece.dataset.placed === "true") return;

                const clone = piece.cloneNode(true);
                clone.style.width = piece.style.width;
                clone.style.height = piece.style.height;
                clone.style.position = "absolute";
                clone.style.zIndex = 1000;
                clone.style.pointerEvents = "none";
                document.body.appendChild(clone);

                const onMouseMove = ev => {
                    clone.style.left = ev.pageX - clone.offsetWidth / 2 + "px";
                    clone.style.top = ev.pageY - clone.offsetHeight / 2 + "px";
                };
                document.addEventListener("mousemove", onMouseMove);

                const onMouseUp = ev => {
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);

                    const fieldRect = gameField.getBoundingClientRect();
                    const dropX = ev.clientX - fieldRect.left;
                    const dropY = ev.clientY - fieldRect.top;

                    const targetRow = Math.floor(dropY / cellHeight);
                    const targetCol = Math.floor(dropX / cellWidth);

                    if (targetRow == piece.dataset.row && targetCol == piece.dataset.col) {
                        // snap
                        clone.style.left = `${targetCol * cellWidth}px`;
                        clone.style.top = `${targetRow * cellHeight}px`;
                        clone.dataset.placed = "true";
                        clone.style.zIndex = 2;
                        gameField.appendChild(clone);
                        piece.remove();
                    } else {
                        clone.remove();
                    }
                };
                document.addEventListener("mouseup", onMouseUp);
            });
        }
    }
}
