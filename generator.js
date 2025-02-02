const { faker } = require('@faker-js/faker');
const turf = require('@turf/turf');

// 📌 Road & Highway GPS Routes (Simplified, Expand as Needed)
const cityRoutes = {
    "Toronto": [
        [-79.3832, 43.6532], [-79.3871, 43.6629], [-79.3944, 43.6702], // Downtown to midtown
        [-79.4282, 43.6928], [-79.4502, 43.7076], [-79.4651, 43.7192]  // Towards North York
    ],
    "Ottawa": [
        [-75.6972, 45.4215], [-75.6910, 45.4296], [-75.6802, 45.4415], // Parliament to downtown
        [-75.6732, 45.4487], [-75.6598, 45.4602], [-75.6453, 45.4701]  // Towards suburbs
    ],
    "Calgary": [
        [-114.0719, 51.0447], [-114.0785, 51.0511], [-114.0857, 51.0592], // Downtown to NW
        [-114.1038, 51.0723], [-114.1163, 51.0817], [-114.1294, 51.0895]  // Towards outer Calgary
    ],
    "Edmonton": [
        [-113.4938, 53.5461], [-113.5015, 53.5519], [-113.5098, 53.5587], // Downtown to West
        [-113.5274, 53.5702], [-113.5437, 53.5786], [-113.5611, 53.5872]  // Towards suburbs
    ],
    "Montreal": [
        [-73.5673, 45.5017], [-73.5619, 45.5087], [-73.5548, 45.5162], // Old Port to Plateau
        [-73.5419, 45.5271], [-73.5301, 45.5385], [-73.5182, 45.5507]  // Towards Laval
    ],
    "Quebec": [
        [-71.2082, 46.8139], [-71.2050, 46.8202], [-71.2015, 46.8271], // Old Quebec to Montcalm
        [-71.1923, 46.8385], [-71.1817, 46.8502], [-71.1701, 46.8623]  // Towards suburbs
    ],
    "Winnipeg": [
        [-97.1384, 49.8951], [-97.1445, 49.9002], [-97.1523, 49.9081], // Downtown to North
        [-97.1627, 49.9183], [-97.1731, 49.9267], [-97.1836, 49.9342]  // Towards suburbs
    ],
    "Regina": [
        [-104.6189, 50.4452], [-104.6124, 50.4512], [-104.6067, 50.4578], // Downtown to East
        [-104.5979, 50.4661], [-104.5893, 50.4729], [-104.5787, 50.4813]  // Towards suburbs
    ],
    "Vancouver": [
        [-123.1216, 49.2827], [-123.1138, 49.2901], [-123.1059, 49.2976], // Downtown to Burnaby
        [-123.0923, 49.3075], [-123.0784, 49.3178], [-123.0651, 49.3284]  // Towards Metrotown
    ]
};

// 🚗 Track previous GPS points per city
const lastPosition = {};

// 📡 Generate realistic GPS sensor readings
function generateGPS(city) {
    if (!cityRoutes[city]) city = "Toronto"; // Default if invalid

    // Get last position or start at the first point
    let index = lastPosition[city] || 0;
    let route = cityRoutes[city];

    let point = route[index];
    let nextIndex = (index + 1) % route.length; // Move to next in cycle

    lastPosition[city] = nextIndex; // Save for continuity

    return { lat: point[1], lon: point[0] }; // Return formatted GPS
}

// 📌 Sensor Type to Unit Mapping
const SENSOR_UNITS = {
    "AEB Radar": "m",
    "Air Data (Pitot Tube)": "Pa",
    "Blind Spot Detection": "boolean",
    "Blood Pressure": "mmHg",
    "Camera": "pixels",
    "Cargo Humidity": "%",
    "Cargo Temperature": "°C",
    "Cargo Weight": "kg",
    "Door Sensor": "boolean",
    "ECG": "mV",
    "Engine Temperature": "°C",
    "Fuel Level": "L",
    "Gas Detection": "ppm",
    "GPS": "degrees",
    "Gyroscope": "°/s",
    "IMU": "m/s²",
    "Lane Departure Warning": "cm",
    "LiDAR": "m",
    "Oil Pressure": "psi",
    "Proximity": "cm",
    "Radar": "m",
    "Rear Collision Radar": "m",
    "RFID": "tag_id",
    "SpO2": "%",
    "Speed": "km/h",
    "Tire Pressure": "psi",
    "Vibration": "g",
    "Wheel Speed": "rpm",
    "X-ray Detectors": "grayscale"
}

// 📊 Generate sensor readings based on type
function generateSensorReading(sensorType) {
    switch (sensorType) {
        case "Camera": return faker.datatype.boolean();
        case "LiDAR": return faker.number.int({ min: 0, max: 100 });
        case "Radar": return faker.number.int({ min: 0, max: 150 });
        case "GPS": {
            const cities = Object.keys(cityRoutes);
            const randomCity = cities[Math.floor(Math.random() * cities.length)];
            return generateGPS(randomCity);
        }
        case "IMU": return faker.number.float({ min: -10, max: 10 });
        case "Wheel Speed": return faker.number.int({ min: 0, max: 300 });
        case "Temperature": return faker.number.int({ min: -30, max: 50 });
        case "Blood Pressure": return faker.number.int({ min: 80, max: 180 });
        case "SpO2": return faker.number.int({ min: 90, max: 100 });
        case "Cargo Weight": return faker.number.int({ min: 100, max: 2000 });
        case "Tire Pressure": return faker.number.int({ min: 20, max: 40 });
        case "Speed": return faker.number.int({ min: 0, max: 120 });
        case "Oil Pressure": return faker.number.int({ min: 20, max: 100 });
        default: return faker.number.int({ min: 0, max: 100 });
    }
}

module.exports = { generateSensorReading };