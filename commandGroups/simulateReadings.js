const { SIMULATION_INTERVAL_MS } = require("../config")
const {
    getDevices,
    getDeviceSensorMappingsForDevice,
    sendSensorReadingsForDevice
} = require("../api")
const { generateSensorReading } = require("../generator")
const { log } = require("../utils")

// 🔧 Utility: Simulate sensor readings with optional cache
const deviceMappingsCache = new Map() // Global cache for device mappings
const simulateSensorReadings = async (deviceIds = null, useCache, validateMappings, responseBody) => {

    const identifier = deviceIds ? `devices: ${deviceIds}` : "all devices"
    log(`📡 Starting simulation for ${identifier} every ${SIMULATION_INTERVAL_MS} ms...`)

    async function getDevicesList() {
        return deviceIds ? deviceIds.map(id => ({ id })) : await getDevices()
    }

    async function fetchDeviceMappings(deviceId) {
        if (useCache) {
            if (deviceMappingsCache.has(deviceId)) {
                log(`📡 Using cached mappings for device ${deviceId}`)
                return deviceMappingsCache.get(deviceId)
            }

            log(`📡 Fetching fresh mappings for device ${deviceId}...`)
            const mappings = await getDeviceSensorMappingsForDevice(deviceId, true)

            if (!mappings.length) {
                log(`⚠️ No mappings found for device ${deviceId}.`)
                log("")
                return []
            }

            // Store mappings in cache **only if caching is enabled**
            deviceMappingsCache.set(deviceId, mappings)
            return mappings
        }

        // If caching is disabled, always fetch fresh mappings
        log(`📡 Fetching fresh mappings for device ${deviceId} (cache disabled)...`)
        return getDeviceSensorMappingsForDevice(deviceId, true);
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
        await sendSensorReadingsForDevice(deviceId, readings, validateMappings, responseBody)
        log("")
    }

    async function sendReadings() {
        const devices = await getDevicesList()
        if (!devices.length) {
            log("⚠️ No devices found.")
            log("")
            return
        }

        for (const { id } of devices) {
            await processDevice(id)
        }
    }

    await sendReadings()
    setInterval(sendReadings, SIMULATION_INTERVAL_MS)
}

module.exports = (program) => {
    // 🚀 Simulate readings for specified devices
    program
        .command("simulate-readings-for-devices <deviceIds>")
        .option("--no-mapping-cache", "Fetch fresh device-sensor mappings before each reading")
        .option("--no-validate-mappings", "Skip validation of sensor mappings")
        .option("--no-response-body", "Suppress response body from the server")
        .description("Simulate readings for specific devices. E.g.: 'node cli.js simulate-readings-for-devices 1,2' ")
        .action(async (deviceIds, options) => {

            log(`Use Mapping Cache: ${!!options.mappingCache}`)
            log(`Validate Mappings: ${!!options.validateMappings}`)
            log(`Return Response Body: ${!!options.responseBody}`)

            const parsedDeviceIds = deviceIds.split(",").map(Number)
            await simulateSensorReadings(parsedDeviceIds, !!options.mappingCache, options.validateMappings, !!options.responseBody)
        })

}