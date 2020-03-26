const COMMAND_STOP = 'stop'
const COMMAND_START = 'start'
const COMMAND_SPEED = 'speed'
const DIRECTION_LEFT = 'left'
const DIRECTION_RIGHT = 'right'

const SPEED_VALUE_MAX = 100
const SPEED_PERIOD_FAST = 0.25
const SPEED_PERIOD_SLOW = 2

const calculatePeriod = value => SPEED_PERIOD_SLOW - (value / SPEED_VALUE_MAX) * (SPEED_PERIOD_SLOW - SPEED_PERIOD_FAST)

const replaceClass = ($elem, from, to) => {
    const classes = $elem.className.split(' ')
    const i = classes.indexOf(from)
    if (i !== -1) {
        classes.splice(i, 1, to)
    } else if (to) {
        classes.push(to)
    }
    $elem.className = classes.join(' ')
}

const delay = requestAnimationFrame || setTimeout

document.addEventListener('DOMContentLoaded', () => {
    let running = false
    let speed = 50
    let direction = DIRECTION_LEFT
    let animationTimeout
    const $toggle = document.querySelector('#toggle')
    const $puck = document.querySelector('#puck')
    const $speed = document.querySelector('#speed')
    const $clickLeft = document.querySelector('#click-left')
    const $clickRight = document.querySelector('#click-right')
    replaceClass($puck, direction, direction)

    const updateButton = () => {
        $toggle.textContent = running ? 'Stop' : 'Start'
    }

    const playClick = () => {
        $clickLeft.pause()
        $clickLeft.currentTime = 0;
        $clickRight.pause()
        $clickRight.currentTime = 0;
        if (direction === DIRECTION_LEFT) {
            $clickLeft.play()
        } else {
            $clickRight.play()
        }
    }

    const slide = () => {
        playClick()
        const period = calculatePeriod(speed)
        $puck.style.transitionDuration = period + 's'
        const prevDirection = direction
        direction = direction === DIRECTION_RIGHT ? DIRECTION_LEFT : DIRECTION_RIGHT
        replaceClass($puck, prevDirection, direction)
        animationTimeout = setTimeout(slide, period * 1000)
    }

    const start = () => {
        slide()
    }
    const stop = () => {
        if (animationTimeout) {
            clearTimeout(animationTimeout)
        }
    }

    $toggle.addEventListener('click', () => {
        Commands.execute({type: running ? COMMAND_STOP : COMMAND_START})
    })
    $speed.addEventListener('change', (evt) => {
        Commands.execute({type: COMMAND_SPEED, data: {speed: parseInt(evt.target.value)}})
    })

    Commands.subscribe(COMMAND_STOP, () => {
        running = false
        updateButton()
        stop()
    })

    Commands.subscribe(COMMAND_START, () => {
        running = true
        updateButton()
        start()
    })

    Commands.subscribe(COMMAND_SPEED, command => {
        speed = command.data.speed
        $speed.value = speed
    })

    updateButton()
})
