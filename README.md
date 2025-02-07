# ACME IoT Device Sensor Management CLI
Author: Saad Shakil
https://sshakil.github.io

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
    - [Register Devices](#register-devices)
    - [Delete a Device](#delete-a-device)
    - [Update Sensor](#update-sensor)
    - [Simulate Sensor Readings](#simulate-sensor-readings)
- [Configuring Log Levels](#configuring-log-levels)
- [API Configuration](#api-configuration)
- [License](#license)

## Installation

Ensure you have Node.js installed.

```sh
npm install
```

## Usage

Run the CLI tool using:

```sh
node cli.js <command> [options]
```

### Register Devices

Register multiple devices with sensors:

```sh
node cli.js register-devices "car=2,truck=2"
```

This registers two cars and two trucks, mapping sensors automatically.

### Delete a Device

Deletes a registered device by ID:

```sh
node cli.js delete-device 8
```

### Update Sensor

Update the type and/or unit of a sensor:

```sh
node cli.js update-sensor -i 1 -t "temperature" -u "°C"
```

At least one of `--type` or `--unit` is required.

### Simulate Sensor Readings

Simulate readings for specific devices:

```sh
node cli.js simulate-readings-for-devices 1,2
```

Options:
- `--no-mapping-cache`: Fetch fresh mappings instead of using cached ones.
- `--no-validate-mappings`: Skip validation of sensor mappings.
- `--no-response-body`: Suppress response body from the server.

## Configuring Log Levels

Log levels can be configured to control output verbosity. Set the `LOG_LEVEL` environment variable to one of the following:

- `error`: Show only errors.
- `warn`: Show warnings and errors.
- `info`: Default level, shows general logs.
- `debug`: Show detailed logs for debugging.

Example:

```sh
LOG_LEVEL=debug node cli.js register-devices "car=1"
```

## API Configuration

Ensure your `.env` file is set up with:

```sh
API_BASE_URL=http://localhost:4000/acme
```

## License

This project is licensed under a private license for educational purposes and the author's skill-set evaluation for job or contract applications only. You may use, modify, and learn from the code provided here solely for your personal educational use or the evaluation of the author's skill-set during a job or contract application process. Redistribution, commercial use, or privately sharing of this code for any other purpose than identified or sharing it publicly in any form for any purpose is strictly prohibited without explicit permission from the author.

By using this software, you acknowledge that it is provided "as is" without any warranties, express or implied, including but not limited to fitness for a particular purpose. The author shall not be held liable for any damages, losses, or other consequences arising from the use or misuse of this software. You agree to indemnify and hold the author harmless from any claims, liabilities, or expenses related to your use of this software.

[Back to top](#acme-iot-device-sensor-management-cli)

