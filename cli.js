#!/usr/bin/env node
const { Command } = require("commander")
const program = new Command()

const devices = require("./commandGroups/devices")
const sensors = require("./commandGroups/sensors")
const simulateReadings = require("./commandGroups/simulateReadings")

// Attach commands
devices(program)
sensors(program)
simulateReadings(program)

program.parse(process.argv)