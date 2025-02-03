const axios = require("axios")
require("dotenv").config()
const { API_BASE_URL, SENSOR_UNITS } = require("./config")

/** 🚀 Fetch all registered devices */
async function getDevices() {
    try {
        const response = await axios.get(`${API_BASE_URL}/devices`)
        return response.data
    } catch (error) {
        console.error("❌ Failed to fetch devices:", error.response?.data || error.message)
        return []
    }
}

/** 🚀 Fetch all registered sensors */
async function getSensors() {
    try {
        const response = await axios.get(`${API_BASE_URL}/sensors`)
        return response.data
    } catch (error) {
        console.error("❌ Failed to fetch sensors:", error.response?.data || error.message)
        return []
    }
}

/** 🚀 Fetch device-sensor mappings for a specific device */
async function getDeviceSensorMappingsForDevice(deviceId, forceRefresh = false) {
    try {
        const response = await axios.get(`${API_BASE_URL}/device-sensors/${deviceId}`)
        return response.data
    } catch (error) {
        console.error(`❌ Failed to fetch mappings for device ${deviceId}:`, error.response?.data || error.message)
        return []
    }
}

/** 🚀 Fetch device-sensor mappings for specific sensors */
async function getDeviceSensorMappingsForSensors(deviceSensorIds, forceRefresh = false) {
    try {
        const response = await axios.get(`${API_BASE_URL}/device-sensors`)
        return response.data.filter(m => deviceSensorIds.includes(m.id))
    } catch (error) {
        console.error("❌ Failed to fetch mappings for specific sensors:", error.response?.data || error.message)
        return []
    }
}

/** 🚀 Send a batch of sensor readings for a device */
async function sendSensorReadingsForDevice(deviceId, readings, noValidation = false, noResponseBody = false) {
    try {
        const response = await axios.post(`${API_BASE_URL}/sensor-readings/${deviceId}`, {
            readings,
            no_validation: noValidation,
            no_response_body: noResponseBody
        })

        if (!noResponseBody) {
            console.log(`📊 Sent readings for device ${deviceId}:`, response.data)
        }
    } catch (error) {
        console.error(`❌ Failed to send sensor readings for device ${deviceId}:`, error.response?.data || error.message)
    }
}

/** 🚀 Send a simulated sensor reading */
async function sendSensorReading(deviceSensorId, time, value) {
    try {
        const microseconds = Math.floor(Math.random() * 1000)
        const adjustedTime = new Date(time.getTime() + microseconds / 1000)

        await axios.post(`${API_BASE_URL}/sensor-readings`, {
            device_sensor_id: deviceSensorId,
            time: adjustedTime.toISOString(),
            value
        })

        console.log(`📊 Sent reading: Device-Sensor ${deviceSensorId} => Value: ${value} at ${adjustedTime.toISOString()}`)
    } catch (error) {
        console.error(`❌ Failed to send sensor reading:`, error.response?.data || error.message)
    }
}

/** 🚀 Register a device */
async function registerDevice(name, type) {
    try {
        const response = await axios.post(`${API_BASE_URL}/devices`, { name, type })
        return response.data
    } catch (error) {
        console.error(`❌ Failed to register device (${name}):`, error.response?.data || error.message)
        return null
    }
}

/** 🚀 Register a sensor */
async function registerSensor(type) {
    const unit = SENSOR_UNITS[type] || "unknown"

    try {
        const response = await axios.post(`${API_BASE_URL}/sensors`, { type, unit })
        return response.data
    } catch (error) {
        console.error(`⚠️ Sensor '${type}' might already exist.`)
        return null
    }
}

/** 🚀 Map a sensor to a device */
async function mapSensorToDevice(deviceId, sensorId) {
    try {
        await axios.post(`${API_BASE_URL}/device-sensor`, { device_id: deviceId, sensor_id: sensorId })
    } catch (error) {
        console.error(`❌ Failed to map sensor ${sensorId} to device ${deviceId}:`, error.response?.data || error.message)
    }
}

module.exports = {
    getDevices, getSensors, getDeviceSensorMappingsForDevice, getDeviceSensorMappingsForSensors,
    registerDevice, registerSensor, mapSensorToDevice, sendSensorReading, sendSensorReadingsForDevice
}