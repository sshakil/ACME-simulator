const { LOG_LEVEL } = require("./config")

const log = (...args) => {
    if (LOG_LEVEL === "disabled") return

    if (LOG_LEVEL === "minimal") {
        console.log(args[0]) // Only log the main message
        return
    }

    // Default: 'verbose' logs everything
    console.log(...args)
}

module.exports = { log }