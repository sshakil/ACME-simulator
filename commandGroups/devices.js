const { registerDevice, deleteDevice, registerAndMapDeviceSensors } = require("../api")
const { DEVICE_TYPES, SENSOR_UNITS } = require("../config")
const { log } = require("../utils")
const crypto = require("crypto")

// 🔧 Utility: Register and map sensors for a device
const registerAndMapSensors = async (deviceId, deviceType) => {
    if (!DEVICE_TYPES[deviceType]) {
        log(`⚠️ Unknown device type '${deviceType}'.`)
        return
    }

    if (!deviceId) {
        log(`⚠️ deviceId is undefined`)
        return
    }

    const sensors = DEVICE_TYPES[deviceType].map(type => ({
        type,
        unit: SENSOR_UNITS[type] || "unknown"
    }))

    log(`📡 Registering and mapping ${sensors.length} sensors for device ${deviceId}...`)
    await registerAndMapDeviceSensors(deviceId, sensors)
}

module.exports = (program) => {
    // 🚀 Register multiple devices
    program
        .command("register-devices <devices>")
        .description("Registers multiple devices (e.g., train=2,truck=1,car=3)")
        .action(async (devices) => {
            log("🚀 Registering devices and sensors...")

            const deviceCounts = devices.match(/(?:[^\s,"]+|"[^"]*")+/g).reduce((acc, item) => {
                const [deviceType, count] = item.split("=")
                if (deviceType && count) acc[deviceType.trim()] = parseInt(count, 10)
                return acc
            }, {})

            for (const [deviceType, count] of Object.entries(deviceCounts)) {
                if (!DEVICE_TYPES[deviceType]) {
                    log(`⚠️ Unknown device type '${deviceType}'. Use 'add-device-type' first.`)
                    log("")
                    continue
                }

                for (let i = 1; i <= count; i++) {
                    const uid = crypto.randomUUID()
                    const device = await registerDevice(`${deviceType} #${uid}`, deviceType)
                    if (device) {
                        log(`✅ Registered: ${device.type} (ID: ${device.id})`)
                        log(device)
                        await registerAndMapSensors(device.id, deviceType)
                    }
                }
            }

            log("🎉 All devices registered successfully")
            log("")
        })

    // 🚀 Register a device
    program
        .command("register-device <name> <type>")
        .option("--no-sensors", "Do not auto-map sensors to the device")
        .description("Registers a single device")
        .action(async (name, type, options) => {
            log(`🔄 Registering device: ${name} (Type: ${type})`)

            if (!DEVICE_TYPES[type]) {
                log(`⚠️ Unknown device type '${type}'. Use 'add-device-type' first.`)
                log("")
                return
            }

            const device = await registerDevice(name, type)
            if (device) {
                log(`✅ Registered: ${name} (ID: ${device.id})`)
                log(`device: ${device}`)
                if (!options.noSensors) await registerAndMapSensors(device.id, type)
            }
            log("")
        })

    // 🚀 Delete a device
    program
        .command("delete-device <id>")
        .description("Deletes a device")
        .action(async (id) => {
            try {
                await deleteDevice(id)
                log(`✅ Successfully deleted device with id: ${id}`)
                process.exit(0)
            } catch (error) {
                log("❌", error.message, error.response?.data || "")
                process.exit(1)
            }
        })
}