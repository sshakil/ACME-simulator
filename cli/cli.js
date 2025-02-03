const { Command } = require("commander")
const program = new Command()

const deviceRegistration = require("./deviceRegistration")
const devicesAndSensors = require("./devicesAndSensors")
const simulateReadings = require("./simulateReadings")

// Attach commands
deviceRegistration(program)
devicesAndSensors(program)
simulateReadings(program)

program.parse(process.argv)