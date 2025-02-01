Install @faker-js/faker for generating realistic sensor data
```
npm install @faker-js/faker
```

Install turf for geospatial calculations and realistic GPS point generation
```
npm install @turf/turf
```

Dynamically add new device types
```
node cli.js add-device-type drone "GPS, LiDAR, IMU"
```

Dynamically add new sensors
```
node cli.js add-sensor "CO2 Sensor" ppm
```

Register devices dynamically
```
node cli.js register-devices train=2,truck=1,car=3,warehouse-robot=3,patient-monitor=3
```

Register a single device
```
node cli.js register-device "Truck Alpha" truck
```

Register all sensors
```
node cli.js ensure-sensors
```


Map sensors to devices
```
node cli.js map-sensors
```

Simulate sensor readings
```
node cli.js simulate-readings
```