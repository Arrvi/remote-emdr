document.addEventListener('DOMContentLoaded', () => {

    let state = 0
    document.querySelector('#button').addEventListener('click', () => {
        Commands.execute({type: 'update', state: state+1})
    })

    const element = document.querySelector('#state')
    element.textContent = state

    Commands.subscribe('update', (command) => {
        state = command.state
        element.textContent = state
    })

})
