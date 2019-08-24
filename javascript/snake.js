

class Snake extends Game {
    constructor() {
        super()
        this.snakeCells = []

    }

    buildSnake() {
        console.log(this.cells)

        let startSnake = [
            { row: 7, col: 7 }, // голова змеи
            { row: 7, col: 8 },
        ]

        for (let snakeCell of startSnake) {
            let target = this.cells.find((cell) => {
                return cell.row === snakeCell.row && cell.col === snakeCell.col
            })

            this.snakeCells.push(target)


        }
    }

    renderSnake() {
        this.snakeCells.forEach(cell => {
            this.ctx.drawImage(this.sprites.body, cell.x, cell.y)
        })
    }
}

const snake = new Snake
snake.start()
snake.buildSnake()
