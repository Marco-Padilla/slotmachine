const cells = document.querySelectorAll(".cell img");
const spinButton = document.getElementById("spinButton");
const resultMessage = document.getElementById("resultMessage");

const imgGanaste = document.getElementById("imgGanaste");
const imgPerdiste = document.getElementById("imgPerdiste");

const vidasSpan = document.getElementById("vidas");
const puntosSpan = document.getElementById("puntos");

const symbols = [
  { name: "1", img: "img/1.png" },
  { name: "2", img: "img/2.png" },
  { name: "3", img: "img/3.png" },
  { name: "4", img: "img/4.png" },
  { name: "5", img: "img/5.png" },
  { name: "6", img: "img/6.png" },
];

// Estado del juego
let vidas = 3;
let puntos = 0;

// Lottie
lottie.loadAnimation({
  container: document.getElementById("lottie"),
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "animacion.json",
});

// Sonidos
const sonidoSpin = new Audio("sound/spin.wav");
const sonidoVictoria = new Audio("sound/victoria.wav");
const sonidoDerrota = new Audio("sound/lose.wav");

function actualizarStats() {
  vidasSpan.textContent = vidas;
  puntosSpan.textContent = puntos;
}

function spinSlots() {
  if (vidas <= 0) {
    resultMessage.textContent =
      "¡No tienes más vidas! Recarga la página para jugar otra vez.";
    return;
  }

  // Reproducir sonido spin
  sonidoSpin.currentTime = 0;
  sonidoSpin.play();

  setTimeout(() => {
    sonidoSpin.pause();
    sonidoSpin.currentTime = 0;
  }, 2500);

  resultMessage.textContent = "";
  imgGanaste.classList.add("d-none");
  imgPerdiste.classList.add("d-none");

  // Quitar animaciones previas
  cells.forEach((cell) => {
    cell.classList.remove(
      "animate__animated",
      "animate__pulse",
      "animate__infinite",
      "spinning"
    );
  });

  const columns = [
    [0, 3, 6], // Columna izquierda
    [1, 4, 7], // Centro
    [2, 5, 8], // Derecha
  ];

  let spinIntervals = [];

  // Iniciar giro por columna
  columns.forEach((column, colIndex) => {
    spinIntervals[colIndex] = setInterval(() => {
      column.forEach((index) => {
        const random = symbols[Math.floor(Math.random() * symbols.length)];
        const cellImg = cells[index];
        cellImg.src = random.img;
        cellImg.dataset.symbol = random.name;
        cellImg.classList.add("spinning");
      });
    }, 50);
  });

  // Detener columnas con delay progresivo
  columns.forEach((column, colIndex) => {
    setTimeout(() => {
      clearInterval(spinIntervals[colIndex]);
      column.forEach((index) => {
        cells[index].classList.remove("spinning");
      });

      // Si es la última columna, evaluar resultado
      if (colIndex === columns.length - 1) {
        setTimeout(() => {
          evaluateResult();
        }, 300);
      }
    }, 2000 + colIndex * 400);
  });
}

function evaluateResult() {
  const grid = Array.from(cells).map((cell) => cell.dataset.symbol);

  const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let gano = false;

  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (grid[a] && grid[a] === grid[b] && grid[b] === grid[c]) {
      combo.forEach((i) => {
        cells[i].classList.add(
          "animate__animated",
          "animate__pulse",
          "animate__infinite"
        );
      });

      imgGanaste.classList.remove("d-none");
      sonidoVictoria.currentTime = 0;
      sonidoVictoria.play();

      puntos += 1000; // sumar puntos por victoria
      gano = true;
      break;
    }
  }

  if (!gano) {
    imgPerdiste.classList.remove("d-none");
    sonidoDerrota.currentTime = 0;
    sonidoDerrota.play();

    vidas -= 1; // restar vida

    if (vidas <= 0) {
      resultMessage.textContent = "¡Juego terminado! No te quedan vidas.";
      spinButton.disabled = true; // desactivar botón
    }
  }

  actualizarStats();
}

// Inicializa stats al cargar
actualizarStats();

spinButton.addEventListener("click", spinSlots);
