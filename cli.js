#!/usr/bin/env node
const { Command } = require("commander")
const program = new Command()

const devices = require("./commandGroups/devices")
const deviceTypesMappingsSensors = require("./commandGroups/deviceTypesMappingsSensors")
const simulateReadings = require("./commandGroups/simulateReadings")

// Attach commands
devices(program)
deviceTypesMappingsSensors(program)
simulateReadings(program)

program.parse(process.argv)