const axios = require("axios")
require("dotenv").config()
const { API_BASE_URL, SENSOR_UNITS } = require("./config")
const { log } = require("./utils")

/* Fetch data from API with error handling */
const getFromAPI = async (endpoint, errorMessage, transformResponse = data => data) => {
    try {
        const response = await axios.get(`${API_BASE_URL}${endpoint}`)
        log(`📡 Fetching from ${endpoint}:`, response.data)
        return transformResponse(response.data)
    } catch (error) {
        log(`❌ ${errorMessage}:`, error.message, error.response?.data || "")
        return []
    }
}

/* Post data to API with error handling */
const postOnAPI = async (endpoint, data, errorMessage) => {
    try {
        const response = await axios.post(`${API_BASE_URL}${endpoint}`, data)
        log(response.data)
        log(`✅ Successful POST on: ${endpoint}`, response.data)
        return response.data
    } catch (error) {
        log(`❌ ${errorMessage}:`, error.message, error.response?.data || "")
        throw error
    }
}

/* Bulk create and map sensors to a device */
const registerAndMapDeviceSensors = async (deviceId, sensors) =>
    postOnAPI(`/devices/${deviceId}/sensors`, sensors, `Failed to register and map sensors for device ${deviceId}`)

/* Get all registered devices */
const getDevices = () => getFromAPI("/devices", "Failed to get devices")

/* Get sensor mappings for a specific device */
const getDeviceSensorMappingsForDevice = (deviceId) =>
    getFromAPI(`/device-sensors/${deviceId}`, `Failed to get mappings for device ${deviceId}`)

/* Send multiple sensor readings for a device */
const sendSensorReadingsForDevice = (deviceId, readings, validateMappings = false, responseBody = false) =>
    postOnAPI(`/sensor-readings/${deviceId}`, { readings, validateMappings, responseBody },
        `Failed to send sensor readings for device ${deviceId}`)

/* Send a single sensor reading */
const sendSensorReading = async (deviceSensorId, time, value) => {
    const microseconds = Math.floor(Math.random() * 1000)
    const adjustedTime = new Date(time.getTime() + microseconds / 1000)

    await postOnAPI("/sensor-readings", { device_sensor_id: deviceSensorId, time: adjustedTime.toISOString(), value },
        `Failed to send sensor reading`)

    log(`📊 Sent reading: Device-Sensor ${deviceSensorId} => Value: ${value} at ${adjustedTime.toISOString()}`)
}

/* Register a new device */
const registerDevice = (name, type) =>
    postOnAPI("/devices", { name, type }, `Failed to register device (${name})`)

/* Delete a device by ID */
const deleteDevice = async (id) => {
    await axios.delete(`${API_BASE_URL}/devices/${id}`)
}

/* Update a sensor by ID */
const updateSensor = (sensorId, type, unit) =>
    postOnAPI(`/sensors/${sensorId}`, { type, unit }, `Failed to update sensor with ID ${sensorId}`)

/* Get all sensors */
const getSensors = () => getFromAPI("/sensors", "Failed to get sensors")

module.exports = {
    getDevices,
    registerDevice,
    deleteDevice,
    getSensors,
    updateSensor,
    registerAndMapDeviceSensors,
    getDeviceSensorMappingsForDevice,
    sendSensorReading,
    sendSensorReadingsForDevice,
}