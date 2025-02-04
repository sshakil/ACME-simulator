const { SIMULATION_INTERVAL_MS } = require("../config")
const {
    getDevices,
    getDeviceSensorMappingsForDevice,
    getDeviceSensorMappingsForSensors,
    sendSensorReadingsForDevice
} = require("../api")
const { generateSensorReading } = require("../generator")

// 🔧 Utility: Simulate sensor readings with optional cache
const simulateSensorReadings = async (deviceIds = null, useCache, noValidation, noResponseBody) => {
    const identifier = deviceIds ? `devices: ${deviceIds}` : "all devices"
    console.log(`📡 Starting simulation for ${identifier} every ${SIMULATION_INTERVAL_MS} ms...`)

    async function getDevicesList() {
        return deviceIds ? deviceIds.map(id => ({ id })) : await getDevices()
    }

    async function fetchDeviceMappings(deviceId) {
        console.log(`📡 Fetching device-sensor mappings for device ${deviceId}...`)
        const mappings = await getDeviceSensorMappingsForDevice(deviceId, !useCache)

        if (!mappings.length) {
            console.warn(`⚠️ No mappings found for device ${deviceId}.`)
            console.log("")
            return []
        }
        return mappings
    }

    function generateReadings(mappings) {
        const timestamp = new Date().toISOString()
        return mappings.map(({ id }) => ({
            device_sensor_id: id,
            value: generateSensorReading(id),
            time: timestamp
        }))
    }

    async function processDevice(deviceId) {
        const mappings = await fetchDeviceMappings(deviceId)
        if (!mappings.length) return

        const readings = generateReadings(mappings)
        await sendSensorReadingsForDevice(deviceId, readings, noValidation, noResponseBody)
        console.log("")
    }

    async function sendReadings() {
        const devices = await getDevicesList()
        if (!devices.length) {
            console.warn("⚠️ No devices found.")
            console.log("")
            return
        }

        for (const { id } of devices) {
            await processDevice(id)
        }
    }

    await sendReadings()
    setInterval(sendReadings, SIMULATION_INTERVAL_MS)
}

// 🔧 Utility: Simulate sensor readings for specified sensors
const simulateSensorReadingsForSensors = async (deviceSensorIds, useCache) => {
    console.log(`📡 Starting simulation for sensors: ${deviceSensorIds} every ${SIMULATION_INTERVAL_MS} ms...`)

    async function fetchSensorMappings() {
        console.log(`📡 Fetching mappings for sensors: ${deviceSensorIds}`)
        const mappings = await getDeviceSensorMappingsForSensors(deviceSensorIds, !useCache)

        if (!mappings.length) {
            console.warn("⚠️ No mappings found for specified sensors.")
            console.log("")
            return []
        }
        return mappings
    }

    async function processSensor(sensorId) {
        const value = generateSensorReading(sensorId)
        await sendSensorReadingsForDevice(sensorId, [{ device_sensor_id: sensorId, value }], false, false)
        console.log("")
    }

    async function sendReadings() {
        const mappings = await fetchSensorMappings()
        if (!mappings.length) return

        for (const { id } of mappings) {
            await processSensor(id)
        }
    }

    await sendReadings()
    setInterval(sendReadings, SIMULATION_INTERVAL_MS)
}

module.exports = (program) => {
    // 🚀 Simulate readings for all devices
    program
        .command("simulate-readings-for-all-devices")
        .option("--no-mapping-cache", "Fetch fresh device-sensor mappings before each reading")
        .option("--no-validation", "Skip validation of sensor mappings")
        .option("--no-response-body", "Suppress response body from the server")
        .description("Simulate readings for all devices")
        .action(async (options) => {
            await simulateSensorReadings(null, !options.noMappingCache, options.noValidation, options.noResponseBody)
        })

    // 🚀 Simulate readings for specified devices
    program
        .command("simulate-readings-for-specified-devices <deviceIds>")
        .option("--no-mapping-cache", "Fetch fresh device-sensor mappings before each reading")
        .option("--no-validation", "Skip validation of sensor mappings")
        .option("--no-response-body", "Suppress response body from the server")
        .description("Simulate readings for specific devices")
        .action(async (deviceIds, options) => {
            const parsedDeviceIds = deviceIds.split(",").map(Number)
            await simulateSensorReadings(parsedDeviceIds, !options.noMappingCache, options.noValidation, options.noResponseBody)
        })

    // 🚀 Simulate readings for specific sensors
    program
        .command("simulate-readings-for-specified-sensors <deviceSensorIds>")
        .option("--no-mapping-cache", "Fetch fresh device-sensor mappings before each reading")
        .description("Simulate readings for specific device_sensor_ids")
        .action(async (deviceSensorIds, options) => {
            const parsedSensorIds = deviceSensorIds.split(",").map(Number)
            await simulateSensorReadingsForSensors(parsedSensorIds, !options.noMappingCache)
        })
}