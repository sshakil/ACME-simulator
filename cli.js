const { Command } = require("commander");
const {
    registerDevice, registerSensor, mapSensorToDevice, sendSensorReading,
    getDeviceSensorMappings, getDevices, getSensors
} = require("./api");
const { DEVICE_TYPES, addDeviceType, addSensorType, SIMULATION_INTERVAL_MS } = require("./config");
const { generateSensorReading } = require("./generator");

const program = new Command();

// 🚀 Add a new device type dynamically
program
    .command("add-device-type <type> <sensors>")
    .description("Adds a new device type (e.g., drone 'GPS, LiDAR, IMU')")
    .action(async (type, sensors) => {
        const sensorList = sensors.split(",").map(s => s.trim());
        addDeviceType(type, sensorList);
        console.log(`✅ Device type '${type}' added with sensors: ${sensorList.join(", ")}`);
    });

// 🚀 Add a new sensor dynamically
program
    .command("add-sensor <type> <unit>")
    .description("Adds a new sensor type (e.g., CO2 Sensor ppm)")
    .action(async (type, unit) => {
        await addSensorType(type, unit);
        console.log(`✅ Sensor '${type}' added with unit: ${unit}`);
    });

// 🚀 Register multiple devices dynamically
program
    .command("register-devices <devices>")
    .description("Registers multiple devices (e.g., train=2,truck=1,car=3)")
    .action(async (devices) => {
        const deviceCounts = devices.match(/(?:[^\s,"]+|"[^"]*")+/g).reduce((acc, item) => {
            const [type, count] = item.split("=");
            if (type && count) {
                acc[type.trim()] = parseInt(count, 10);
            }
            return acc;
        }, {});

        console.log("🚀 Registering devices and sensors...");

        for (const [type, count] of Object.entries(deviceCounts)) {
            if (!DEVICE_TYPES[type]) {
                console.warn(`⚠️ Unknown device type '${type}'. Use 'add-device-type' first.`);
                continue;
            }

            for (let i = 1; i <= count; i++) {
                const deviceName = `${type} #${i}`;
                const device = await registerDevice(deviceName, type);

                if (device) {
                    console.log(`✅ Registered: ${deviceName} (ID: ${device.id})`);

                    for (const sensorType of DEVICE_TYPES[type]) {
                        const sensor = await registerSensor(sensorType);
                        if (sensor) {
                            console.log(`🔧 Sensor registered: ${sensorType} (ID: ${sensor.id})`);
                            await mapSensorToDevice(device.id, sensor.id);
                        }
                    }
                }
            }
        }

        console.log("🎉 All devices registered successfully!");
    });

// 🚀 Register a single device interactively
program
    .command("register-device <name> <type>")
    .option("--no-sensors", "Do not auto-map sensors to the device")
    .description("Registers a single device")
    .action(async (name, type, options) => {
        console.log(`🔄 Registering device: ${name} (Type: ${type})`);

        if (!DEVICE_TYPES[type]) {
            console.warn(`⚠️ Unknown device type '${type}'. Use 'add-device-type' first.`);
            return;
        }

        const device = await registerDevice(name, type);
        if (device) {
            console.log(`✅ Registered: ${name} (ID: ${device.id})`);

            if (!options.noSensors) {
                for (const sensorType of DEVICE_TYPES[type]) {
                    const sensor = await registerSensor(sensorType);
                    if (sensor) {
                        console.log(`🔧 Sensor registered: ${sensorType} (ID: ${sensor.id})`);
                        await mapSensorToDevice(device.id, sensor.id);
                    }
                }
            }
        }
    });

// 🚀 Ensure all required sensors are registered
program
    .command("ensure-sensors")
    .description("Registers any missing sensors required for the configured devices")
    .action(async () => {
        console.log("🔄 Ensuring all required sensors are registered...");

        const existingSensors = await getSensors();
        const existingSensorTypes = new Set(existingSensors.map(s => s.type));

        let registeredCount = 0;

        for (const sensors of Object.values(DEVICE_TYPES)) {
            for (const sensorType of sensors) {
                if (!existingSensorTypes.has(sensorType)) {
                    const sensor = await registerSensor(sensorType);
                    if (sensor) {
                        console.log(`✅ Registered new sensor: ${sensor.type}`);
                        registeredCount++;
                    }
                }
            }
        }

        if (registeredCount === 0) {
            console.log("✅ All required sensors are already registered.");
        }
    });

// 🚀 Manually map specific sensors to a device
program
    .command("map-sensors <deviceName> <sensorList>")
    .description("Manually maps specific sensors to a device")
    .action(async (deviceName, sensorList) => {
        console.log(`🔄 Mapping sensors to device: ${deviceName}`);

        const devices = await getDevices();
        const sensors = await getSensors();
        const mappings = await getDeviceSensorMappings();

        const device = devices.find(d => d.name === deviceName);
        if (!device) {
            console.log(`❌ Device "${deviceName}" not found.`);
            return;
        }

        const sensorNames = sensorList.split(",").map(s => s.trim());
        let mappedCount = 0;

        for (const sensorName of sensorNames) {
            const sensor = sensors.find(s => s.type === sensorName);
            if (!sensor) {
                console.log(`⚠️ Sensor "${sensorName}" is not registered. Use 'add-sensor' first.`);
                continue;
            }

            const isMapped = mappings.some(m => m.device_id === device.id && m.sensor_id === sensor.id);
            if (!isMapped) {
                await mapSensorToDevice(device.id, sensor.id);
                console.log(`✅ Mapped ${sensor.type} to ${device.name}`);
                mappedCount++;
            }
        }

        if (mappedCount === 0) {
            console.log(`✅ No new mappings were added for "${deviceName}".`);
        }
    });

// 🚀 Get existing sensor mappings for a device
program
    .command("get-device-mappings <deviceName>")
    .description("Retrieves all sensor mappings for a specific device")
    .action(async (deviceName) => {
        console.log(`🔍 Fetching sensor mappings for device: ${deviceName}`);

        const devices = await getDevices();
        const mappings = await getDeviceSensorMappings();
        const sensors = await getSensors();

        const device = devices.find(d => d.name === deviceName);
        if (!device) {
            console.log(`❌ Device "${deviceName}" not found.`);
            return;
        }

        const deviceMappings = mappings.filter(m => m.device_id === device.id);
        if (deviceMappings.length === 0) {
            console.log(`ℹ️ No sensors mapped to "${deviceName}".`);
            return;
        }

        console.log(`✅ Sensors mapped to ${device.name}:`);
        deviceMappings.forEach(mapping => {
            const sensor = sensors.find(s => s.id === mapping.sensor_id);
            console.log(`   - ${sensor?.type || "Unknown Sensor"} (ID: ${mapping.sensor_id})`);
        });
    });

// 🚀 Simulate sensor readings continuously at configured interval
program
    .command("simulate-readings")
    .description("Generates and sends sensor readings at configured intervals")
    .action(async () => {
        console.log(`📡 Starting sensor data simulation every ${SIMULATION_INTERVAL_MS} ms...`);

        async function sendReadings() {
            console.log("📡 Fetching device-sensor mappings...");
            const mappings = await getDeviceSensorMappings();
            const now = new Date();

            if (mappings.length === 0) {
                console.warn("⚠️ No device-sensor mappings found. Ensure devices and sensors are registered.");
                return;
            }

            let readingCount = 0;

            for (const mapping of mappings) {
                const value = generateSensorReading(mapping.sensor_id);
                await sendSensorReading(mapping.id, now, value);
                console.log(`📊 Sent reading: Device-Sensor ${mapping.id} => Value: ${value}`);
                readingCount++;
            }

            console.log(`✅ Sent ${readingCount} sensor readings at ${now.toISOString()}`);
        }

        sendReadings(); // Run immediately
        setInterval(sendReadings, SIMULATION_INTERVAL_MS);
    });

program.parse(process.argv);