/*
    Тут вся основная логика игры!
*/

const canvas = document.querySelector("#cnvs")

class Game {

    static nameOfGame = "SnakeJS"
    

    constructor() {
        this.canvas = document.querySelector("#cnvs")
        this.ctx = this.canvas.getContext("2d")
        this.game = {
            cells: [],
            cellSize: 20
        }
        this.snake = {
            cells: [],
        }
        this.sprites = {
            body: null,
            cell: null,
        }
    }

    start() {
       
        this.buildGrid()
        this.buildSnake()

        
        this.assetsPreload(() => {
            this.launch()
        })

    }

    launch() {

        // вывод и параметры каждого изображения
        window.requestAnimationFrame(() => {
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
        console.log(this.game.cells)
    }


    renderGrid() {
        for (let cell of this.game.cells) {
            this.ctx.drawImage(this.sprites.cell, cell.x, cell.y)
        }
    }

    getGridCell(row, col) {
        return this.game.cells.find(cell => cell.row === row && cell.col === col);
    }


    // 

    buildSnake() {

        let startSnake = [
            { row: 20, col: 20 }, // голова змеи
            { row: 21, col: 20 },
            { row: 22, col: 20 },
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
        const row = head.row - 1
        const col = head.col 

        let target = this.game.cells.find(cell => {
            return cell.row === row && cell.col === col
            
        })

        return target
    }
    
    move() {
        const nextCell = this.getNextCell() // bool

        if (nextCell) {
            // +1 в начало
            this.snake.cells.unshift(nextCell) // каждая новая ячейка - голова
            // -1 в конце
            this.snake.cells.pop()
        }
    }

    x() {
        // console.log(this.snake.cells)
        this.move()
        this.renderSnake()
        // console.log(this.snake.cells)
    }

}

for (let x = 0; x <= 10; x++) {
	setTimeout(() => {
		game.x()
	}, x * 1000)
}


const game = new Game
game.start()