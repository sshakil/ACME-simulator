const { addDeviceType, addSensorType } = require("../config")
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
    // 🚀 Add a new device type
    program
        .command("add-device-type <type> <sensors>")
        .description("Adds a new device type (e.g., drone 'GPS, LiDAR, IMU')")
        .action(async (type, sensors) => {
            addDeviceType(type, sensors.split(",").map(s => s.trim()))
            log(`✅ Device type '${type}' added with sensors: ${sensors}`)
            log("")
        })

    // 🚀 Add a new sensor
    program
        .command("add-sensor <type> <unit>")
        .description("Adds a new sensor type (e.g., CO2 Sensor ppm)")
        .action(async (type, unit) => {
            await addSensorType(type, unit)
            log(`✅ Sensor '${type}' added with unit: ${unit}`)
            log("")
        })

    // 🚀 Get sensor mappings for a device
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