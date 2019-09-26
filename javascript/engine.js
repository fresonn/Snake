/*
    Тут вся основная логика игры!
    •Нужно как-то очищать предыдущий кадр, для отрисовки нового кадра анимации
*/


class Game {
    
    constructor() {
        this.canvas = document.querySelector("#cnvs")
        this.ctx = this.canvas.getContext("2d")
        this.counter = document.querySelector(".count-record")
        this.coin = null
        this.bomb = null
        this.game = {
            cells: [],
            cellSize: 20,
            isStarted: false,
            isLosing: false,
            record: 0,
            current: 0
        }
        this.snake = {
            cells: [],
            speed: 100, // в ms
            isMoving: false,
            currentRoute: null,
            startCoords: [
                { row: 20, col: 20 }, // голова змеи
                { row: 21, col: 20 },
            ],
            routes: {
                left: {
                    row: 0,
                    col: -1,
                },
                up: {
                    row: -1,
                    col: 0
                },
                right: {
                    row: 0,
                    col: 1
                },
                down: {
                    row: 1,
                    col: 0
                }
            }
        }
        this.sprites = {
            body: null,
            cell: null,
            coin: null,
            bomb: null,
            head: null
        }
        this.removeKeyHandler = this.keyHandler.bind(this)
    }


    build() {
        this.buildGrid()
        this.buildSnake()
        this.buildCoin()
        this.buildBomb()
        this.action()

        this.assetsPreload(() => {
            this.launch()
        })
        this.snake.currentRoute = this.snake.routes.up
    }


    start() {
        this.game.isStarted = true
        const infoTitle = document.querySelector(".title")
        infoTitle.classList.add("hide")
        this.snake.isMoving = true

        this.timer = setInterval(() => {
            this.move()
            this.launch()
        }, this.snake.speed);

    }

    /*
        Поскольку методы ES6 эквивалентны обычным функциям, а это значит - они теряют свой контекст
        тут отлично подойдет стрелочная функция, она получает контекст при определении, а не при вызове!!!
        Но это только в Chrome(
    */
    keyHandler(event) {

        // 2 раза не выйдет
        if (!this.game.isStarted && !this.game.isLosing && event.keyCode === 32) { // Space
            this.start()
            this.game.isStarted = true
        }
        // R
        if (!this.game.isStarted && this.game.isLosing && event.keyCode === 82) {
            this.restartGame()
        }

        const {
            up,
            down,
            left,
            right
        } = this.snake.routes

        switch (event.keyCode) {
            case 87: // up
                this.snake.currentRoute = up
            break
            case 68:
                this.snake.currentRoute = right
            break
            case 83:
                this.snake.currentRoute = down
            break
            case 65:
                this.snake.currentRoute = left
            break
            default:
                return
        }
    }


    action() {
        window.addEventListener("keydown", this.removeKeyHandler)
    }


    launch() {
        // вывод и параметры каждого изображения
        window.requestAnimationFrame(() => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.renderGrid()
            this.renderSnake()
        })


    }


    assetsPreload(funcAfterAll) {

        let count = 0
        const requiredAssets = Object.keys(this.sprites).length

        const oneAssetLoad = () => {
            count++
            if (count <= requiredAssets) {
                // запуск по факту загрузки всех ассетов
                funcAfterAll()
            }
        }
        
        for (let key in this.sprites) {
            this.sprites[key] = new Image
            this.sprites[key].src = `assets/${key}.png`
            // нужно попасть в момент загрузки спрайта текущей итерации
            this.sprites[key].addEventListener("load", oneAssetLoad)
        }

    }


    createCell(row, col) {
        const cellObj = {
            x: this.game.cellSize * col,
            y: this.game.cellSize * row,
            row,
            col
        }
        return cellObj
    }


    buildGrid() {
        // На основе размеров канваса строим абстрактную сетку
        for (let row = 0; row < this.canvas.width / this.game.cellSize; row++) { 
            for (let col = 0; col < this.canvas.height / this.game.cellSize; col++) {

                this.game.cells.push(this.createCell(row, col))
            }
        }
    }


    renderGrid() {
        // Все полученные координаты ячеек нужно заполнить
        for (let cell of this.game.cells) {
            this.ctx.drawImage(this.sprites.cell, cell.x, cell.y)

            if (cell.food) {
                this.ctx.drawImage(this.sprites.coin, cell.x, cell.y)
            } else if (cell.bomb) {
                this.ctx.drawImage(this.sprites.bomb, cell.x, cell.y)
            }
        }
    }


    getGridCell(row, col) {
        return this.game.cells.find(cell => cell.row === row && cell.col === col);
    }


    buildSnake() {

        for (let snakeCell of this.snake.startCoords) {

            // Просто заменю ячейки, которые совпадают со змеей на ее картинки
            let target = this.game.cells.find((cell) => {
                return cell.row === snakeCell.row && cell.col === snakeCell.col
                
            })

            this.snake.cells.push(target)

        }
    }

    rednerHead() {
        const head = this.snake.cells[0]
        this.ctx.drawImage(this.sprites.head, head.x, head.y)
    }


    renderBody() {
        let count = 0
        for (let cell of this.snake.cells) {
            if (count > 0) {
                this.ctx.drawImage(this.sprites.body, cell.x, cell.y)
            }
            count++
        }
        
    }


    renderSnake() {
        this.rednerHead()
        this.renderBody()
    }


    getNextCell() {
        const head = this.snake.cells[0]

        // Важно менять текущий маршрут для изменения движения
        const { row , col } = this.snake.currentRoute

        const snakeRow = head.row + row
        const snakeCol = head.col + col

        // вернет ячейку
        return this.game.cells.find(cell => cell.row === snakeRow && cell.col === snakeCol)
    }
    

    move() {

        if (!this.snake.isMoving) return // ну тут ясно

        const nextCell = this.getNextCell() // bool
        // может тут уместен switch?
        if (nextCell) {
            // +1 в начало
            this.snake.cells.unshift(nextCell) // каждая новая ячейка - голова
            if (this.isBomb(nextCell)) {
                this.stopGame()
            }

            if (!this.isCoin(nextCell)) {
                // -1 в конце
                this.snake.cells.pop()
            } else {
                this.coin.food = false
                this.showResultOneline()
                this.buildCoin()
                this.buildBomb()
            }
        } else {
            this.stopGame()
        }
    }


    showResultOneline() {
        this.game.current++
        this.counter.textContent = this.game.current
    }


    stopGame(repeat = true) {
        this.snake.isMoving = false
        this.game.isStarted = false
        this.game.isLosing = true
        this.game.record = this.game.current
        this.game.current = 0
        clearInterval(this.timer)
        this.canvas.style.border = "2px solid #dc3545"
        const infoTitle = document.querySelector(".title")
        infoTitle.classList.remove("hide")
        infoTitle.textContent = "Нажмите \"R\" чтобы повторить!"
    }


    clearAllBombs() {
        for (let gameCell of this.game.cells) {
            // Просто заменю ячейки, которые совпадают со змеей на ее картинки
            if (gameCell.bomb) {
                gameCell.bomb = false
            }
        }
    }

    
    restartGame() {
        this.clearAllBombs()
        this.snake.cells = []
        this.buildSnake()
        this.buildBomb()
        this.canvas.style.border = "2px solid #635c5c"
        this.start()
        this.game.current = 0
        this.counter.textContent = 0
    }


    isSnakeCells(findCell) {
        this.game.cells.find(cell => {
            return cell === findCell
        })
    }

    
    getRandomCell(m, n) {
        return m + Math.floor((n - m + 1) * Math.random())
    }

    // золотая монетка на поле
    buildCoin() {
       
        const availableCells = this.game.cells.filter(findCell => !this.isSnakeCells(findCell))
        const randomCell = this.game.cells[this.getRandomCell(20, availableCells.length - 1)]

        randomCell.food = true
        this.coin = randomCell
    }


    isCoin(findCell) {
        return findCell.food
    }

    // бомба на поле
    buildBomb() {
        const availableCells = this.game.cells.filter(findCell => !this.isSnakeCells(findCell))
        const cell = this.game.cells[this.getRandomCell(20, availableCells.length - 1)]

        cell.bomb = true
        this.bomb = cell
    }


    isBomb(findCell) {
        return findCell.bomb
    }

}

const game = new Game