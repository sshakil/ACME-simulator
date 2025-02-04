const { addDeviceType, addSensorType } = require("../config")
const { getDevices, getSensors, getDeviceSensorMappings } = require("../api")

// 🔧 Utility: Fetch and cache device-sensor mappings
let cachedMappings = null
const fetchDeviceSensorMappings = async (forceRefresh = false) => {
    if (!cachedMappings || forceRefresh) {
        console.log(forceRefresh ? "🔄 Fetching fresh device-sensor mappings..." : "📡 Caching device-sensor mappings...")
        cachedMappings = await getDeviceSensorMappings()
    } else {
        console.log("📡 Using cached device-sensor mappings.")
    }
    console.log("")
    return cachedMappings
}

module.exports = (program) => {
    // 🚀 Add a new device type
    program
        .command("add-device-type <type> <sensors>")
        .description("Adds a new device type (e.g., drone 'GPS, LiDAR, IMU')")
        .action(async (type, sensors) => {
            addDeviceType(type, sensors.split(",").map(s => s.trim()))
            console.log(`✅ Device type '${type}' added with sensors: ${sensors}`)
            console.log("")
        })

    // 🚀 Add a new sensor
    program
        .command("add-sensor <type> <unit>")
        .description("Adds a new sensor type (e.g., CO2 Sensor ppm)")
        .action(async (type, unit) => {
            await addSensorType(type, unit)
            console.log(`✅ Sensor '${type}' added with unit: ${unit}`)
            console.log("")
        })

    // 🚀 Get sensor mappings for a device
    program
        .command("get-device-mappings <deviceName>")
        .description("Retrieves all sensor mappings for a specific device")
        .action(async (deviceName) => {
            console.log(`🔍 Fetching sensor mappings for device: ${deviceName}`)

            const device = (await getDevices()).find(d => d.name === deviceName)
            if (!device) {
                console.log(`❌ Device "${deviceName}" not found.`)
                console.log("")
                return
            }

            const deviceMappings = (await fetchDeviceSensorMappings()).filter(m => m.device_id === device.id)
            if (!deviceMappings.length) {
                console.log(`ℹ️ No sensors mapped to "${deviceName}".`)
                console.log("")
                return
            }

            const sensors = await getSensors()

            console.log(`✅ Sensors mapped to ${device.name}:\n`)
            deviceMappings.forEach(({ sensor_id, id }) => {
                const sensor = sensors.find(s => s.id === sensor_id)
                const sensorName = sensor ? sensor.type : "Unknown Sensor"
                console.log(`Sensor: ${sensorName}, Mapping ID: ${id}`)
            })
            console.log("")
        })
}