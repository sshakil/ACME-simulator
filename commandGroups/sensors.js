const { addDeviceType } = require("../config")
const { getDevices, getSensors, getDeviceSensorMappings } = require("../api")
const { log } = require("../utils")

// 🔧 Utility: Fetch and cache device-sensor mappings
let cachedMappings = null
const fetchDeviceSensorMappings = async (forceRefresh = false) => {
    if (!cachedMappings || forceRefresh) {
        log(forceRefresh ? "🔄 Fetching fresh device-sensor mappings..." : "📡 Caching device-sensor mappings...")
        cachedMappings = await getDeviceSensorMappings()
    } else {
        log("📡 Using cached device-sensor mappings.")
    }
    log("")
    return cachedMappings
}

module.exports = (program) => {

    program
        .command("update-sensor")
        .requiredOption("-i, --sensor-id <id>", "Sensor ID to update")
        .requiredOption("-t, --type <newType>", "New sensor type")
        .requiredOption("-u, --unit <newUnit>", "New sensor unit")
        .description("Update the type and unit of a given sensor")
        .action(async (options) => {
            const {sensorId, type, unit} = options
            log(`✅ Sensor ${sensorId} updated with ${[type, unit].filter(Boolean).join(", ")}`)
            log("")
        })

    program
        .command("get-device-mappings <deviceName>")
        .description("Retrieves all sensor mappings for a specific device")
        .action(async (deviceName) => {
            log(`🔍 Fetching sensor mappings for device: ${deviceName}`)

            const device = (await getDevices()).find(d => d.name === deviceName)
            if (!device) {
                log(`❌ Device "${deviceName}" not found.`)
                log("")
                return
            }

            const deviceMappings = (await fetchDeviceSensorMappings()).filter(m => m.device_id === device.id)
            if (!deviceMappings.length) {
                log(`ℹ️ No sensors mapped to "${deviceName}".`)
                log("")
                return
            }

            const sensors = await getSensors()

            log(`✅ Sensors mapped to ${device.name}:\n`)
            deviceMappings.forEach(({ sensor_id, id }) => {
                const sensor = sensors.find(s => s.id === sensor_id)
                const sensorName = sensor ? sensor.type : "Unknown Sensor"
                log(`Sensor: ${sensorName}, Mapping ID: ${id}`)
            })
            log("")
        })
}