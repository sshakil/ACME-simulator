const { LOG_LEVEL } = require("./config")

const log = (...args) => {
    if (LOG_LEVEL === "disabled") return

    if (LOG_LEVEL === "minimal") {
        // Print only the first argument, assuming it contains success/failure messages
        console.log(args[0])
        return
    }

    // Default: 'typical' logs everything
    console.log(...args)
}

module.exports = { log }