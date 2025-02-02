const {Command} = require("commander")
const {
    registerDevice, registerSensor, mapSensorToDevice, sendSensorReading,
    getDeviceSensorMappings, getDevices, getSensors,
    getDeviceSensorMappingsForDevices, getDeviceSensorMappingsForSensors
} = require("./api")
const {DEVICE_TYPES, addDeviceType, addSensorType, SIMULATION_INTERVAL_MS} = require("./config")
const {generateSensorReading} = require("./generator")

const program = new Command()

let cachedMappings = null // Cache for device-sensor mappings

// 🔧 Utility: Fetch and cache device-sensor mappings
const fetchDeviceSensorMappings = async (forceRefresh = false) => {
    if (!cachedMappings || forceRefresh) {
        console.log(forceRefresh ? "🔄 Fetching fresh device-sensor mappings..." : "📡 Caching device-sensor mappings...")
        cachedMappings = await getDeviceSensorMappings()
    } else {
        console.log("📡 Using cached device-sensor mappings.")
    }
    return cachedMappings
}

// 🔧 Utility: Register sensors for a device
const registerAndMapSensors = async (deviceId, type) => {
    for (const sensorType of DEVICE_TYPES[type]) {
        const sensor = await registerSensor(sensorType)
        if (sensor) {
            console.log(`🔧 Sensor registered: ${sensorType} (ID: ${sensor.id})`)
            await mapSensorToDevice(deviceId, sensor.id)
        }
    }
}

// 🚀 Add a new device type
program
    .command("add-device-type <type> <sensors>")
    .description("Adds a new device type (e.g., drone 'GPS, LiDAR, IMU')")
    .action(async (type, sensors) => {
        addDeviceType(type, sensors.split(",").map(s => s.trim()))
        console.log(`✅ Device type '${type}' added with sensors: ${sensors}`)
    })

// 🚀 Add a new sensor
program
    .command("add-sensor <type> <unit>")
    .description("Adds a new sensor type (e.g., CO2 Sensor ppm)")
    .action(async (type, unit) => {
        await addSensorType(type, unit)
        console.log(`✅ Sensor '${type}' added with unit: ${unit}`)
    })

// 🚀 Register multiple devices
program
    .command("register-devices <devices>")
    .description("Registers multiple devices (e.g., train=2,truck=1,car=3)")
    .action(async (devices) => {
        console.log("🚀 Registering devices and sensors...")

        const deviceCounts = devices.match(/(?:[^\s,"]+|"[^"]*")+/g).reduce((acc, item) => {
            const [type, count] = item.split("=")
            if (type && count) acc[type.trim()] = parseInt(count, 10)
            return acc
        }, {})

        for (const [type, count] of Object.entries(deviceCounts)) {
            if (!DEVICE_TYPES[type]) {
                console.warn(`⚠️ Unknown device type '${type}'. Use 'add-device-type' first.`)
                continue
            }

            for (let i = 1; i <= count; i++) {
                const device = await registerDevice(`${type} #${i}`, type)
                if (device) {
                    console.log(`✅ Registered: ${device.name} (ID: ${device.id})`)
                    await registerAndMapSensors(device.id, type)
                }
            }
        }
        console.log("🎉 All devices registered successfully!")
    })

// 🚀 Register a single device
program
    .command("register-device <name> <type>")
    .option("--no-sensors", "Do not auto-map sensors to the device")
    .description("Registers a single device")
    .action(async (name, type, options) => {
        console.log(`🔄 Registering device: ${name} (Type: ${type})`)

        if (!DEVICE_TYPES[type]) {
            console.warn(`⚠️ Unknown device type '${type}'. Use 'add-device-type' first.`)
            return
        }

        const device = await registerDevice(name, type)
        if (device) {
            console.log(`✅ Registered: ${name} (ID: ${device.id})`)
            if (!options.noSensors) await registerAndMapSensors(device.id, type)
        }
    })

// 🚀 Get sensor mappings for a device
program
    .command("get-device-mappings <deviceName>")
    .description("Retrieves all sensor mappings for a specific device")
    .action(async (deviceName) => {
        console.log(`🔍 Fetching sensor mappings for device: ${deviceName}`)

        const device = (await getDevices()).find(d => d.name === deviceName)
        if (!device) return console.log(`❌ Device "${deviceName}" not found.`)

        const deviceMappings = (await fetchDeviceSensorMappings()).filter(m => m.device_id === device.id)
        if (!deviceMappings.length) return console.log(`ℹ️ No sensors mapped to "${deviceName}".`)

        const sensors = await getSensors()

        // Determine column widths dynamically for better alignment
        const maxNameLength = Math.max(...deviceMappings.map(({sensor_id}) => {
            const sensor = sensors.find(s => s.id === sensor_id)
            return sensor ? sensor.type.length : "Unknown Sensor".length
        }), 4) // Minimum width fallback

        const maxIdLength = Math.max(...deviceMappings.map(({id}) => String(id).length), 17) // "device_sensor_id".length

        console.log(`✅ Sensors mapped to ${device.name}:\n`)
        console.log(`${"Name".padEnd(maxNameLength)} | ${"device_sensor_id".padEnd(maxIdLength)}`)
        console.log(`${"-".repeat(maxNameLength)} | ${"-".repeat(maxIdLength)}`)

        deviceMappings.forEach(({sensor_id, id}) => {
            const sensor = sensors.find(s => s.id === sensor_id)
            const sensorName = sensor ? sensor.type : "Unknown Sensor"
            console.log(`${sensorName.padEnd(maxNameLength)} | ${String(id).padEnd(maxIdLength)}`)
        })
    })

// 🚀 Simulate sensor readings with optional cache
const simulateSensorReadings = async (fetchMappingsFn, identifier, useCache = true) => {
    console.log(`📡 Starting simulation for ${identifier} every ${SIMULATION_INTERVAL_MS} ms...`)

    async function sendReadings() {
        console.log(`📡 Fetching device-sensor mappings for ${identifier}...`)
        const mappings = await fetchMappingsFn(!useCache)
        if (!mappings.length) {
            console.warn(`⚠️ No mappings found for ${identifier}.`)
            return
        }

        for (const {id, sensor_id} of mappings) {
            const value = generateSensorReading(sensor_id)
            await sendSensorReading(id, new Date(), value)
        }
    }

    await sendReadings()
    setInterval(sendReadings, SIMULATION_INTERVAL_MS)
}

// 🚀 Simulate readings (all devices, specified devices, specified sensors)
program
    .command("simulate-readings-for-all-devices")
    .option("--no-mapping-cache", "Fetch fresh device-sensor mappings before each reading")
    .description("Simulate readings for all devices")
    .action((options) => simulateSensorReadings(fetchDeviceSensorMappings, "all devices", !options.noMappingCache))

program
    .command("simulate-readings-for-specified-devices <deviceIds>")
    .option("--no-mapping-cache", "Fetch fresh device-sensor mappings before each reading")
    .description("Simulate readings for specific devices")
    .action((deviceIds, options) =>
        simulateSensorReadings(
            () => getDeviceSensorMappingsForDevices(deviceIds.split(",").map(Number)),
            "specific devices",
            !options.noMappingCache
        )
    )

program
    .command("simulate-readings-for-specified-sensors <deviceSensorIds>")
    .option("--no-mapping-cache", "Fetch fresh device-sensor mappings before each reading")
    .description("Simulate readings for specific device_sensor_ids")
    .action((deviceSensorIds, options) =>
        simulateSensorReadings(
            () => getDeviceSensorMappingsForSensors(deviceSensorIds.split(",").map(Number)),
            "specific device_sensor_ids",
            !options.noMappingCache
        )
    )

program.parse(process.argv)