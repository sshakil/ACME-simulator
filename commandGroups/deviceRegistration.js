const { registerDevice, registerAndMapDeviceSensors} = require("../api")
const { DEVICE_TYPES, SENSOR_UNITS} = require("../config")
const crypto = require("crypto")

// 🔧 Utility: Register and map sensors for a device
const registerAndMapSensors = async (deviceId, deviceType) => {
    if (!DEVICE_TYPES[deviceType]) {
        console.warn(`⚠️ Unknown device type '${deviceType}'.`)
        return
    }

    const sensors = DEVICE_TYPES[deviceType].map(type => ({
        type,
        unit: SENSOR_UNITS[type] || "unknown"
    }))

    console.log(`📡 Registering and mapping ${sensors.length} sensors for device ${deviceId}...`)
    await registerAndMapDeviceSensors(deviceId, sensors)
}


module.exports = (program) => {
    // 🚀 Register multiple devices
    program
        .command("register-devices <devices>")
        .description("Registers multiple devices (e.g., train=2,truck=1,car=3)")
        .action(async (devices) => {
            console.log("🚀 Registering devices and sensors...")

            const deviceCounts = devices.match(/(?:[^\s,"]+|"[^"]*")+/g).reduce((acc, item) => {
                const [deviceType, count] = item.split("=")
                if (deviceType && count) acc[deviceType.trim()] = parseInt(count, 10)
                return acc
            }, {})

            for (const [deviceType, count] of Object.entries(deviceCounts)) {
                if (!DEVICE_TYPES[deviceType]) {
                    console.warn(`⚠️ Unknown device type '${deviceType}'. Use 'add-device-type' first.`)
                    console.log("")
                    continue
                }

                for (let i = 1; i <= count; i++) {
                    const uid = crypto.randomUUID()
                    const device = await registerDevice(`${deviceType} #${uid}`, deviceType)
                    if (device) {
                        console.log(`✅ Registered: ${device.name} (ID: ${device.id})`)
                        await registerAndMapSensors(device.id, deviceType)
                    }
                }
            }
            console.log("🎉 All devices registered successfully")
            console.log("")
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
                console.log("")
                return
            }

            const device = await registerDevice(name, type)
            if (device) {
                console.log(`✅ Registered: ${name} (ID: ${device.id})`)
                if (!options.noSensors) await registerAndMapSensors(device.id, type)
            }
            console.log("")
        })
}