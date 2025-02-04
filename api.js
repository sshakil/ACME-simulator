const axios = require("axios")
require("dotenv").config()
const { API_BASE_URL, SENSOR_UNITS } = require("./config")
const { log } = require("./utils")

// 🔧 Utility: Handle API requests with error handling
const fetchFromAPI = async (endpoint, errorMessage, transformResponse = data => data) => {
    try {
        const response = await axios.get(`${API_BASE_URL}${endpoint}`)
        log(`📡 Fetching from ${endpoint}:`, response.data)
        return transformResponse(response.data)
    } catch (error) {
        log(`❌ ${errorMessage}:`, error.message, error.response?.data || "")
        return []
    }
}

const postToAPI = async (endpoint, data, errorMessage) => {
    try {
        const response = await axios.post(`${API_BASE_URL}${endpoint}`, data)
        log(`✅ Success: ${endpoint}`, response.data)
        return response.data
    } catch (error) {
        log(`❌ ${errorMessage}:`, error.message, error.response?.data || "")
        return null
    }
}

/** 🚀 Bulk create sensors and map them to a device */
const registerAndMapDeviceSensors = async (deviceId, sensors) => {
    return await postToAPI(`/devices/${deviceId}/sensors`, sensors, `Failed to register and map sensors for device ${deviceId}`)
}

/** 🚀 Fetch all registered devices */
const getDevices = () => fetchFromAPI("/devices", "Failed to fetch devices")

/** 🚀 Fetch all registered sensors */
const getSensors = () => fetchFromAPI("/sensors", "Failed to fetch sensors")

/** 🚀 Fetch device-sensor mappings for a specific device */
const getDeviceSensorMappingsForDevice = (deviceId) =>
    fetchFromAPI(`/device-sensors/${deviceId}`, `Failed to fetch mappings for device ${deviceId}`)

/** 🚀 Fetch device-sensor mappings for specific sensors */
const getDeviceSensorMappingsForSensors = (deviceSensorIds) =>
    fetchFromAPI("/device-sensors", "Failed to fetch mappings for specific sensors",
        data => data.filter(m => deviceSensorIds.includes(m.id)))

/** 🚀 Send a batch of sensor readings for a device */
const sendSensorReadingsForDevice = (deviceId, readings, noValidation = false, noResponseBody = false) =>
    postToAPI(`/sensor-readings/${deviceId}`, { readings, no_validation: noValidation, no_response_body: noResponseBody },
        `Failed to send sensor readings for device ${deviceId}`)

/** 🚀 Send a single sensor reading */
const sendSensorReading = async (deviceSensorId, time, value) => {
    const microseconds = Math.floor(Math.random() * 1000)
    const adjustedTime = new Date(time.getTime() + microseconds / 1000)

    await postToAPI("/sensor-readings", { device_sensor_id: deviceSensorId, time: adjustedTime.toISOString(), value },
        `Failed to send sensor reading`)

    log(`📊 Sent reading: Device-Sensor ${deviceSensorId} => Value: ${value} at ${adjustedTime.toISOString()}`)
}

/** 🚀 Register a device */
const registerDevice = (name, type) =>
    postToAPI("/devices", { name, type }, `Failed to register device (${name})`)

// TODO: unused - remove or support on CLI
/** 🚀 Register a sensor */
const registerSensor = (type) => {
    const unit = SENSOR_UNITS[type] || "unknown"
    return postToAPI("/sensors", { type, unit }, `Failed to register sensor (${type})`)
}

// TODO: unused - remove or support on CLI
/** 🚀 Map a sensor to a device */
const mapSensorToDevice = (deviceId, sensorId) =>
    postToAPI("/device-sensors", { device_id: deviceId, sensor_id: sensorId },
        `Failed to map sensor ${sensorId} to device ${deviceId}`)

module.exports = {
    getDevices, getSensors, getDeviceSensorMappingsForDevice, getDeviceSensorMappingsForSensors,
    registerDevice, registerSensor, mapSensorToDevice, sendSensorReading, sendSensorReadingsForDevice,
    registerAndMapDeviceSensors
}