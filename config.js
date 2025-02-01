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
    }
};