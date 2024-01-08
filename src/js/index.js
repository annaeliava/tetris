// константы

// формы фигур
const figures = {
    'I': [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    'J': [
        [1,0,0],
        [1,1,1],
        [0,0,0],
    ],
    'L': [
        [0,0,1],
        [1,1,1],
        [0,0,0],
    ],
    'O': [
        [1,1],
        [1,1],
    ],
    'S': [
        [0,1,1],
        [1,1,0],
        [0,0,0],
    ],
    'Z': [
        [1,1,0],
        [0,1,1],
        [0,0,0],
    ],
    'T': [
        [0,1,0],
        [1,1,1],
        [0,0,0],
    ]
};

// цвета фигур
const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
};

// игра

// канвас, игровое поле
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');

// размер квадратика
const grid = 32;

// последовательность фигур
let figuresSequence = [];

// массив игрового поле
let playfield = [];

// готовим игровое поле
// заполняем пустыми ячейками массив
// 0 - пустая ячейка, 1 - часть фигуры
for (let row = -2; row < 20; row++) {
    playfield[row] = [];

    for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
    }
}

// счётчик
let count = 0;

let lines = 0;

// текущая фигура в игре
let figure = getNextFigure();

// анимация
let rAF = null;  

let gameOver = false;

// возвращает случайное число
function getRandomNum(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// последовательность из выпадающих фигур
function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

    // на выходе получаем игровой массив figureSequence из 7 фигур в случайном порядке
    while (sequence.length) {
        // с помощью функции getRandomNum получаем случайное число в диапазоне от 0 до кол-во фигур в массиве sequence
        const random = getRandomNum(0, sequence.length - 1);
        // получаем след фигуру
        const next = sequence.splice(random, 1)[0];
        // помещаем след фигуру в массив последовательности фигур 
        figuresSequence.push(next);
    }
}

// получаем следующую фигуру
function getNextFigure() {

    // генерируем новую последоательность, если след фигуры нет
    if (figuresSequence.length === 0) {
        // вызываем функцию, на выходе которой получаем массив из 7 элементов (последовательность фигур)
        generateSequence();
    }

    // первая фигура в массиве
    const firstFigure = figuresSequence.pop();

    // создаём матрицу, через объект figures по firstFigure определяем форму матрицы 
    const matrix = figures[firstFigure];

    // I и O стартуют с середины, остальные — левее
    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);

    // I стартует с 21 строки, остальные — с 22, так как I падает горизонтально и состоит из одной строки
    // -1 и -2 - смещение
    const row = firstFigure === 'I' ? -1 : -2;

    // возвращаем объект с данными о фигуре
    return {
        name: firstFigure,  // название фигуры
        matrix: matrix,     // матрица с фигурой
        row: row,           // текущая строка
        col: col            // текущий столбец
    };
}

// поворачиваем матрицу на 90 градусов
function rotate(matrix) {
    // длина матрицы
    const m = matrix.length - 1;
    // разбираем массив в массиве
    // j - индекс внутреннего массива
    const result = matrix.map((row, i) =>
        row.map((v, j) => matrix[m - j][i])
    );
    // возвращаем на выходе снова матрицу
    return result;
}

function isValidMove(matrix, cellRow, cellCol) {
    // проверяем все строки и столбцы
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (
                // выходит за границы поля
                cellCol + col < 0 ||
                cellCol + col >= playfield[0].length ||
                cellRow + row >= playfield.length ||
                // пересекается с другими фигурами
                playfield[cellRow + row][cellCol + col])
            ) {
            // невозможно повернуть фигуру
            return false;
        }
    }
    }
    
    return true;
}

let score = document.getElementById('score');

function placeFigure() {
    // обрабатываем все строки и столбцы в игровом поле
    for (let row = 0; row < figure.matrix.length; row++) {
        for (let col = 0; col < figure.matrix[row].length; col++) {
            if (figure.matrix[row][col]) {

                // если край фигуры вылезает за границы игового поле, то игра закончилась
                if (figure.row + row < 0) {
                    return showGameOver();
                }

                // записываем в массив игрового поля нашу фигуру
                playfield[figure.row + row][figure.col + col] = figure.name;
            }
        } 
    }

    // проверяем, чтобы заполненные ряды очистились снизу вверх
    for (let row = playfield.length - 1; row >= 0; ) {
        // если ряд заполнен
        if (playfield[row].every(cell => !!cell)) {
            lines++;
            score.textContent = lines;

            // очищаем его и опускаем всё вниз на одну клетку
            for (let r = row; r >= 0; r--) {
                for (let c = 0; c < playfield[r].length; c++) {
                    playfield[r][c] = playfield[r-1][c];
                }
            }
        }
        else {
            // переходим к след ряду
            row--;
        }
    }
    // получаем след фигуру
    figure = getNextFigure();
}

// Game Over
function showGameOver() {
    // останавливаем анимацию 
    cancelAnimationFrame(rAF);

    gameOver = true;

    // рисуем чёрный прямоугольник посередине поля
    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
    // пишем надпись белым моноширинным шрифтом по центру
    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
}

// ускорить падение фигуры
function speedUpFigure() {
    // смещаем фигуру на строку вниз
    const row = figure.row + 1;
    // если опускаться больше некуда — запоминаем новое положение
    if (!isValidMove(figure.matrix, row, figure.col)) {
        figure.row = row - 1;
        // ставим на место и смотрим на заполненные ряды
        placeFigure();
        return;
    }
    // запоминаем строку, куда стала фигура
    figure.row = row;
}

// повернуть фигуру 
function rotateFigure() {
    // поворачиваем фигуру на 90 градусов
    const matrix = rotate(figure.matrix);
    // если так ходить можно — запоминаем
    if (isValidMove(matrix, figure.row, figure.col)) {
        figure.matrix = matrix;
    }
}

// клавиатура
document.addEventListener('keydown', function(e) {
    // если игра закончилась — сразу выходим
    if (gameOver) return;

    // стрелки влево и вправо
    if (e.which === 37 || e.which === 39) {
        const col = e.which === 37
        // если влево, то уменьшаем индекс в столбце, если вправо — увеличиваем
        ? figure.col - 1
        : figure.col + 1;

        // проверяем, есть ли место вокург фигуры, если да, то запоминаем текущее положение 
        if (isValidMove(figure.matrix, figure.row, col)) {
            figure.col = col;
        }
    }

    // стрелка вверх — поворот
    if (e.which === 38) {
        rotateFigure();
    }

    // стрелка вниз — ускорить падение
    if(e.which === 40) {
        speedUpFigure();
    }
});

// панель 

let leftBtn = document.getElementById('btn-left');
let rightBtn = document.getElementById('btn-right');
let downBtn = document.getElementById('btn-down');
let rotateBtn = document.getElementById('btn-rotate');

let pauseBtn = document.getElementById('btn-pause');
let restartBtn = document.getElementById('btn-restart');

// кнопка влево
leftBtn.addEventListener('click', () => {
    if (gameOver) return;

    col = figure.col - 1;

    if (isValidMove(figure.matrix, figure.row, col)) {
        figure.col = col;
    }
});

// кнопка вправо
rightBtn.addEventListener('click', () => {
    if (gameOver) return;

    col = figure.col + 1;

    if (isValidMove(figure.matrix, figure.row, col)) {
        figure.col = col;
    }
});

// кнопка ускорить падение фигуры
downBtn.addEventListener('click', () => {
    speedUpFigure();
});

// кнопка повернуть фигуру 
rotateBtn.addEventListener('click', () => {
    rotateFigure();
});

let pause = false; 

pauseBtn.addEventListener('click', () => {
    if(pause === false) {
        cancelAnimationFrame(rAF);
        pause = true;
    } else {
        rAF = requestAnimationFrame(loop);
        pause = false;
    }
});

// начинаем новую игру
restartBtn.addEventListener('click', ()=> {
    cancelAnimationFrame(rAF);
    // чистим массивы, готовим к новой игре поле
    rAF = null;

    figuresSequence = [];

    playfield = [];

    for (let row = -2; row < 20; row++) {
        playfield[row] = [];

        for (let col = 0; col < 10; col++) {
            playfield[row][col] = 0;
        }
    }

    count = 0;

    lines = 0;

    score.textContent = lines;

    // генерируем новую последовательность
    figure = getNextFigure();

    gameOver = false;

    pause = false;

    // запускаем игру
    rAF = requestAnimationFrame(loop);
});

// анимация, цикл игры
function loop() {
    // начинаем анимацию
    rAF = requestAnimationFrame(loop);
    // очищаем холст
    context.clearRect(0,0,canvas.width,canvas.height);

    // рисуем игровое поле с учётом заполненных фигур
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playfield[row][col]) {
                const name = playfield[row][col];
                context.fillStyle = colors[name];

                // рисуем на пиксель меньше
                context.fillRect(col * grid, row * grid, grid-1, grid-1);
            }
        }
    }

    // рисуем текущую фигуру
    if (figure) {
        if (++count > 50) {
            figure.row++;
            count = 0;

            if (!isValidMove(figure.matrix, figure.row, figure.col)) {
                figure.row--;
                placeFigure();
            }
        }

        // цвет текущей фигуры
        context.fillStyle = colors[figure.name];

        // отрисовываем её
        for (let row = 0; row < figure.matrix.length; row++) {
            for (let col = 0; col < figure.matrix[row].length; col++) {
                if (figure.matrix[row][col]) {
                    // и снова рисуем на один пиксель меньше
                    context.fillRect((figure.col + col) * grid, (figure.row + row) * grid, grid-1, grid-1);
                }
            }
        }
    }
}

// старт игры, запускаем анимацию
rAF = requestAnimationFrame(loop);