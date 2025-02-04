#!/usr/bin/env node
const { Command } = require("commander")
const program = new Command()

const deviceRegistration = require("./commandGroups/deviceRegistration")
const devicesAndSensors = require("./commandGroups/devicesAndSensors")
const simulateReadings = require("./commandGroups/simulateReadings")

// Attach commands
deviceRegistration(program)
devicesAndSensors(program)
simulateReadings(program)

program.parse(process.argv)