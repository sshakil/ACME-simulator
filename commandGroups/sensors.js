const { updateSensor } = require("../api")
const { log } = require("../utils")

module.exports = (program) => {
    program
        .command("list-sensors")
        .description("Get list of sensors")
        .action(async (options) => {

            await getSensors()
            log("")
        })

    program
        .command("update-sensor")
        .requiredOption("-i, --sensor-id <id>", "Sensor with ID to update")
        .option("-t, --type <newType>", "New sensor type")
        .option("-u, --unit <newUnit>", "New sensor unit")
        .description("Update the type and/or unit of a given sensor")
        .action(async (options) => {
            const { sensorId, type, unit } = options

            if (!type && !unit) {
                log("❌ Error: At least one of --type or --unit is required.")
                return
            }

            const updates = [type && `type: ${type}`, unit && `unit: ${unit}`]
                .filter(Boolean)
                .join(", ")

            log(`✅ Sensor ${sensorId} updated with ${updates}`)
            log(`🔄 Updating sensor with ID: ${sensorId} with: ${updates}`)

            await updateSensor(sensorId, type, unit)
            log("")
        })
}