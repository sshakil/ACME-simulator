const { updateSensor } = require("../api")
const { log } = require("../utils")

module.exports = (program) => {
    program
        .command("update-sensor")
        .requiredOption("-i, --sensor-id <id>", "Sensor with ID to update")
        .option("-t, --type <newType>", "New sensor type")
        .option("-u, --unit <newUnit>", "New sensor unit")
        .description("Update the type and/or unit of a given sensor. E.g.: `node cli.js update-sensor -i 1 -u \"px\"`")
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