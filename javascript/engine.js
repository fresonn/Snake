/*
    Тут вся основная логика игры!
*/

class Game {

    static nameOfGame = "SnakeJS"

    constructor() {
        this.canvas = document.querySelector("#cnvs")
        this.ctx = this.canvas.getContext("2d")
        this.sprites = {
            cell: null,
        }
    }

    start() {
        this.ctx.fillStyle = "rgb(33, 34, 45)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.assetsPreload(() => {
            this.launch()
        })
    }

    launch() {
        // вывод и параметры каждого изображения
        window.requestAnimationFrame(() => {
            this.ctx.drawImage(this.sprites.cell, 0, 0)
        })
    }

    assetsPreload(funcAfterAll) {
        let count = 0
        const requiredAssets = Object.keys(this.sprites).length

        const oneAssetLoad = () => {
            count += 1

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
}


const snake = new Game
snake.start()