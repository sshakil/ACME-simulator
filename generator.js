const { faker } = require('@faker-js/faker')
const turf = require('@turf/turf')

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
}

// 🚗 Track previous GPS points per city
const lastPosition = {}

// 📡 Generate realistic GPS sensor readings
function generateGPS(city) {
    if (!cityRoutes[city]) city = "Toronto" // Default if invalid

    // Get last position or start at the first point
    let index = lastPosition[city] || 0
    let route = cityRoutes[city]

    let point = route[index]
    let nextIndex = (index + 1) % route.length // Move to next in cycle

    lastPosition[city] = nextIndex // Save for continuity

    return { lat: point[1], lon: point[0] } // Return formatted GPS
}

// 📊 Generate sensor readings based on type with realistic values
function generateSensorReading(sensorType) {
    switch (sensorType) {
        case "Camera": return faker.datatype.boolean()
        case "LiDAR": return faker.number.float({ min: 0.5, max: 30, fractionDigits: 1 }) // Range: 0.5 - 30 meters
        case "Radar": return faker.number.float({ min: 1, max: 200, fractionDigits: 1 }) // Range: 1 - 200 meters
        case "GPS": {
            const cities = Object.keys(cityRoutes)
            const randomCity = cities[Math.floor(Math.random() * cities.length)]
            return generateGPS(randomCity)
        }
        case "IMU": return faker.number.float({ min: -5, max: 5, fractionDigits: 1 }) // Range: -5 to 5 m/s²
        case "Wheel Speed": return faker.number.int({ min: 0, max: 250 }) // Range: 0 - 250 rpm
        case "Temperature": return faker.number.float({ min: -20, max: 50, fractionDigits: 1 }) // Range: -20 to 50°C
        case "Blood Pressure": return faker.number.int({ min: 80, max: 180 }) // Systolic pressure range
        case "SpO2": return faker.number.int({ min: 90, max: 100 }) // Range: 90-100%
        case "Cargo Weight": return faker.number.int({ min: 100, max: 5000 }) // Range: 100 - 5000 kg
        case "Tire Pressure": return faker.number.float({ min: 25, max: 45, fractionDigits: 1 }) // Range: 25 - 45 psi
        case "Speed": return faker.number.float({ min: 0, max: 120, fractionDigits: 1 }) // Range: 0 - 120 km/h
        case "Oil Pressure": return faker.number.float({ min: 20, max: 80, fractionDigits: 1 }) // Range: 20 - 80 psi
        default: return faker.number.float({ min: 1, max: 100, fractionDigits: 1 })
    }
}

module.exports = { generateSensorReading }