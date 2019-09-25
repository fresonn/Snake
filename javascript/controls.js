const loadHandler = event => {
    game.build()
    console.log('all load')
}

window.addEventListener('load', loadHandler)