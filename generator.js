const { faker } = require('@faker-js/faker');
const turf = require('@turf/turf');
const { SENSOR_UNITS } = require('./config'); // DRY up sensor units from config

// 📌 Road & Highway GPS Routes (Simplified, Expand as Needed)
const cityRoutes = {
    "Toronto": [
        [-79.3832, 43.6532], // Downtown Toronto
        [-79.3871, 43.6629], // Queen's Park
        [-79.3944, 43.6702], // Annex area
        [-79.4282, 43.6928], // Towards Yorkdale
        [-79.4502, 43.7076], // Further north in Toronto
        [-79.4651, 43.7192]  // Approaching North York
    ],
    "Ottawa": [
        [-75.6972, 45.4215], // Parliament Hill
        [-75.6910, 45.4296], // ByWard Market
        [-75.6802, 45.4415], // Rideau Canal area
        [-75.6732, 45.4487], // Sandy Hill
        [-75.6598, 45.4602], // Near Vanier
        [-75.6453, 45.4701]  // Approaching suburbs
    ],
    "Calgary": [
        [-114.0719, 51.0447], // Downtown Calgary
        [-114.0785, 51.0511], // Beltline
        [-114.0857, 51.0592], // Sunnyside
        [-114.1038, 51.0723], // Towards Crowchild Trail
        [-114.1163, 51.0817], // Near Northland Mall
        [-114.1294, 51.0895]  // Outer Calgary
    ],
    "Edmonton": [
        [-113.4938, 53.5461], // Downtown Edmonton
        [-113.5015, 53.5519], // Rogers Place
        [-113.5098, 53.5587], // Near Westmount
        [-113.5274, 53.5702], // Approaching Groat Road
        [-113.5437, 53.5786], // Near West Edmonton
        [-113.5611, 53.5872]  // Moving towards suburbs
    ],
    "Montreal": [
        [-73.5673, 45.5017], // Old Montreal
        [-73.5619, 45.5087], // Place des Arts
        [-73.5548, 45.5162], // Plateau Mont-Royal
        [-73.5419, 45.5271], // Near Jean-Talon Market
        [-73.5301, 45.5385], // Towards north Montreal
        [-73.5182, 45.5507]  // Approaching Laval
    ],
    "Quebec": [
        [-71.2082, 46.8139], // Old Quebec
        [-71.2050, 46.8202], // Montcalm area
        [-71.2015, 46.8271], // Near Grande-Allée
        [-71.1923, 46.8385], // Towards Sainte-Foy
        [-71.1817, 46.8502], // Near Laval University
        [-71.1701, 46.8623]  // Further suburbs
    ],
    "Winnipeg": [
        [-97.1384, 49.8951], // Downtown Winnipeg
        [-97.1445, 49.9002], // Exchange District
        [-97.1523, 49.9081], // Near Health Sciences Centre
        [-97.1627, 49.9183], // Approaching Polo Park
        [-97.1731, 49.9267], // Near St. James
        [-97.1836, 49.9342]  // Outer Winnipeg suburbs
    ],
    "Regina": [
        [-104.6189, 50.4452], // Downtown Regina
        [-104.6124, 50.4512], // Near Wascana Park
        [-104.6067, 50.4578], // Cathedral area
        [-104.5979, 50.4661], // Towards Trans-Canada Hwy
        [-104.5893, 50.4729], // Near East Regina
        [-104.5787, 50.4813]  // Outer Regina suburbs
    ],
    "Vancouver": [
        [-123.1216, 49.2827], // Downtown Vancouver
        [-123.1138, 49.2901], // West End
        [-123.1059, 49.2976], // Near Science World
        [-123.0923, 49.3075], // Approaching Commercial Drive
        [-123.0784, 49.3178], // Towards Burnaby
        [-123.0651, 49.3284]  // Metrotown area
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

// 📊 Generate sensor readings based on type with realistic values
function generateSensorReading(sensorType) {
    switch (sensorType) {
        case "Camera": return faker.datatype.boolean();
        case "LiDAR": return faker.number.float({ min: 0.5, max: 30, fractionDigits: 1 }); // Range: 0.5 - 30 meters
        case "Radar": return faker.number.float({ min: 1, max: 200, fractionDigits: 1 }); // Range: 1 - 200 meters
        case "GPS": {
            const cities = Object.keys(cityRoutes);
            const randomCity = cities[Math.floor(Math.random() * cities.length)];
            return generateGPS(randomCity);
        }
        case "IMU": return faker.number.float({ min: -5, max: 5, fractionDigits: 1 }); // Range: -5 to 5 m/s²
        case "Wheel Speed": return faker.number.int({ min: 0, max: 250 }); // Range: 0 - 250 rpm
        case "Temperature": return faker.number.float({ min: -20, max: 50, fractionDigits: 1 }); // Range: -20 to 50°C
        case "Blood Pressure": return faker.number.int({ min: 80, max: 180 }); // Systolic pressure range
        case "SpO2": return faker.number.int({ min: 90, max: 100 }); // Range: 90-100%
        case "Cargo Weight": return faker.number.int({ min: 100, max: 5000 }); // Range: 100 - 5000 kg
        case "Tire Pressure": return faker.number.float({ min: 25, max: 45, fractionDigits: 1 }); // Range: 25 - 45 psi
        case "Speed": return faker.number.float({ min: 0, max: 120, fractionDigits: 1 }); // Range: 0 - 120 km/h
        case "Oil Pressure": return faker.number.float({ min: 20, max: 80, fractionDigits: 1 }); // Range: 20 - 80 psi
        default: return faker.number.float({ min: 1, max: 100, fractionDigits: 1 });
    }
}

module.exports = { generateSensorReading };