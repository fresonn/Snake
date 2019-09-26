const loadHandler = event => {
    game.build()
    console.log("%cAll resources loaded!", "color: limegreen;")
}

window.addEventListener("load", loadHandler)