/*
    Тут вся основная логика игры!
    •Нужно как-то очищать предыдущий кадр, для отрисовки нового кадра анимации
*/


class Game {
    
    constructor() {
        this.canvas = document.querySelector("#cnvs")
        this.ctx = this.canvas.getContext("2d")
        this.coin = null
        this.game = {
            cells: [],
            cellSize: 20
        }
        this.snake = {
            cells: [],
            speed: 100, // в ms
            isMoving: false,
            currentRoute: null,
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
        }
        this.removeKeyHandler = this.keyHandler.bind(this)
    }



    build() {
        this.buildGrid()
        this.buildSnake()
        this.buildCoin()

        this.assetsPreload(() => {
            this.launch()
        })
        this.snake.currentRoute = this.snake.routes.up
    }



    start() {
    
        this.build()
        this.action()
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
            }
        }

        
    }



    getGridCell(row, col) {
        return this.game.cells.find(cell => cell.row === row && cell.col === col);
    }



    buildSnake() {

        let startSnake = [
            { row: 20, col: 20 }, // голова змеи
            { row: 21, col: 20 },
            { row: 22, col: 20 },
            { row: 23, col: 20 },
        ]

        for (let snakeCell of startSnake) {

            // Просто заменю ячейки, которые совпадают со змеей на ее картинки
            let target = this.game.cells.find((cell) => {
                return cell.row === snakeCell.row && cell.col === snakeCell.col
                
            })

            this.snake.cells.push(target)


        }
    }

    renderSnake() {
        for (let cell of this.snake.cells) {
            this.ctx.drawImage(this.sprites.body, cell.x, cell.y)
        }
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

        console.log('move')

        const nextCell = this.getNextCell() // bool

        if (nextCell) {
            // +1 в начало
            this.snake.cells.unshift(nextCell) // каждая новая ячейка - голова
            if (!this.isCoin(nextCell)) {
                // -1 в конце
                this.snake.cells.pop()
            } else {
                this.coin.food = false
                this.buildCoin()
            }
        } else {
            console.log('stop')
            clearInterval(this.timer)
            window.removeEventListener('keydown', this.removeKeyHandler)
        }
    }


    isSnakeCells(findCell) {
        this.game.cells.find(cell => {
            return cell === findCell
        })
    }

    isCoin(findCell) {
        return findCell.food
    }

    // 
    buildCoin() {
        const getRandomCell = (m, n) => {
            return m + Math.floor((n - m + 1) * Math.random())
        }


        const availableCells = this.game.cells.filter(findCell => !this.isSnakeCells(findCell))


        const cell = this.game.cells[getRandomCell(20, availableCells.length - 1)]
        cell.food = true
        this.coin = cell
    }

}

const game = new Game
game.start()