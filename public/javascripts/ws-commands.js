const RETRY_LIMIT = 5
const Commands = {
    socket: null,
    lastId : 0,
    listeners : {},
    connect: (room, retry = 0) => {
        if (retry >= RETRY_LIMIT) {
            throw new Error('Cannot reconnect after ' + retry + ' times')
        }
        if (Commands.socket) {
            Commands.socket.close()
        }
        const protocol = location.protocol === 'https:' ? 'wss://' : 'ws://'
        Commands.socket = new WebSocket(protocol + location.host + '/' + room + '/events')
        Commands.socket.addEventListener('message', (event) => {
            const command = JSON.parse(event.data)
            Commands.trigger(command)
        })
        Commands.socket.addEventListener('close', () => {
            Commands.connect(room, retry + 1)
        })
    },
    trigger: (command) => {
        if (!command.type) {
            throw new Error('Command type missing')
        }
        if (Commands.listeners[command.type]) {
            Object.values(Commands.listeners[command.type]).forEach(callback => callback(command))
        }
    },
    execute: (command) => {
        if (!command.type) {
            throw new Error('Command type missing')
        }
        if (!Commands.socket) {
            throw new Error('not connected')
        }
        if (Commands.socket.readyState === WebSocket.CONNECTING) {
            Commands.socket.addEventListener('open', () => Commands.execute(command))
        }

        Commands.socket.send(JSON.stringify(command))
    },
    subscribe: (type, callback) => {
        if (!Commands.listeners[type]) {
            Commands.listeners[type] = {}
        }
        const id = Commands.lastId
        Commands.listeners[type][id] = callback
        return id
    },
    unsubscribe: (type, id) => {
        if (Commands.listeners[type]) {
            delete Commands.listeners[type][id]
        }
    }
}
