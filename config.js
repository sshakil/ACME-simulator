require("dotenv").config();

module.exports = {
    API_BASE_URL: process.env.API_BASE_URL || "http://localhost:4000/api",

    SIMULATION_INTERVAL_MS: parseInt(process.env.SIMULATION_INTERVAL_MS) || 5000,

    DEVICE_TYPES: {
        "car": ["Camera", "LiDAR", "Radar", "GPS", "IMU"],
        "train": ["Wheel Speed", "Vibration", "GPS", "Temperature"],
        "aircraft": ["Air Data (Pitot Tube)", "Gyroscopes", "Radar Altimeter", "GPS"],
        "warehouse-robot": ["Proximity", "IMU", "RFID", "Camera"],
        "patient-monitor": ["ECG", "SpO2", "Blood Pressure", "Temperature", "Motion Sensors"],
        "truck": [
            "Fuel Level", "Engine Temperature", "Tire Pressure", "Speed", "Oil Pressure",
            "Cargo Weight", "Cargo Temperature", "Cargo Humidity",
            "Door Sensor", "Gas Detection",
            "Forward Collision Radar", "Rear Collision Radar", "Blind Spot Detection",
            "Lane Departure Warning", "AEB Radar", "GPS"
        ]
    },

    SENSOR_UNITS: {
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
};