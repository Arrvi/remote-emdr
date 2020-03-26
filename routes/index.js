const debug = require('debug')
const express = require('express')
const router = express.Router()

const PING_COMMAND = 'ping'

const Events = {
    lastId: 0,
    listeners: {},
    subscribe: (room, callback) => {
        debug('remote-emdr:server:' + room)('New connection')
        const id = Events.lastId++
        Events.listeners[id] = {room, callback}
        return id
    },
    unsubscribe: (id) => {
        debug('remote-emdr:server:' + Events.listeners[id].room)('Lost connection')
        delete Events.listeners[id]
    },
    trigger: (room, event) => {
        debug('remote-emdr:server:' + room)('Broadcasting command ' + event)
        Object.values(Events.listeners)
            .filter(l => l.room === room)
            .forEach(l => l.callback(event))
    }
}

/* GET home page. */
router.get('/', (req, res) => {
    res.redirect('/' + Math.random().toString(36).substring(2))
})

router.get('/:room', (req, res) => {
    res.render('index', {room: req.params.room})
})

router.ws('/:room/events', (ws, req) => {
    const ping = setInterval(() => ws.send(JSON.stringify({type: PING_COMMAND})), 1000)
    const room = req.params.room
    const subscriptionId = Events.subscribe(room, (event) => {
        ws.send(event)
    })
    ws.on('message', (message) => {
        Events.trigger(room, message)
    })
    ws.on('close', () => {
        Events.unsubscribe(subscriptionId)
        clearInterval(ping)
    })
})

module.exports = router
