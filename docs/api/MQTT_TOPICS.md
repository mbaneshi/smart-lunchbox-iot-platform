# MQTT Topics Specification

## Overview

This document defines the MQTT topic structure and message formats for the Smart Lunchbox IoT system.

## Topic Structure

All topics follow the pattern:
```
smartlunchbox/{device_id}/{category}/{subcategory}
```

Where:
- `device_id`: Unique identifier for each device (e.g., "LB-ABC123")
- `category`: Main category (temperature, control, status, etc.)
- `subcategory`: Specific function within category

## Quality of Service (QoS) Levels

- **QoS 0:** Temperature readings (frequent, can tolerate loss)
- **QoS 1:** Control commands (heating/cooling) - at least once delivery
- **QoS 2:** Critical alerts and firmware updates - exactly once delivery

## Topics Reference

### 1. Temperature Topics

#### Current Temperature (Device → Backend/App)
**Topic:** `smartlunchbox/{device_id}/temperature/current`
**Direction:** Publish from device
**QoS:** 0
**Retain:** false
**Frequency:** Every 2 seconds

**Payload:**
```json
{
  "temperature": 25.5,
  "ambient_temperature": 22.0,
  "humidity": 55.0,
  "timestamp": 1699632000,
  "unit": "celsius",
  "mode": "heating",
  "target_temperature": 45.0
}
```

**Fields:**
- `temperature` (float): Food temperature in specified unit
- `ambient_temperature` (float): Enclosure temperature
- `humidity` (float): Relative humidity percentage
- `timestamp` (integer): Unix timestamp in seconds
- `unit` (string): "celsius" or "fahrenheit"
- `mode` (string): "idle", "heating", "cooling", "maintaining"
- `target_temperature` (float, optional): Current target temperature

#### Target Temperature (App/Backend → Device)
**Topic:** `smartlunchbox/{device_id}/temperature/target`
**Direction:** Subscribe on device
**QoS:** 1
**Retain:** true

**Payload:**
```json
{
  "temperature": 45.0,
  "unit": "celsius",
  "timestamp": 1699632000
}
```

### 2. Control Topics

#### Heating Control (App/Backend → Device)
**Topic:** `smartlunchbox/{device_id}/control/heat`
**Direction:** Subscribe on device
**QoS:** 1
**Retain:** false

**Payload:**
```json
{
  "action": "start",
  "targetTemp": 45.0,
  "maxDuration": 3600,
  "mode": "gentle",
  "timestamp": 1699632000
}
```

**Fields:**
- `action` (string): "start" or "stop"
- `targetTemp` (float): Desired temperature
- `maxDuration` (integer): Maximum heating time in seconds
- `mode` (string): "gentle" or "rapid"
- `timestamp` (integer): Command timestamp

#### Cooling Control (App/Backend → Device)
**Topic:** `smartlunchbox/{device_id}/control/cool`
**Direction:** Subscribe on device
**QoS:** 1
**Retain:** false

**Payload:**
```json
{
  "action": "start",
  "targetTemp": 10.0,
  "maxDuration": 7200,
  "mode": "gentle",
  "timestamp": 1699632000
}
```

#### Power Control (App/Backend → Device)
**Topic:** `smartlunchbox/{device_id}/control/power`
**Direction:** Subscribe on device
**QoS:** 1
**Retain:** false

**Payload:**
```json
{
  "action": "off",
  "timestamp": 1699632000
}
```

**Fields:**
- `action` (string): "on" or "off"
- `timestamp` (integer): Command timestamp

### 3. Status Topics

#### Online Status (Device → Backend/App)
**Topic:** `smartlunchbox/{device_id}/status/online`
**Direction:** Publish from device
**QoS:** 1
**Retain:** true
**LWT:** Set to "offline" as Last Will and Testament

**Payload:**
```
"online"
```
or
```
"offline"
```

Simple string payload indicating device connection status.

#### Device State (Device → Backend/App)
**Topic:** `smartlunchbox/{device_id}/status/state`
**Direction:** Publish from device
**QoS:** 1
**Retain:** true

**Payload:**
```json
{
  "mode": "heating",
  "targetTemp": 45.0,
  "currentTemp": 38.5,
  "timeRemaining": 900,
  "powerState": "on",
  "errorCode": 0,
  "timestamp": 1699632000
}
```

### 4. Timer/Schedule Topics

#### Schedule Configuration (App/Backend → Device)
**Topic:** `smartlunchbox/{device_id}/timer/schedule`
**Direction:** Subscribe on device
**QoS:** 1
**Retain:** false

**Payload:**
```json
{
  "scheduleId": "sched-001",
  "action": "add",
  "schedule": {
    "name": "Lunch Warming",
    "mode": "heat",
    "targetTemp": 45.0,
    "startTime": "12:00",
    "duration": 1800,
    "recurring": {
      "enabled": true,
      "pattern": "weekdays",
      "daysOfWeek": [1, 2, 3, 4, 5]
    },
    "enabled": true
  },
  "timestamp": 1699632000
}
```

**Fields:**
- `scheduleId` (string): Unique schedule identifier
- `action` (string): "add", "update", "delete"
- `schedule` (object): Schedule configuration
- `timestamp` (integer): Command timestamp

#### Timer Event (Device → Backend/App)
**Topic:** `smartlunchbox/{device_id}/timer/event`
**Direction:** Publish from device
**QoS:** 1
**Retain:** false

**Payload:**
```json
{
  "eventType": "timer_started",
  "scheduleId": "sched-001",
  "duration": 1800,
  "timestamp": 1699632000
}
```

**Event Types:**
- `timer_started`: Timer/schedule started
- `timer_completed`: Timer finished successfully
- `timer_cancelled`: Timer cancelled by user
- `timer_failed`: Timer failed (error occurred)

### 5. Alert Topics

#### Alerts (Device → Backend/App)
**Topic:** `smartlunchbox/{device_id}/alerts`
**Direction:** Publish from device
**QoS:** 2
**Retain:** false

**Payload:**
```json
{
  "alertId": "alert-001",
  "type": "temperature_too_high",
  "severity": "warning",
  "message": "Temperature exceeded threshold",
  "temperature": 68.0,
  "threshold": 65.0,
  "timestamp": 1699632000
}
```

**Alert Types:**
- `temperature_too_high`: Food temp above user threshold
- `temperature_too_low`: Food temp below user threshold
- `device_offline`: Device lost connection (sent by backend)
- `timer_complete`: Scheduled timer completed
- `safety_shutdown`: Emergency safety shutdown triggered
- `battery_low`: Battery level critical (if applicable)
- `firmware_update_available`: New firmware available

**Severity Levels:**
- `info`: Informational message
- `warning`: Warning condition
- `critical`: Critical condition requiring immediate attention

### 6. Firmware Topics

#### Firmware Version (Device → Backend/App)
**Topic:** `smartlunchbox/{device_id}/firmware/version`
**Direction:** Publish from device
**QoS:** 1
**Retain:** true

**Payload:**
```
"1.0.0"
```

Simple string with semantic version number.

#### Firmware Update Command (Backend → Device)
**Topic:** `smartlunchbox/{device_id}/firmware/update`
**Direction:** Subscribe on device
**QoS:** 2
**Retain:** false

**Payload:**
```json
{
  "version": "1.1.0",
  "url": "https://firmware.smartlunchbox.com/v1.1.0/firmware.bin",
  "checksum": "sha256:abc123...",
  "size": 1048576,
  "mandatory": false,
  "releaseNotes": "Bug fixes and performance improvements",
  "timestamp": 1699632000
}
```

#### Firmware Update Status (Device → Backend)
**Topic:** `smartlunchbox/{device_id}/firmware/update/status`
**Direction:** Publish from device
**QoS:** 1
**Retain:** false

**Payload:**
```json
{
  "status": "downloading",
  "progress": 45,
  "version": "1.1.0",
  "error": null,
  "timestamp": 1699632000
}
```

**Status Values:**
- `checking`: Checking for updates
- `downloading`: Downloading firmware
- `installing`: Installing firmware
- `rebooting`: Rebooting device
- `success`: Update completed successfully
- `failed`: Update failed

## Wildcard Subscriptions

### Backend Server Subscriptions

The backend server should subscribe to these wildcard topics:

```
smartlunchbox/+/temperature/current
smartlunchbox/+/status/online
smartlunchbox/+/status/state
smartlunchbox/+/timer/event
smartlunchbox/+/alerts
smartlunchbox/+/firmware/version
smartlunchbox/+/firmware/update/status
```

The `+` wildcard matches a single level (device_id).

### Mobile App Subscriptions

The mobile app should subscribe to these topics for the current device:

```
smartlunchbox/{device_id}/temperature/current
smartlunchbox/{device_id}/status/online
smartlunchbox/{device_id}/status/state
smartlunchbox/{device_id}/timer/event
smartlunchbox/{device_id}/alerts
smartlunchbox/{device_id}/firmware/version
```

## Message Size Limits

- **Maximum message size:** 512 bytes (Mosquitto default: 100 MB, but keep small)
- **Recommended size:** < 256 bytes for optimal performance
- **Topic length:** < 128 characters

## Timing Considerations

### Publish Intervals

- **Temperature readings:** Every 2 seconds
- **Status updates:** Every 10 seconds or on change
- **Heartbeat:** Every 30 seconds (online status)

### Timeouts

- **Connection timeout:** 30 seconds
- **Keep-alive interval:** 60 seconds
- **Message acknowledgment:** 5 seconds

## Error Handling

### Connection Loss

- Device publishes LWT message "offline" to status topic
- Backend marks device as offline after 10 seconds
- Device attempts reconnection every 5 seconds

### Command Failures

If a device cannot execute a command, it should publish to the alerts topic:

```json
{
  "type": "command_failed",
  "severity": "warning",
  "message": "Cannot start heating: temperature sensor error",
  "command": "heat_start",
  "reason": "sensor_error",
  "timestamp": 1699632000
}
```

## Security Considerations

### Authentication

- All clients must authenticate with username/password
- Use strong passwords (minimum 16 characters)
- Rotate credentials regularly

### Authorization

- Device users can only publish/subscribe to their device topics
- Backend user can access all topics
- Mobile app users authenticated via JWT, then granted MQTT credentials

### Encryption

- Production: Use TLS/SSL (port 8883 for MQTT, 443 for WebSockets)
- Development: Unencrypted allowed on localhost only
- Certificate validation required in production

## Testing MQTT Topics

### Subscribe to All Topics

```bash
mosquitto_sub -h localhost -p 1883 \
  -t "smartlunchbox/#" \
  -u backend_user -P password -v
```

### Publish Test Temperature

```bash
mosquitto_pub -h localhost -p 1883 \
  -t "smartlunchbox/LB-TEST123/temperature/current" \
  -m '{"temperature":25.5,"ambient_temperature":22.0,"humidity":55.0,"timestamp":1699632000,"unit":"celsius","mode":"idle"}' \
  -u device_user -P password
```

### Publish Test Heat Command

```bash
mosquitto_pub -h localhost -p 1883 \
  -t "smartlunchbox/LB-TEST123/control/heat" \
  -m '{"action":"start","targetTemp":45.0,"maxDuration":3600,"mode":"gentle","timestamp":1699632000}' \
  -u backend_user -P password
```

### Publish Test Alert

```bash
mosquitto_pub -h localhost -p 1883 \
  -t "smartlunchbox/LB-TEST123/alerts" \
  -m '{"alertId":"alert-001","type":"temperature_too_high","severity":"warning","message":"Temperature exceeded threshold","temperature":68.0,"threshold":65.0,"timestamp":1699632000}' \
  -u device_user -P password -q 2
```

## Best Practices

1. **Use QoS appropriately:**
   - QoS 0 for high-frequency, non-critical data
   - QoS 1 for important commands
   - QoS 2 for critical operations only

2. **Keep messages small:**
   - Use compact JSON
   - Avoid unnecessary fields
   - Consider binary formats for very high-frequency data

3. **Use retain flag wisely:**
   - Retain status messages (online/offline, firmware version)
   - Don't retain temperature readings
   - Don't retain commands

4. **Implement reconnection logic:**
   - Exponential backoff for reconnections
   - Resubscribe to topics after reconnection
   - Republish retained messages after reconnection

5. **Monitor topic metrics:**
   - Message rates
   - Message sizes
   - Delivery failures
   - Connection drops

## Troubleshooting

### Messages Not Received

1. Check topic spelling
2. Verify QoS level
3. Check client subscription
4. Review broker logs
5. Verify authentication

### High Latency

1. Reduce message frequency
2. Decrease message size
3. Check network bandwidth
4. Review broker load
5. Consider QoS reduction

### Connection Issues

1. Verify broker address and port
2. Check firewall rules
3. Verify credentials
4. Review SSL/TLS configuration
5. Check keep-alive settings

## Conclusion

This MQTT topics specification provides a comprehensive guide for implementing MQTT communication in the Smart Lunchbox system. Follow these specifications to ensure consistent and reliable messaging between devices, mobile apps, and backend services.
