# Smart Lunchbox Control App - Technical Requirements Document

## Document Version
**Version:** 1.0
**Last Updated:** 2025-11-10
**Project:** Smart Lunchbox IoT Companion App
**Budget:** CA $5,000 – $10,000

---

## 1. TECHNICAL SPECIFICATIONS

### 1.1 Mobile App Tech Stack

#### Recommended: React Native
**Primary Choice:**
- **Framework:** React Native 0.72+
- **Language:** TypeScript 5.0+
- **State Management:** Redux Toolkit or Zustand
- **Navigation:** React Navigation 6.x
- **UI Components:** React Native Paper or NativeBase
- **Local Storage:** AsyncStorage with encryption wrapper
- **Real-time Communication:** MQTT.js for React Native

**Rationale:**
- Single codebase for iOS and Android
- Large community and library ecosystem
- Faster development cycle
- Easier to find developers
- Good performance for IoT applications

**Alternative: Flutter**
- **Framework:** Flutter 3.x
- **Language:** Dart 3.0+
- **State Management:** Riverpod or Bloc
- **UI Components:** Material Design 3
- **Local Storage:** Hive or SQLite
- **Real-time Communication:** mqtt_client package

#### Platform Requirements
- **iOS:** Minimum iOS 13.0, Target iOS 16+
- **Android:** Minimum API 24 (Android 7.0), Target API 33+
- **Screen Support:** Phone and tablet layouts
- **Orientation:** Portrait primary, landscape optional

### 1.2 IoT Communication Protocols

#### Primary Protocol: MQTT
**Specification:**
- **Protocol Version:** MQTT 3.1.1 or 5.0
- **Transport:** WebSocket over TLS (WSS) for mobile clients
- **QoS Levels:**
  - QoS 0: Temperature readings (frequent, can tolerate loss)
  - QoS 1: Control commands (heating/cooling)
  - QoS 2: Critical alerts and firmware updates
- **Broker:** Mosquitto or HiveMQ Cloud
- **Port:** 8883 (TLS) or 443 (WebSocket over TLS)

**MQTT Topics Structure:**
```
smartlunchbox/{device_id}/temperature/current    (publish from device)
smartlunchbox/{device_id}/temperature/target     (subscribe on device)
smartlunchbox/{device_id}/control/heat           (subscribe on device)
smartlunchbox/{device_id}/control/cool           (subscribe on device)
smartlunchbox/{device_id}/control/power          (subscribe on device)
smartlunchbox/{device_id}/status/online          (LWT message)
smartlunchbox/{device_id}/timer/schedule         (subscribe on device)
smartlunchbox/{device_id}/alerts                 (publish from device)
smartlunchbox/{device_id}/firmware/version       (publish from device)
smartlunchbox/{device_id}/firmware/update        (subscribe on device)
```

**Message Format:** JSON
```json
{
  "timestamp": 1699632000,
  "temperature": 25.5,
  "unit": "celsius",
  "device_id": "LB-ABC123",
  "status": "heating"
}
```

#### Secondary Protocol: REST API
**Use Cases:**
- User authentication
- Device registration and management
- Historical data retrieval
- Settings synchronization
- OTA firmware downloads

**Specification:**
- **Protocol:** HTTPS/TLS 1.3
- **Format:** JSON
- **Authentication:** JWT Bearer tokens
- **Rate Limiting:** 100 requests/minute per user

### 1.3 Hardware Integration Requirements

#### Microcontroller: ESP32
**Specifications:**
- **Module:** ESP32-WROOM-32D or ESP32-S3
- **Flash:** Minimum 4MB
- **RAM:** 520KB SRAM
- **Wi-Fi:** 802.11 b/g/n (2.4 GHz)
- **Bluetooth:** BLE 5.0 (for onboarding)
- **Operating Voltage:** 3.3V
- **GPIO Pins:** Minimum 6 required

**Pin Allocation:**
```
GPIO 4  -> Temperature Sensor 1 (DS18B20)
GPIO 5  -> Temperature Sensor 2 (DHT22)
GPIO 18 -> Peltier Relay (Heating)
GPIO 19 -> Peltier Relay (Cooling)
GPIO 21 -> Fan Control (PWM)
GPIO 22 -> Status LED
GPIO 23 -> Safety Cutoff Input
```

#### Temperature Sensors
**Primary Sensor:** DS18B20 (Internal Food Temperature)
- Range: -55°C to +125°C
- Accuracy: ±0.5°C (-10°C to +85°C)
- Interface: 1-Wire
- Update Rate: 750ms per reading

**Secondary Sensor:** DHT22 (Ambient/Enclosure Temperature)
- Range: -40°C to +80°C
- Accuracy: ±0.5°C
- Humidity: 0-100% RH (±2-5%)
- Interface: Single-wire digital
- Update Rate: 2 seconds

#### Peltier Module
**Specification:** TEC1-12706
- **Voltage:** 12V DC
- **Current:** 6A maximum
- **Power:** 72W maximum
- **Temperature Differential:** 66°C
- **Dimensions:** 40mm x 40mm x 3.6mm
- **Control:** PWM via MOSFET/relay

#### Power Requirements
**AC Powered Mode:**
- Input: 100-240V AC, 50/60Hz
- DC Output: 12V 10A (120W)
- Converter: Mean Well RS-150-12 or similar

**Battery Mode (Optional Future Phase):**
- Type: 18650 Li-ion cells (3S3P configuration)
- Voltage: 11.1V nominal
- Capacity: 7500mAh minimum
- BMS: Required for safety
- Runtime: 2-4 hours active heating/cooling

### 1.4 Backend Services Architecture

#### Cloud Platform: AWS
**Services:**
- **IoT Core:** MQTT broker and device management
- **API Gateway:** REST API endpoints
- **Lambda:** Serverless functions
- **DynamoDB:** User data and device registry
- **S3:** Firmware storage, user uploaded content
- **CloudWatch:** Logging and monitoring
- **Cognito:** User authentication
- **SNS:** Push notifications
- **CloudFront:** CDN for firmware updates

**Alternative: Google Cloud**
- IoT Core, Cloud Functions, Firestore, Cloud Storage, Firebase Auth

#### Architecture Pattern: Microservices
**Services:**
1. **User Service:** Authentication, profile management
2. **Device Service:** Registration, pairing, status
3. **Telemetry Service:** Temperature data ingestion and storage
4. **Control Service:** Command processing and validation
5. **Notification Service:** Push notifications and alerts
6. **Firmware Service:** OTA update management

#### Database Schema

**Users Table:**
```json
{
  "user_id": "UUID",
  "email": "string",
  "password_hash": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "preferences": {
    "temperature_unit": "celsius|fahrenheit",
    "notifications_enabled": "boolean"
  }
}
```

**Devices Table:**
```json
{
  "device_id": "string",
  "user_id": "UUID",
  "device_name": "string",
  "firmware_version": "string",
  "last_online": "timestamp",
  "registered_at": "timestamp",
  "wifi_ssid": "string",
  "status": "online|offline|error"
}
```

**Temperature Data Table:**
```json
{
  "device_id": "string",
  "timestamp": "timestamp",
  "temperature": "float",
  "humidity": "float",
  "mode": "heating|cooling|idle",
  "target_temperature": "float"
}
```

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 Real-Time Temperature Monitoring

#### FR-TEMP-001: Live Temperature Display
**Priority:** High
**Description:** Display current temperature from lunchbox sensors in real-time.

**Acceptance Criteria:**
- Temperature updates every 2 seconds maximum latency
- Display both internal food temperature and ambient temperature
- Show temperature in user's preferred unit (C/F)
- Visual gauge or thermometer UI element
- Color-coded zones: Cold (<10°C), Room (10-25°C), Warm (25-45°C), Hot (>45°C)
- Connection status indicator (connected/disconnected)

**Implementation Details:**
```typescript
interface TemperatureReading {
  foodTemp: number;
  ambientTemp: number;
  humidity: number;
  timestamp: number;
  unit: 'celsius' | 'fahrenheit';
}

// Update frequency: 2 seconds
// Timeout: 10 seconds (mark as disconnected)
```

#### FR-TEMP-002: Temperature History and Trends
**Priority:** Medium
**Description:** Display historical temperature data with graphical visualization.

**Acceptance Criteria:**
- Show last 24 hours of temperature data by default
- Line chart with time on X-axis, temperature on Y-axis
- Ability to zoom to 1 hour, 6 hours, 12 hours, 24 hours, 7 days
- Mark heating/cooling events on timeline
- Export data as CSV
- Data persisted locally and in cloud

**Implementation Details:**
- Use Victory Charts (React Native) or FL Chart (Flutter)
- Store last 1000 readings locally
- Fetch historical data from cloud API on demand
- Implement data decimation for older data (5-minute intervals for >24h ago)

#### FR-TEMP-003: Temperature Alerts
**Priority:** High
**Description:** Push notifications for temperature threshold violations.

**Acceptance Criteria:**
- User-configurable high/low temperature thresholds
- Push notification when threshold exceeded
- In-app alert banner
- Alert history log
- Snooze functionality (15 min, 30 min, 1 hour)
- Battery level alerts (<20%)

**Alert Types:**
```typescript
enum AlertType {
  TEMP_TOO_HIGH = 'temperature_too_high',
  TEMP_TOO_LOW = 'temperature_too_low',
  DEVICE_OFFLINE = 'device_offline',
  TIMER_COMPLETE = 'timer_complete',
  SAFETY_SHUTDOWN = 'safety_shutdown',
  BATTERY_LOW = 'battery_low',
  FIRMWARE_UPDATE = 'firmware_update_available'
}
```

#### FR-TEMP-004: Visual Temperature Indicators
**Priority:** Medium
**Description:** Color-coded visual feedback for temperature zones.

**Acceptance Criteria:**
- Background color gradient based on temperature
- Icon changes (snowflake, sun, flame)
- Haptic feedback on temperature zone changes
- Animated transitions between zones

**Color Scheme:**
```
Cold Zone (<10°C):     #3498db (blue)
Cool Zone (10-20°C):   #1abc9c (teal)
Room Zone (20-30°C):   #2ecc71 (green)
Warm Zone (30-45°C):   #f39c12 (orange)
Hot Zone (>45°C):      #e74c3c (red)
```

### 2.2 Temperature Control

#### FR-CTRL-001: Manual Heating Activation
**Priority:** High
**Description:** User can manually start heating cycle.

**Acceptance Criteria:**
- Large, accessible "Heat" button on main screen
- Confirmation dialog with estimated time to target temperature
- Heating indicator (animated icon, progress bar)
- Real-time power consumption display (optional)
- Emergency stop button
- Maximum heating time: 60 minutes (safety cutoff)
- Can't enable if temperature >60°C

**Implementation:**
```typescript
interface HeatingCommand {
  action: 'start' | 'stop';
  targetTemp: number;
  maxDuration: number; // seconds
  mode: 'gentle' | 'rapid';
}

// MQTT: smartlunchbox/{device_id}/control/heat
// Payload: {"action": "start", "targetTemp": 45, "maxDuration": 3600}
```

#### FR-CTRL-002: Manual Cooling Activation
**Priority:** High
**Description:** User can manually start cooling cycle.

**Acceptance Criteria:**
- "Cool" button on main screen
- Set target temperature (range: 4°C - 20°C)
- Cooling indicator with fan animation
- Estimated time to reach target
- Auto-stop when target reached
- Maximum cooling time: 120 minutes

**Safety Limits:**
```typescript
const COOLING_LIMITS = {
  minTemp: 4,  // °C (prevent freezing)
  maxTemp: 20, // °C
  maxDuration: 7200, // seconds (2 hours)
  minAmbient: 15 // won't cool if ambient < 15°C
};
```

#### FR-CTRL-003: Temperature Presets
**Priority:** Medium
**Description:** Quick-select temperature presets.

**Acceptance Criteria:**
- At least 4 preset buttons: Deep Cool, Cool, Warm, Hot
- User can customize preset temperatures
- One-tap activation
- Visual distinction between presets

**Default Presets:**
```typescript
const PRESETS = {
  DEEP_COOL: { name: 'Deep Cool', temp: 4, icon: 'snowflake' },
  COOL: { name: 'Cool', temp: 10, icon: 'snowflake-variant' },
  WARM: { name: 'Warm', temp: 40, icon: 'weather-sunny' },
  HOT: { name: 'Hot', temp: 55, icon: 'fire' }
};
```

#### FR-CTRL-004: Fine-Grained Temperature Adjustment
**Priority:** Medium
**Description:** Precise temperature control with slider or stepper.

**Acceptance Criteria:**
- Slider for temperature range (4°C - 60°C)
- 0.5°C increments
- Display current and target temperature
- Estimated time to reach target
- Apply button to confirm changes

#### FR-CTRL-005: Safety Limits and Auto-Shutoff
**Priority:** Critical
**Description:** Automatic safety mechanisms.

**Acceptance Criteria:**
- Hard limit: 65°C maximum (emergency shutoff)
- Auto-shutoff after max duration (heating: 60 min, cooling: 120 min)
- Over-temperature protection (>70°C triggers alarm)
- Thermal fuse backup in hardware
- User cannot override safety limits
- Safety event logged and reported to user

**Safety System:**
```typescript
const SAFETY_LIMITS = {
  maxTemp: 65,        // °C - software limit
  emergencyTemp: 70,  // °C - hardware cutoff
  maxHeatingTime: 3600,   // seconds
  maxCoolingTime: 7200,   // seconds
  minBatteryLevel: 15     // % before disabling heating
};
```

### 2.3 Timer Functionality

#### FR-TIMER-001: Schedule Heating/Cooling Cycles
**Priority:** High
**Description:** Schedule future heating or cooling operations.

**Acceptance Criteria:**
- Set date and time for operation
- Choose heating or cooling mode
- Set target temperature
- Set duration or end condition
- Recurring schedule support (daily, weekdays, weekends)
- List of upcoming scheduled events
- Edit or cancel scheduled events
- Push notification before scheduled start (5 min warning)

**Schedule Schema:**
```typescript
interface Schedule {
  id: string;
  deviceId: string;
  name: string;
  mode: 'heat' | 'cool';
  targetTemp: number;
  startTime: Date;
  duration: number; // seconds, or null for "until target reached"
  recurring: {
    enabled: boolean;
    pattern: 'daily' | 'weekdays' | 'weekends' | 'custom';
    daysOfWeek?: number[]; // 0-6, Sunday = 0
  };
  enabled: boolean;
  notifications: boolean;
}
```

#### FR-TIMER-002: Countdown Timers
**Priority:** High
**Description:** Start heating/cooling with countdown timer.

**Acceptance Criteria:**
- Set timer duration (5 min - 120 min)
- Start immediately or after delay
- Visual countdown display (MM:SS)
- Progress ring/circle animation
- Pause/resume functionality
- Cancel timer
- Notification when timer completes
- Option to add 5/10/15 minutes while running

**UI Elements:**
```typescript
interface CountdownTimer {
  duration: number;      // seconds
  remaining: number;     // seconds
  status: 'idle' | 'running' | 'paused' | 'completed';
  mode: 'heat' | 'cool';
  targetTemp: number;
}
```

#### FR-TIMER-003: Recurring Schedules
**Priority:** Medium
**Description:** Daily or weekly recurring heating/cooling schedules.

**Acceptance Criteria:**
- "Warm lunch at 12 PM every weekday" type schedules
- Multiple recurring schedules per device
- Enable/disable individual schedules
- Schedule conflict detection and warning
- Holiday mode (disable all schedules)
- Smart scheduling (learn user patterns - future phase)

**Example Use Cases:**
```
- Warm lunch Monday-Friday at 12:00 PM (target 45°C)
- Cool afternoon snack Monday-Friday at 3:00 PM (target 10°C)
- Pre-warm breakfast daily at 7:30 AM (target 50°C)
```

#### FR-TIMER-004: Timer Notifications
**Priority:** Medium
**Description:** Notifications for timer events.

**Acceptance Criteria:**
- Push notification when timer starts
- Push notification when timer completes
- Push notification if timer fails (device offline, error)
- In-app notification history
- Custom notification sounds
- Vibration patterns

### 2.4 Device Management

#### FR-DEV-001: Wi-Fi Network Configuration
**Priority:** High
**Description:** Configure lunchbox Wi-Fi connection.

**Acceptance Criteria:**
- Two modes: BLE provisioning or AP mode
- Scan and display available Wi-Fi networks
- Password entry with show/hide toggle
- Test connection before saving
- Support WPA2/WPA3 security
- 2.4 GHz only (ESP32 limitation)
- Save multiple networks (home, office)
- Auto-reconnect to strongest known network

**Provisioning Flow (BLE Preferred):**
```
1. User opens app, taps "Add Device"
2. App scans for BLE devices advertising "SmartLunchbox"
3. User selects device from list
4. App connects via BLE
5. App sends Wi-Fi credentials via BLE
6. Device connects to Wi-Fi
7. Device sends MQTT connection confirmation
8. App switches to MQTT communication
9. BLE disconnects
```

**Alternative: AP Mode:**
```
1. Device creates Wi-Fi AP "SmartLunchbox-XXXX"
2. User connects phone to AP
3. App opens captive portal or dedicated screen
4. User selects home Wi-Fi and enters password
5. Device connects to home Wi-Fi
6. App reconnects to home Wi-Fi
7. MQTT communication established
```

#### FR-DEV-002: Device Pairing and Onboarding
**Priority:** High
**Description:** First-time device setup process.

**Acceptance Criteria:**
- Step-by-step onboarding wizard
- QR code scanning for device ID (optional)
- Manual device ID entry fallback
- Device naming (e.g., "My Lunch", "Work Lunchbox")
- Wi-Fi configuration (see FR-DEV-001)
- Test heating/cooling functionality
- Success confirmation screen
- User tutorial/walkthrough (optional, skippable)

**Onboarding Steps:**
```typescript
enum OnboardingStep {
  WELCOME = 'welcome',
  SCAN_DEVICE = 'scan_device',
  WIFI_CONFIG = 'wifi_config',
  DEVICE_NAME = 'device_name',
  TEST_CONNECTION = 'test_connection',
  TEST_HEATING = 'test_heating',
  COMPLETE = 'complete'
}
```

#### FR-DEV-003: Multiple Device Support
**Priority:** Medium
**Description:** Manage multiple lunchboxes per user account.

**Acceptance Criteria:**
- Add unlimited devices to account
- Switch between devices with dropdown/tabs
- Each device has unique name and icon
- Dashboard shows all devices at once (grid view)
- Set default/primary device
- Remove device from account
- Transfer device to another user

**UI Layout:**
```
Main Screen:
- Device selector dropdown (top)
- Or: Swipeable cards for each device
- Grid view option (2x2, shows 4 devices at once)
```

#### FR-DEV-004: Firmware Status and Update Notifications
**Priority:** High
**Description:** OTA firmware update system.

**Acceptance Criteria:**
- Display current firmware version
- Check for updates (manual and automatic)
- Download firmware in background
- Show update progress (downloading, installing)
- Notify user when update available
- Release notes display
- Automatic update scheduling (install at night)
- Rollback capability if update fails
- Update history log

**Update Flow:**
```
1. Device publishes current firmware version via MQTT
2. Backend checks for newer version
3. If available, sends notification to app
4. App displays update prompt to user
5. User approves update
6. App notifies device via MQTT
7. Device downloads firmware from S3 presigned URL
8. Device installs update and reboots
9. Device reports new version
10. App confirms update success
```

**Firmware Version Schema:**
```typescript
interface FirmwareInfo {
  current: string;  // "1.2.3"
  latest: string;   // "1.3.0"
  updateAvailable: boolean;
  releaseNotes: string;
  downloadUrl: string;
  fileSize: number; // bytes
  mandatory: boolean;
  minSupportedVersion: string;
}
```

---

## 3. IMPLEMENTATION GUIDE

### 3.1 MQTT Broker Setup

#### Option 1: Mosquitto (Self-Hosted)
**Installation (AWS EC2):**
```bash
# Ubuntu 20.04 LTS
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients

# Generate SSL certificates
sudo apt-get install certbot
sudo certbot certonly --standalone -d mqtt.yourdomain.com

# Configure Mosquitto
sudo nano /etc/mosquitto/mosquitto.conf
```

**Configuration File:**
```conf
# /etc/mosquitto/mosquitto.conf
listener 1883 localhost
listener 8883
certfile /etc/letsencrypt/live/mqtt.yourdomain.com/cert.pem
cafile /etc/letsencrypt/live/mqtt.yourdomain.com/chain.pem
keyfile /etc/letsencrypt/live/mqtt.yourdomain.com/privkey.pem

listener 9001
protocol websockets
certfile /etc/letsencrypt/live/mqtt.yourdomain.com/cert.pem
cafile /etc/letsencrypt/live/mqtt.yourdomain.com/chain.pem
keyfile /etc/letsencrypt/live/mqtt.yourdomain.com/privkey.pem

allow_anonymous false
password_file /etc/mosquitto/passwd

# Logging
log_dest file /var/log/mosquitto/mosquitto.log
log_type all
connection_messages true
log_timestamp true

# Persistence
persistence true
persistence_location /var/lib/mosquitto/

# Bridge to AWS IoT Core (optional)
# connection awsiot
# address xxxxxx.iot.us-east-1.amazonaws.com:8883
# bridge_cafile /etc/mosquitto/certs/root-CA.crt
# bridge_certfile /etc/mosquitto/certs/cert.crt
# bridge_keyfile /etc/mosquitto/certs/private.key
```

**Create Users:**
```bash
sudo mosquitto_passwd -c /etc/mosquitto/passwd admin
sudo mosquitto_passwd /etc/mosquitto/passwd device_user
sudo mosquitto_passwd /etc/mosquitto/passwd app_user
```

**Restart Service:**
```bash
sudo systemctl restart mosquitto
sudo systemctl enable mosquitto
```

#### Option 2: AWS IoT Core (Recommended for Production)
**Setup Steps:**
1. Create IoT Thing for each device
2. Generate device certificates
3. Attach policy to certificates
4. Configure device shadows
5. Set up IoT Rules for data routing

**IoT Policy (Device):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["iot:Connect"],
      "Resource": ["arn:aws:iot:us-east-1:ACCOUNT:client/${iot:Connection.Thing.ThingName}"]
    },
    {
      "Effect": "Allow",
      "Action": ["iot:Publish"],
      "Resource": [
        "arn:aws:iot:us-east-1:ACCOUNT:topic/smartlunchbox/${iot:Connection.Thing.ThingName}/temperature/*",
        "arn:aws:iot:us-east-1:ACCOUNT:topic/smartlunchbox/${iot:Connection.Thing.ThingName}/status/*",
        "arn:aws:iot:us-east-1:ACCOUNT:topic/smartlunchbox/${iot:Connection.Thing.ThingName}/alerts"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["iot:Subscribe", "iot:Receive"],
      "Resource": [
        "arn:aws:iot:us-east-1:ACCOUNT:topic/smartlunchbox/${iot:Connection.Thing.ThingName}/control/*",
        "arn:aws:iot:us-east-1:ACCOUNT:topic/smartlunchbox/${iot:Connection.Thing.ThingName}/timer/*",
        "arn:aws:iot:us-east-1:ACCOUNT:topic/smartlunchbox/${iot:Connection.Thing.ThingName}/firmware/*"
      ]
    }
  ]
}
```

**IoT Rule (Store Temperature Data):**
```sql
SELECT
  topic(2) as device_id,
  temperature,
  humidity,
  timestamp
FROM 'smartlunchbox/+/temperature/current'
```
Action: Insert into DynamoDB table

#### Option 3: HiveMQ Cloud (Managed Service)
**Pros:** Fully managed, automatic scaling, WebSocket support, monitoring dashboard
**Cons:** Cost, vendor lock-in
**Setup:** Sign up, create cluster, configure TLS, add users via dashboard

### 3.2 Mobile App Architecture

#### Recommended Architecture: Clean Architecture + MVVM

**Directory Structure (React Native):**
```
src/
├── app/
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── config/
│   │   ├── mqtt.config.ts
│   │   ├── api.config.ts
│   │   └── app.config.ts
│   └── App.tsx
├── features/
│   ├── auth/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── store/
│   ├── device/
│   │   ├── screens/
│   │   │   ├── DeviceListScreen.tsx
│   │   │   ├── AddDeviceScreen.tsx
│   │   │   └── DeviceSettingsScreen.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   │   ├── useDeviceConnection.ts
│   │   │   └── useDeviceControl.ts
│   │   └── store/
│   ├── temperature/
│   │   ├── screens/
│   │   │   ├── DashboardScreen.tsx
│   │   │   └── HistoryScreen.tsx
│   │   ├── components/
│   │   │   ├── TemperatureGauge.tsx
│   │   │   ├── TemperatureChart.tsx
│   │   │   └── ControlButtons.tsx
│   │   ├── hooks/
│   │   │   └── useTemperatureMonitoring.ts
│   │   └── store/
│   ├── timer/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── store/
│   └── onboarding/
│       ├── screens/
│       ├── components/
│       └── hooks/
├── shared/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── hooks/
│   │   ├── useAsync.ts
│   │   └── useMQTT.ts
│   ├── utils/
│   │   ├── temperature.util.ts
│   │   ├── date.util.ts
│   │   └── validation.util.ts
│   └── constants/
│       └── colors.ts
├── services/
│   ├── mqtt/
│   │   ├── MqttClient.ts
│   │   ├── MqttManager.ts
│   │   └── types.ts
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.api.ts
│   │   ├── device.api.ts
│   │   └── telemetry.api.ts
│   ├── storage/
│   │   └── SecureStorage.ts
│   └── notifications/
│       └── NotificationService.ts
├── store/
│   ├── index.ts
│   ├── rootReducer.ts
│   └── middleware.ts
└── types/
    ├── device.types.ts
    ├── temperature.types.ts
    └── user.types.ts
```

#### Key Components

**MQTT Manager Service:**
```typescript
// src/services/mqtt/MqttManager.ts
import mqtt, { MqttClient } from 'mqtt/dist/mqtt';

class MQTTManager {
  private client: MqttClient | null = null;
  private readonly brokerUrl = 'wss://mqtt.yourdomain.com:9001';

  async connect(clientId: string, username: string, password: string) {
    this.client = mqtt.connect(this.brokerUrl, {
      clientId,
      username,
      password,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      will: {
        topic: `smartlunchbox/${clientId}/status/online`,
        payload: 'offline',
        qos: 1,
        retain: true
      }
    });

    return new Promise((resolve, reject) => {
      this.client?.on('connect', () => {
        console.log('MQTT Connected');
        resolve(true);
      });

      this.client?.on('error', (error) => {
        console.error('MQTT Error:', error);
        reject(error);
      });
    });
  }

  subscribe(topic: string, qos: 0 | 1 | 2 = 1) {
    return new Promise((resolve, reject) => {
      this.client?.subscribe(topic, { qos }, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  publish(topic: string, message: string | object, qos: 0 | 1 | 2 = 1) {
    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    return new Promise((resolve, reject) => {
      this.client?.publish(topic, payload, { qos }, (err) => {
        if (err) reject(err);
        else resolve(true);
      });
    });
  }

  onMessage(callback: (topic: string, message: Buffer) => void) {
    this.client?.on('message', callback);
  }

  disconnect() {
    this.client?.end();
    this.client = null;
  }
}

export default new MQTTManager();
```

**Temperature Monitoring Hook:**
```typescript
// src/features/temperature/hooks/useTemperatureMonitoring.ts
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import MQTTManager from '@/services/mqtt/MqttManager';

interface TemperatureData {
  foodTemp: number;
  ambientTemp: number;
  humidity: number;
  timestamp: number;
  mode: 'heating' | 'cooling' | 'idle';
  connected: boolean;
}

export const useTemperatureMonitoring = (deviceId: string) => {
  const [temperatureData, setTemperatureData] = useState<TemperatureData>({
    foodTemp: 0,
    ambientTemp: 0,
    humidity: 0,
    timestamp: Date.now(),
    mode: 'idle',
    connected: false
  });

  useEffect(() => {
    const topic = `smartlunchbox/${deviceId}/temperature/current`;

    MQTTManager.subscribe(topic);

    const handleMessage = (receivedTopic: string, message: Buffer) => {
      if (receivedTopic === topic) {
        try {
          const data = JSON.parse(message.toString());
          setTemperatureData({
            foodTemp: data.temperature,
            ambientTemp: data.ambient_temperature,
            humidity: data.humidity,
            timestamp: data.timestamp * 1000,
            mode: data.mode,
            connected: true
          });
        } catch (error) {
          console.error('Failed to parse temperature data:', error);
        }
      }
    };

    MQTTManager.onMessage(handleMessage);

    // Timeout check
    const timeoutId = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - temperatureData.timestamp;
      if (timeSinceLastUpdate > 10000) {
        setTemperatureData(prev => ({ ...prev, connected: false }));
      }
    }, 5000);

    return () => {
      clearInterval(timeoutId);
    };
  }, [deviceId]);

  return temperatureData;
};
```

**Device Control Hook:**
```typescript
// src/features/device/hooks/useDeviceControl.ts
import MQTTManager from '@/services/mqtt/MqttManager';

interface ControlCommand {
  action: 'start' | 'stop';
  targetTemp?: number;
  maxDuration?: number;
}

export const useDeviceControl = (deviceId: string) => {
  const startHeating = async (targetTemp: number, duration: number = 3600) => {
    const command: ControlCommand = {
      action: 'start',
      targetTemp,
      maxDuration: duration
    };

    await MQTTManager.publish(
      `smartlunchbox/${deviceId}/control/heat`,
      command,
      1
    );
  };

  const stopHeating = async () => {
    const command: ControlCommand = { action: 'stop' };
    await MQTTManager.publish(
      `smartlunchbox/${deviceId}/control/heat`,
      command,
      1
    );
  };

  const startCooling = async (targetTemp: number, duration: number = 7200) => {
    const command: ControlCommand = {
      action: 'start',
      targetTemp,
      maxDuration: duration
    };

    await MQTTManager.publish(
      `smartlunchbox/${deviceId}/control/cool`,
      command,
      1
    );
  };

  const stopCooling = async () => {
    const command: ControlCommand = { action: 'stop' };
    await MQTTManager.publish(
      `smartlunchbox/${deviceId}/control/cool`,
      command,
      1
    );
  };

  const setPower = async (state: 'on' | 'off') => {
    await MQTTManager.publish(
      `smartlunchbox/${deviceId}/control/power`,
      { state },
      1
    );
  };

  return {
    startHeating,
    stopHeating,
    startCooling,
    stopCooling,
    setPower
  };
};
```

### 3.3 Backend API Design

#### API Endpoints

**Authentication:**
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

**User Management:**
```
GET    /api/v1/users/me
PUT    /api/v1/users/me
DELETE /api/v1/users/me
PUT    /api/v1/users/me/preferences
GET    /api/v1/users/me/devices
```

**Device Management:**
```
POST   /api/v1/devices              # Register new device
GET    /api/v1/devices              # List user's devices
GET    /api/v1/devices/:id          # Get device details
PUT    /api/v1/devices/:id          # Update device settings
DELETE /api/v1/devices/:id          # Remove device
POST   /api/v1/devices/:id/pair     # Complete pairing
GET    /api/v1/devices/:id/status   # Get current status
```

**Telemetry:**
```
GET    /api/v1/devices/:id/temperature/current
GET    /api/v1/devices/:id/temperature/history?start=&end=&interval=
POST   /api/v1/devices/:id/temperature/alert
GET    /api/v1/devices/:id/temperature/alerts
DELETE /api/v1/devices/:id/temperature/alerts/:alertId
```

**Timer/Schedule:**
```
POST   /api/v1/devices/:id/schedules
GET    /api/v1/devices/:id/schedules
GET    /api/v1/devices/:id/schedules/:scheduleId
PUT    /api/v1/devices/:id/schedules/:scheduleId
DELETE /api/v1/devices/:id/schedules/:scheduleId
POST   /api/v1/devices/:id/schedules/:scheduleId/enable
POST   /api/v1/devices/:id/schedules/:scheduleId/disable
```

**Firmware:**
```
GET    /api/v1/firmware/versions
GET    /api/v1/firmware/:version/download
POST   /api/v1/devices/:id/firmware/update
GET    /api/v1/devices/:id/firmware/status
```

#### Example API Implementation (Lambda + API Gateway)

**Device Registration Endpoint:**
```typescript
// lambda/devices/register.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamodb = new DynamoDB.DocumentClient();
const DEVICES_TABLE = process.env.DEVICES_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims.sub;
    const { device_id, device_name } = JSON.parse(event.body || '{}');

    if (!device_id || !device_name) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'device_id and device_name required' })
      };
    }

    // Check if device already registered
    const existing = await dynamodb.get({
      TableName: DEVICES_TABLE,
      Key: { device_id }
    }).promise();

    if (existing.Item && existing.Item.user_id !== userId) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'Device already registered to another user' })
      };
    }

    // Register device
    const device = {
      device_id,
      user_id: userId,
      device_name,
      firmware_version: '0.0.0',
      registered_at: Date.now(),
      last_online: null,
      status: 'offline',
      settings: {
        temperature_unit: 'celsius',
        notifications_enabled: true
      }
    };

    await dynamodb.put({
      TableName: DEVICES_TABLE,
      Item: device
    }).promise();

    // Create MQTT credentials for device
    // (Implementation depends on MQTT broker)

    return {
      statusCode: 201,
      body: JSON.stringify({
        device: device,
        mqtt: {
          broker: 'wss://mqtt.yourdomain.com:9001',
          clientId: device_id,
          username: `device_${device_id}`,
          // password would be generated and returned once
        }
      })
    };
  } catch (error) {
    console.error('Error registering device:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
```

**Temperature History Endpoint:**
```typescript
// lambda/telemetry/history.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();
const TELEMETRY_TABLE = process.env.TELEMETRY_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const deviceId = event.pathParameters?.id;
    const startTime = parseInt(event.queryStringParameters?.start || '0');
    const endTime = parseInt(event.queryStringParameters?.end || Date.now().toString());
    const interval = event.queryStringParameters?.interval || 'raw'; // raw, 1m, 5m, 1h

    // Query temperature data
    const result = await dynamodb.query({
      TableName: TELEMETRY_TABLE,
      KeyConditionExpression: 'device_id = :deviceId AND #ts BETWEEN :start AND :end',
      ExpressionAttributeNames: {
        '#ts': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':deviceId': deviceId,
        ':start': startTime,
        ':end': endTime
      },
      ScanIndexForward: true
    }).promise();

    let data = result.Items || [];

    // Apply aggregation if interval specified
    if (interval !== 'raw') {
      data = aggregateData(data, interval);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        device_id: deviceId,
        start: startTime,
        end: endTime,
        interval,
        count: data.length,
        data: data.map(item => ({
          timestamp: item.timestamp,
          temperature: item.temperature,
          humidity: item.humidity,
          mode: item.mode
        }))
      })
    };
  } catch (error) {
    console.error('Error fetching temperature history:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

function aggregateData(data: any[], interval: string): any[] {
  const intervalMs = {
    '1m': 60000,
    '5m': 300000,
    '1h': 3600000
  }[interval] || 60000;

  const buckets = new Map();

  data.forEach(item => {
    const bucketKey = Math.floor(item.timestamp / intervalMs) * intervalMs;
    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, []);
    }
    buckets.get(bucketKey).push(item);
  });

  return Array.from(buckets.entries()).map(([timestamp, items]) => ({
    timestamp,
    temperature: items.reduce((sum: number, item: any) => sum + item.temperature, 0) / items.length,
    humidity: items.reduce((sum: number, item: any) => sum + item.humidity, 0) / items.length,
    mode: items[items.length - 1].mode
  }));
}
```

### 3.4 Hardware Communication Protocol

#### Device Firmware (ESP32)

**Main Loop Structure:**
```cpp
// main.cpp (Arduino framework)
#include <WiFi.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>
#include <ArduinoJson.h>

// Pin definitions
#define TEMP_SENSOR_PIN 4
#define DHT_PIN 5
#define HEAT_RELAY_PIN 18
#define COOL_RELAY_PIN 19
#define FAN_PIN 21
#define LED_PIN 22
#define SAFETY_PIN 23

// Sensor objects
OneWire oneWire(TEMP_SENSOR_PIN);
DallasTemperature foodTempSensor(&oneWire);
DHT dht(DHT_PIN, DHT22);

// MQTT client
WiFiClientSecure espClient;
PubSubClient mqttClient(espClient);

// Global state
struct DeviceState {
  float currentTemp;
  float targetTemp;
  float ambientTemp;
  float humidity;
  String mode; // "idle", "heating", "cooling"
  bool powerOn;
  unsigned long heatingStartTime;
  unsigned long coolingStartTime;
  unsigned long maxHeatingDuration;
  unsigned long maxCoolingDuration;
} state;

// Configuration
const char* WIFI_SSID = ""; // Set during provisioning
const char* WIFI_PASSWORD = ""; // Set during provisioning
const char* MQTT_BROKER = "mqtt.yourdomain.com";
const int MQTT_PORT = 8883;
const char* DEVICE_ID = "LB-XXXXXX"; // Unique device ID

void setup() {
  Serial.begin(115200);

  // Initialize pins
  pinMode(HEAT_RELAY_PIN, OUTPUT);
  pinMode(COOL_RELAY_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(SAFETY_PIN, INPUT_PULLUP);

  // Initialize sensors
  foodTempSensor.begin();
  dht.begin();

  // Connect to WiFi
  connectWiFi();

  // Setup MQTT
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setKeepAlive(60);

  // Connect to MQTT broker
  connectMQTT();
}

void loop() {
  // Maintain MQTT connection
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  // Read sensors
  readSensors();

  // Safety checks
  performSafetyChecks();

  // Control logic
  updateControlLogic();

  // Publish telemetry
  publishTelemetry();

  delay(2000); // 2 second update interval
}

void readSensors() {
  foodTempSensor.requestTemperatures();
  state.currentTemp = foodTempSensor.getTempCByIndex(0);
  state.ambientTemp = dht.readTemperature();
  state.humidity = dht.readHumidity();
}

void performSafetyChecks() {
  // Check safety cutoff pin
  if (digitalRead(SAFETY_PIN) == LOW) {
    emergencyShutdown("Safety pin triggered");
    return;
  }

  // Check over-temperature
  if (state.currentTemp > 70.0) {
    emergencyShutdown("Over-temperature");
    return;
  }

  // Check heating timeout
  if (state.mode == "heating" &&
      (millis() - state.heatingStartTime) > state.maxHeatingDuration) {
    stopHeating();
    publishAlert("Heating timeout reached");
  }

  // Check cooling timeout
  if (state.mode == "cooling" &&
      (millis() - state.coolingStartTime) > state.maxCoolingDuration) {
    stopCooling();
    publishAlert("Cooling timeout reached");
  }

  // Check if target reached
  if (state.mode == "heating" && state.currentTemp >= state.targetTemp) {
    stopHeating();
    publishAlert("Target temperature reached");
  }

  if (state.mode == "cooling" && state.currentTemp <= state.targetTemp) {
    stopCooling();
    publishAlert("Target temperature reached");
  }
}

void updateControlLogic() {
  // Heating control
  if (state.mode == "heating") {
    digitalWrite(HEAT_RELAY_PIN, HIGH);
    analogWrite(FAN_PIN, 200); // Fan at ~80%
  } else {
    digitalWrite(HEAT_RELAY_PIN, LOW);
  }

  // Cooling control
  if (state.mode == "cooling") {
    digitalWrite(COOL_RELAY_PIN, HIGH);
    analogWrite(FAN_PIN, 255); // Fan at 100%
  } else {
    digitalWrite(COOL_RELAY_PIN, LOW);
  }

  // Idle mode
  if (state.mode == "idle") {
    analogWrite(FAN_PIN, 0); // Fan off
  }

  // Status LED
  if (state.powerOn) {
    digitalWrite(LED_PIN, (millis() / 500) % 2); // Blink
  } else {
    digitalWrite(LED_PIN, LOW);
  }
}

void publishTelemetry() {
  static unsigned long lastPublish = 0;
  if (millis() - lastPublish < 2000) return; // 2 second interval
  lastPublish = millis();

  StaticJsonDocument<256> doc;
  doc["timestamp"] = millis() / 1000;
  doc["temperature"] = state.currentTemp;
  doc["ambient_temperature"] = state.ambientTemp;
  doc["humidity"] = state.humidity;
  doc["mode"] = state.mode;
  doc["target_temperature"] = state.targetTemp;
  doc["power_on"] = state.powerOn;

  char buffer[256];
  serializeJson(doc, buffer);

  String topic = "smartlunchbox/" + String(DEVICE_ID) + "/temperature/current";
  mqttClient.publish(topic.c_str(), buffer, false);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String topicStr = String(topic);
  String payloadStr = "";
  for (unsigned int i = 0; i < length; i++) {
    payloadStr += (char)payload[i];
  }

  Serial.println("Received: " + topicStr + " = " + payloadStr);

  // Parse JSON payload
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, payloadStr);
  if (error) {
    Serial.println("JSON parse error");
    return;
  }

  // Handle heating control
  if (topicStr.endsWith("/control/heat")) {
    String action = doc["action"];
    if (action == "start") {
      state.targetTemp = doc["targetTemp"];
      state.maxHeatingDuration = doc["maxDuration"] | 3600000; // Default 1 hour
      startHeating();
    } else if (action == "stop") {
      stopHeating();
    }
  }

  // Handle cooling control
  if (topicStr.endsWith("/control/cool")) {
    String action = doc["action"];
    if (action == "start") {
      state.targetTemp = doc["targetTemp"];
      state.maxCoolingDuration = doc["maxDuration"] | 7200000; // Default 2 hours
      startCooling();
    } else if (action == "stop") {
      stopCooling();
    }
  }

  // Handle power control
  if (topicStr.endsWith("/control/power")) {
    String stateStr = doc["state"];
    if (stateStr == "on") {
      state.powerOn = true;
    } else {
      state.powerOn = false;
      stopHeating();
      stopCooling();
    }
  }
}

void startHeating() {
  if (state.currentTemp > 60.0) {
    publishAlert("Temperature too high to start heating");
    return;
  }
  state.mode = "heating";
  state.heatingStartTime = millis();
  Serial.println("Started heating to " + String(state.targetTemp) + "C");
}

void stopHeating() {
  state.mode = "idle";
  digitalWrite(HEAT_RELAY_PIN, LOW);
  Serial.println("Stopped heating");
}

void startCooling() {
  if (state.currentTemp < 5.0) {
    publishAlert("Temperature too low to start cooling");
    return;
  }
  state.mode = "cooling";
  state.coolingStartTime = millis();
  Serial.println("Started cooling to " + String(state.targetTemp) + "C");
}

void stopCooling() {
  state.mode = "idle";
  digitalWrite(COOL_RELAY_PIN, LOW);
  Serial.println("Stopped cooling");
}

void emergencyShutdown(String reason) {
  stopHeating();
  stopCooling();
  state.powerOn = false;
  publishAlert("EMERGENCY SHUTDOWN: " + reason);
  Serial.println("EMERGENCY SHUTDOWN: " + reason);
}

void publishAlert(String message) {
  StaticJsonDocument<128> doc;
  doc["timestamp"] = millis() / 1000;
  doc["type"] = "alert";
  doc["message"] = message;

  char buffer[128];
  serializeJson(doc, buffer);

  String topic = "smartlunchbox/" + String(DEVICE_ID) + "/alerts";
  mqttClient.publish(topic.c_str(), buffer, true); // Retained
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.println("IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nWiFi connection failed");
  }
}

void connectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Connecting to MQTT...");

    String clientId = "SmartLunchbox-" + String(DEVICE_ID);
    String willTopic = "smartlunchbox/" + String(DEVICE_ID) + "/status/online";

    if (mqttClient.connect(clientId.c_str(), "username", "password",
                           willTopic.c_str(), 1, true, "offline")) {
      Serial.println("connected");

      // Publish online status
      mqttClient.publish(willTopic.c_str(), "online", true);

      // Subscribe to control topics
      String baseTopic = "smartlunchbox/" + String(DEVICE_ID);
      mqttClient.subscribe((baseTopic + "/control/#").c_str());
      mqttClient.subscribe((baseTopic + "/timer/#").c_str());
      mqttClient.subscribe((baseTopic + "/firmware/#").c_str());

    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}
```

**BLE Provisioning (WiFi Setup):**
```cpp
// ble_provisioning.cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHAR_WIFI_SSID_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define CHAR_WIFI_PASS_UUID "1c95d5e3-d8f7-413a-bf3d-7a2e5d7be87e"
#define CHAR_STATUS_UUID    "9a8ca5b4-3e9c-4e3d-9c51-5f3a8b6c7d8e"

BLEServer* pServer = NULL;
BLECharacteristic* pCharStatus = NULL;
bool deviceConnected = false;
bool wifiConfigured = false;
String newSSID = "";
String newPassword = "";

class ServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
  }
};

class WiFiSSIDCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) {
    std::string value = pCharacteristic->getValue();
    newSSID = String(value.c_str());
    Serial.println("Received SSID: " + newSSID);
  }
};

class WiFiPasswordCallbacks: public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic* pCharacteristic) {
    std::string value = pCharacteristic->getValue();
    newPassword = String(value.c_str());
    Serial.println("Received Password");

    // Trigger WiFi connection attempt
    wifiConfigured = true;
  }
};

void setupBLEProvisioning() {
  BLEDevice::init("SmartLunchbox-" + String(DEVICE_ID));
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService* pService = pServer->createService(SERVICE_UUID);

  BLECharacteristic* pCharSSID = pService->createCharacteristic(
    CHAR_WIFI_SSID_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pCharSSID->setCallbacks(new WiFiSSIDCallbacks());

  BLECharacteristic* pCharPassword = pService->createCharacteristic(
    CHAR_WIFI_PASS_UUID,
    BLECharacteristic::PROPERTY_WRITE
  );
  pCharPassword->setCallbacks(new WiFiPasswordCallbacks());

  pCharStatus = pService->createCharacteristic(
    CHAR_STATUS_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
  );
  pCharStatus->addDescriptor(new BLE2902());

  pService->start();

  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("BLE Provisioning started");
}

void updateBLEStatus(String status) {
  if (pCharStatus != NULL) {
    pCharStatus->setValue(status.c_str());
    pCharStatus->notify();
  }
}
```

---

## 4. HARDWARE INTEGRATION

### 4.1 ESP32/WiFi Module Specifications

#### Recommended Module: ESP32-WROOM-32D

**Technical Specifications:**
- **CPU:** Xtensa dual-core 32-bit LX6, up to 240 MHz
- **Flash:** 4 MB
- **SRAM:** 520 KB
- **Wi-Fi:** 802.11 b/g/n (2.4 GHz only)
- **Bluetooth:** BLE 4.2 and Classic
- **GPIO:** 34 programmable pins
- **ADC:** 18 channels, 12-bit
- **DAC:** 2 channels, 8-bit
- **PWM:** 16 channels
- **UART:** 3 interfaces
- **SPI:** 4 interfaces
- **I2C:** 2 interfaces
- **Operating Voltage:** 2.2V - 3.6V
- **Operating Temperature:** -40°C to +85°C
- **Dimensions:** 18mm x 25.5mm x 3.1mm

**Why ESP32:**
- Built-in Wi-Fi and BLE
- Low cost ($3-5 per unit)
- Large community support
- Arduino and ESP-IDF framework support
- OTA update capability
- Sufficient processing power for MQTT and sensor management
- Low power modes for battery operation

**Alternative:** ESP32-S3
- Better performance (240 MHz dual-core)
- More RAM (512 KB SRAM)
- USB OTG support
- Better for future expansions

### 4.2 Temperature Sensor Integration

#### Primary Sensor: DS18B20 (Food Temperature)

**Specifications:**
- **Type:** Digital temperature sensor
- **Interface:** 1-Wire protocol
- **Range:** -55°C to +125°C
- **Accuracy:** ±0.5°C (-10°C to +85°C)
- **Resolution:** 9-12 bit (configurable)
- **Response Time:** 750ms (12-bit resolution)
- **Supply Voltage:** 3.0V - 5.5V
- **Current:** 1mA active, 1µA standby

**Wiring (Waterproof Probe Version):**
```
DS18B20         ESP32
-------         -----
Red (VCC)   --> 3.3V
Black (GND) --> GND
Yellow (DQ) --> GPIO 4 (with 4.7kΩ pull-up to 3.3V)
```

**Library:** DallasTemperature
```cpp
#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 4
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

void setup() {
  sensors.begin();
  sensors.setResolution(12); // 12-bit resolution
}

float readFoodTemperature() {
  sensors.requestTemperatures();
  return sensors.getTempCByIndex(0);
}
```

**Mounting:**
- Waterproof probe inserted into lunchbox interior
- Probe tip positioned in center of food compartment
- Cable sealed through grommet in lunchbox wall

#### Secondary Sensor: DHT22 (Ambient/Enclosure)

**Specifications:**
- **Type:** Digital humidity and temperature sensor
- **Interface:** Single-wire digital
- **Temperature Range:** -40°C to +80°C
- **Temperature Accuracy:** ±0.5°C
- **Humidity Range:** 0-100% RH
- **Humidity Accuracy:** ±2-5% RH
- **Supply Voltage:** 3.3V - 6V
- **Current:** 1-1.5mA

**Wiring:**
```
DHT22           ESP32
-----           -----
VCC         --> 3.3V
GND         --> GND
DATA        --> GPIO 5 (with 10kΩ pull-up to 3.3V)
```

**Library:** DHT sensor library
```cpp
#include <DHT.h>

#define DHT_PIN 5
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  dht.begin();
}

struct AmbientData {
  float temperature;
  float humidity;
};

AmbientData readAmbient() {
  AmbientData data;
  data.temperature = dht.readTemperature();
  data.humidity = dht.readHumidity();
  return data;
}
```

**Mounting:**
- Inside electronics enclosure
- Away from heat sources
- Ventilated area for accurate readings

### 4.3 Peltier Module Control

#### Peltier Module: TEC1-12706

**Specifications:**
- **Maximum Voltage:** 15V DC
- **Maximum Current:** 6A
- **Maximum Power:** 72W
- **Temperature Difference:** 66°C
- **Hot Side Temperature:** 50°C
- **Dimensions:** 40mm x 40mm x 3.6mm
- **Resistance:** ~2Ω

**Operating Principle:**
- Forward current: Heating mode (hot side heats food)
- Reverse current: Cooling mode (cold side cools food)
- Must use H-bridge or relay switching for mode change

**Control Circuit: H-Bridge with MOSFET**

**Components:**
- 4x IRF3205 N-channel MOSFETs (55V, 110A, 8mΩ)
- 4x 10kΩ pull-down resistors
- 4x 1N4007 flyback diodes
- MOSFET driver: IR2104 (high-side and low-side driver)

**Circuit Schematic (Simplified):**
```
                    +12V
                     |
            Q1       |       Q2
           _|_       |      _|_
          | N |------+-----| N |
          |___|             |___|
            |                 |
            +-------[TEC]-----+
            |                 |
          __|__             __|__
          | N |             | N |
          |___|             |___|
           Q3                 Q4
            |                 |
           GND               GND

Control:
- Heating: Q1 + Q4 ON, Q2 + Q3 OFF
- Cooling: Q2 + Q3 ON, Q1 + Q4 OFF
- OFF: All MOSFETs OFF
```

**ESP32 Control:**
```cpp
#define HEAT_PIN 18  // Control Q1+Q4 (heating)
#define COOL_PIN 19  // Control Q2+Q3 (cooling)

void setup() {
  pinMode(HEAT_PIN, OUTPUT);
  pinMode(COOL_PIN, OUTPUT);
  digitalWrite(HEAT_PIN, LOW);
  digitalWrite(COOL_PIN, LOW);
}

void enableHeating() {
  digitalWrite(COOL_PIN, LOW);  // Ensure cooling is off
  delay(100);                   // Dead time
  digitalWrite(HEAT_PIN, HIGH);
}

void enableCooling() {
  digitalWrite(HEAT_PIN, LOW);  // Ensure heating is off
  delay(100);                   // Dead time
  digitalWrite(COOL_PIN, HIGH);
}

void disablePeltier() {
  digitalWrite(HEAT_PIN, LOW);
  digitalWrite(COOL_PIN, LOW);
}
```

**Alternative: Relay Module (Simpler but less efficient)**
```
Components:
- 2x SPDT 10A relays (or 1x DPDT relay)
- 2x 2N2222 NPN transistors
- 2x 1N4007 flyback diodes
- 2x 1kΩ base resistors

Heating mode: Relay 1 activated, current flows forward
Cooling mode: Relay 2 activated, current flows reverse
```

**Heat Dissipation:**
- **Heat Sink:** Aluminum 60mm x 60mm x 10mm minimum
- **Thermal Paste:** Between Peltier and heat sink
- **Fan:** 12V 60mm x 60mm, 0.2A, 30 CFM minimum
- **Fan Control:** PWM via GPIO 21

```cpp
#define FAN_PIN 21

void setup() {
  pinMode(FAN_PIN, OUTPUT);
  ledcSetup(0, 25000, 8); // 25 kHz, 8-bit resolution
  ledcAttachPin(FAN_PIN, 0);
}

void setFanSpeed(uint8_t speed) { // 0-255
  ledcWrite(0, speed);
}
```

### 4.4 Power Management

#### Power Supply Design

**Option 1: AC Powered (Recommended for MVP)**

**Components:**
- **AC/DC Converter:** Mean Well RS-150-12 or similar
  - Input: 100-240V AC, 50/60Hz
  - Output: 12V DC, 10A (120W)
  - Efficiency: >85%
  - Protection: Overcurrent, overvoltage, short circuit
  - Cost: ~$25-30

- **Step-Down Converter (12V to 3.3V):**
  - Module: LM2596 or MP1584
  - Output: 3.3V, 3A
  - For ESP32 and sensors
  - Cost: ~$2-3

**Power Distribution:**
```
AC Input (110/220V)
  |
  v
AC/DC Converter (Mean Well)
  |
  +-- 12V 10A ---+--> Peltier Module (6A max)
                 |
                 +--> Fan (0.2A)
                 |
                 +--> Buck Converter --> 3.3V --> ESP32, Sensors
```

**Current Budget:**
```
Peltier (max):        6.0A @ 12V = 72W
Fan:                  0.2A @ 12V = 2.4W
ESP32 + Sensors:      0.5A @ 3.3V = 1.65W
-------------------------------------------
Total:                ~76W (peak during heating)
Power Supply:         120W (50% margin)
```

**Safety Features:**
- Thermal fuse on Peltier hot side (73°C cutoff)
- Overcurrent protection in power supply
- Overvoltage protection
- Ground fault protection
- Insulated enclosure

**Option 2: Battery Powered (Future Phase)**

**Battery Pack:**
- **Cells:** 9x Samsung INR18650-35E
- **Configuration:** 3S3P (3 series, 3 parallel)
- **Voltage:** 11.1V nominal (12.6V max, 9V min)
- **Capacity:** 10,500 mAh
- **Energy:** 116.55 Wh
- **Weight:** ~420g

**Battery Management System (BMS):**
- 3S BMS with balancing
- Overcurrent protection: 15A
- Overvoltage protection: 4.2V per cell
- Undervoltage protection: 2.5V per cell
- Temperature monitoring
- Short circuit protection

**Runtime Estimate:**
```
Heating mode (72W):
  Current draw = 72W / 11.1V = 6.5A
  Runtime = 10,500 mAh / 6,500 mA = 1.6 hours

Idle mode (2W):
  Current draw = 2W / 11.1V = 0.18A
  Runtime = 10,500 mAh / 180 mA = 58 hours

Mixed usage (20% heating, 80% idle):
  Average power = 0.2 * 72W + 0.8 * 2W = 16W
  Average current = 16W / 11.1V = 1.44A
  Runtime = 10,500 mAh / 1,440 mA = 7.3 hours
```

**Charging:**
- USB-C PD input (up to 65W)
- Charge time: ~2-3 hours
- Charge indicator LED

**Power Management MCU Code:**
```cpp
#define BATTERY_VOLTAGE_PIN 34  // ADC pin
#define CHARGING_PIN 35
#define LOW_BATTERY_THRESHOLD 9.0  // Volts

float readBatteryVoltage() {
  int rawValue = analogRead(BATTERY_VOLTAGE_PIN);
  // Voltage divider: 12V -> 3.3V (R1=10kΩ, R2=3.3kΩ)
  float voltage = (rawValue / 4095.0) * 3.3 * (10 + 3.3) / 3.3;
  return voltage;
}

bool isBatteryLow() {
  return readBatteryVoltage() < LOW_BATTERY_THRESHOLD;
}

bool isCharging() {
  return digitalRead(CHARGING_PIN) == HIGH;
}

void checkBattery() {
  if (isBatteryLow() && !isCharging()) {
    // Disable heating/cooling
    disablePeltier();
    publishAlert("Low battery - operations disabled");
  }
}
```

---

## 5. TESTING & DEPLOYMENT

### 5.1 Hardware Testing Procedures

#### Pre-Assembly Testing

**Component Testing:**
```
Test Plan: HW-TEST-001 - Component Verification
Objective: Verify all individual components function correctly

Components to test:
1. ESP32 Module
   - Upload test sketch
   - Verify serial output
   - Test Wi-Fi connectivity
   - Test GPIO pins
   - Pass/Fail: ___

2. DS18B20 Temperature Sensor
   - Connect to test circuit
   - Read temperature values
   - Verify accuracy (±0.5°C against reference thermometer)
   - Test response time (<1 second)
   - Pass/Fail: ___

3. DHT22 Sensor
   - Connect to test circuit
   - Read temperature and humidity
   - Verify accuracy
   - Test response time (<2 seconds)
   - Pass/Fail: ___

4. Peltier Module
   - Visual inspection (no cracks)
   - Resistance measurement (should be ~2Ω)
   - Test heating (apply 12V, hot side should heat up)
   - Test cooling (reverse polarity, cold side should cool)
   - Pass/Fail: ___

5. Power Supply
   - Check output voltage (12V ±0.5V)
   - Load test (10A for 1 hour, should not overheat)
   - Check ripple (<100mV)
   - Verify protections (short circuit, overcurrent)
   - Pass/Fail: ___

6. MOSFETs/Relays
   - Continuity test
   - Switching test with multimeter
   - Load test with Peltier
   - Check for excessive heating
   - Pass/Fail: ___
```

#### Assembly Testing

**Test Plan: HW-TEST-002 - Assembled Unit**
```
Objective: Verify complete hardware assembly

1. Power-On Test
   - Connect power supply
   - Check LED indicators
   - Measure voltage rails (12V, 3.3V)
   - ESP32 boots successfully
   - Pass/Fail: ___

2. Sensor Integration
   - All sensors detected by ESP32
   - Temperature readings accurate
   - Continuous data stream (no dropouts)
   - Pass/Fail: ___

3. Peltier Control
   - Heating mode activates correctly
   - Cooling mode activates correctly
   - No simultaneous heating/cooling
   - Switching dead time observed (>100ms)
   - Pass/Fail: ___

4. WiFi Connectivity
   - ESP32 connects to test Wi-Fi network
   - Stable connection (no disconnects for 10 minutes)
   - Reconnects automatically after power cycle
   - Pass/Fail: ___

5. MQTT Communication
   - Connects to MQTT broker
   - Publishes telemetry data
   - Receives control commands
   - QoS levels respected
   - Pass/Fail: ___
```

#### Thermal Performance Testing

**Test Plan: HW-TEST-003 - Heating Performance**
```
Objective: Verify heating capabilities

Setup:
- Fill lunchbox with 500ml water at room temperature (20°C)
- Place food temperature sensor in water
- Close lunchbox lid
- Target temperature: 45°C

Test Procedure:
1. Record initial temperature: ___ °C
2. Start heating mode
3. Record temperature every 60 seconds
4. Measure time to reach 45°C: ___ minutes
5. Verify auto-shutoff at target temperature
6. Measure temperature overshoot: ___ °C
7. Check maximum hot side temperature: ___ °C (should be <70°C)

Acceptance Criteria:
- Time to reach 45°C: <20 minutes
- Overshoot: <3°C
- Hot side temp: <70°C
- Pass/Fail: ___

Data Log:
Time (min) | Temp (°C) | Power (W) | Hot Side Temp (°C)
-----------|-----------|-----------|--------------------
0          |           |           |
1          |           |           |
2          |           |           |
...        |           |           |
```

**Test Plan: HW-TEST-004 - Cooling Performance**
```
Objective: Verify cooling capabilities

Setup:
- Fill lunchbox with 500ml water at room temperature (20°C)
- Place food temperature sensor in water
- Close lunchbox lid
- Ambient temperature: 20-25°C
- Target temperature: 10°C

Test Procedure:
1. Record initial temperature: ___ °C
2. Start cooling mode
3. Record temperature every 60 seconds
4. Measure time to reach 10°C: ___ minutes
5. Verify auto-shutoff at target temperature
6. Check minimum achievable temperature: ___ °C
7. Monitor for condensation

Acceptance Criteria:
- Time to reach 10°C: <30 minutes (ambient 20°C)
- Minimum temp: <5°C achievable
- No condensation inside electronics enclosure
- Pass/Fail: ___
```

#### Safety Testing

**Test Plan: HW-TEST-005 - Safety Systems**
```
Objective: Verify all safety mechanisms

1. Over-Temperature Protection
   - Heat lunchbox to 68°C
   - Verify automatic shutdown at 65°C software limit
   - Verify thermal fuse trips at 73°C (destructive test on separate unit)
   - Pass/Fail: ___

2. Timeout Protection
   - Start heating with 5-minute timeout
   - Verify automatic shutoff after 5 minutes
   - Start cooling with 10-minute timeout
   - Verify automatic shutoff after 10 minutes
   - Pass/Fail: ___

3. Short Circuit Protection
   - Simulate short on power output
   - Verify power supply shuts down
   - Verify ESP32 protected (still functional after recovery)
   - Pass/Fail: ___

4. Disconnect Protection
   - Disconnect temperature sensor during operation
   - Verify device enters safe mode
   - Verify alert sent to app
   - Pass/Fail: ___

5. Emergency Stop
   - Trigger safety pin input
   - Verify immediate shutdown (<100ms)
   - Verify all heating/cooling disabled
   - Pass/Fail: ___
```

#### Long-Term Reliability Testing

**Test Plan: HW-TEST-006 - Endurance Test**
```
Objective: Verify reliability over extended operation

Duration: 7 days continuous operation

Test Cycle (repeated):
1. Heat to 45°C (20 min)
2. Idle (40 min)
3. Cool to 10°C (30 min)
4. Idle (40 min)
Total cycle: ~2.5 hours

Metrics to track:
- Number of successful cycles: ___
- Number of failures: ___
- Types of failures: ___
- Temperature sensor drift: ___ °C over 7 days
- Power consumption variance: ___ %
- WiFi disconnections: ___
- MQTT message loss rate: ___ %

Acceptance Criteria:
- >95% successful cycles
- <0.5°C sensor drift
- <1% message loss
- Pass/Fail: ___
```

### 5.2 Mobile App Testing

#### Unit Testing

**Test Coverage Requirements:**
- Minimum 70% code coverage
- 100% coverage for critical paths (control commands, safety checks)

**Example Unit Tests (React Native + Jest):**
```typescript
// __tests__/utils/temperature.util.test.ts
import { celsiusToFahrenheit, fahrenheitToCelsius, formatTemperature } from '@/utils/temperature.util';

describe('Temperature Utilities', () => {
  test('converts Celsius to Fahrenheit correctly', () => {
    expect(celsiusToFahrenheit(0)).toBe(32);
    expect(celsiusToFahrenheit(100)).toBe(212);
    expect(celsiusToFahrenheit(25)).toBe(77);
  });

  test('converts Fahrenheit to Celsius correctly', () => {
    expect(fahrenheitToCelsius(32)).toBe(0);
    expect(fahrenheitToCelsius(212)).toBe(100);
  });

  test('formats temperature with unit', () => {
    expect(formatTemperature(25, 'celsius')).toBe('25°C');
    expect(formatTemperature(77, 'fahrenheit')).toBe('77°F');
  });
});

// __tests__/services/mqtt/MqttManager.test.ts
import MQTTManager from '@/services/mqtt/MqttManager';

jest.mock('mqtt/dist/mqtt');

describe('MQTT Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('connects to MQTT broker successfully', async () => {
    await MQTTManager.connect('test-client-id', 'username', 'password');
    // Assert connection was called with correct parameters
  });

  test('subscribes to topic with correct QoS', async () => {
    await MQTTManager.subscribe('test/topic', 1);
    // Assert subscribe was called
  });

  test('publishes message with correct QoS', async () => {
    await MQTTManager.publish('test/topic', { data: 'test' }, 1);
    // Assert publish was called with JSON stringified message
  });

  test('handles disconnection gracefully', () => {
    MQTTManager.disconnect();
    // Assert client.end() was called
  });
});

// __tests__/hooks/useDeviceControl.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useDeviceControl } from '@/features/device/hooks/useDeviceControl';

describe('useDeviceControl Hook', () => {
  test('startHeating publishes correct MQTT message', async () => {
    const { result } = renderHook(() => useDeviceControl('device-123'));

    await act(async () => {
      await result.current.startHeating(45, 3600);
    });

    // Assert MQTT publish was called with correct topic and payload
  });

  test('stopHeating sends stop command', async () => {
    const { result } = renderHook(() => useDeviceControl('device-123'));

    await act(async () => {
      await result.current.stopHeating();
    });

    // Assert stop command sent
  });
});
```

#### Integration Testing

**Test Plan: APP-TEST-001 - End-to-End Flows**
```
Test Case 1: User Registration and Login
1. Open app
2. Tap "Sign Up"
3. Enter email, password, confirm password
4. Tap "Create Account"
5. Verify email sent
6. Click verification link
7. Login with credentials
Expected: User logged in, redirected to device list
Pass/Fail: ___

Test Case 2: Device Onboarding
1. Login to app
2. Tap "Add Device"
3. Scan for BLE devices
4. Select lunchbox from list
5. Enter Wi-Fi credentials
6. Wait for device to connect
7. Name device "My Lunchbox"
8. Complete setup
Expected: Device appears in device list, shows "Online"
Pass/Fail: ___

Test Case 3: Temperature Monitoring
1. Select device from list
2. View dashboard
3. Observe real-time temperature updates
4. Verify updates every 2 seconds
5. Check temperature gauge reflects current value
6. Navigate to history view
7. View temperature chart (last 24 hours)
Expected: Smooth data updates, accurate graph
Pass/Fail: ___

Test Case 4: Manual Heating Control
1. On dashboard, tap "Heat" button
2. Set target temperature to 45°C
3. Tap "Start Heating"
4. Observe temperature increase
5. Verify heating indicator shows active
6. Wait for target temperature
7. Verify automatic shutoff
Expected: Heating starts, reaches target, auto-stops
Pass/Fail: ___

Test Case 5: Timer Scheduling
1. Navigate to Timer tab
2. Tap "New Schedule"
3. Set time to 12:00 PM
4. Select "Heat" mode
5. Set target to 45°C
6. Enable daily recurrence (weekdays)
7. Save schedule
Expected: Schedule appears in list, notification before start
Pass/Fail: ___

Test Case 6: Alert Notifications
1. Set low temperature alert (10°C)
2. Cool lunchbox below 10°C
3. Verify push notification received
4. Tap notification
5. App opens to device dashboard
6. View alert in notification history
Expected: Timely push notification, correct navigation
Pass/Fail: ___

Test Case 7: Firmware Update
1. Backend pushes new firmware version
2. App shows update notification
3. Tap "Update Now"
4. View download progress
5. Wait for installation
6. Device reboots
7. Verify new firmware version displayed
Expected: Smooth update process, device functional after update
Pass/Fail: ___

Test Case 8: Offline Handling
1. Disconnect device from power
2. Observe app shows "Offline" status
3. Try to send control command
4. Verify error message displayed
5. Reconnect device
6. Verify app shows "Online" status within 30 seconds
Expected: Graceful offline handling, automatic reconnection
Pass/Fail: ___
```

#### Performance Testing

**Test Plan: APP-TEST-002 - Performance Benchmarks**
```
Test Metrics:

1. App Launch Time
   - Cold start: < 3 seconds
   - Warm start: < 1 second
   - Measurement: Time from tap to fully interactive
   - Result: ___ seconds
   - Pass/Fail: ___

2. MQTT Connection Time
   - Time to connect to broker: < 2 seconds
   - Time to receive first message: < 5 seconds
   - Result: ___ seconds
   - Pass/Fail: ___

3. UI Responsiveness
   - Button tap response: < 100ms
   - Screen transition: < 300ms
   - Chart rendering (1000 points): < 500ms
   - Result: ___ ms
   - Pass/Fail: ___

4. Memory Usage
   - Idle: < 100 MB
   - Active (streaming data): < 150 MB
   - After 1 hour: < 200 MB (no memory leaks)
   - Result: ___ MB
   - Pass/Fail: ___

5. Battery Consumption
   - Background (1 hour): < 5% battery drain
   - Active use (1 hour): < 15% battery drain
   - Result: ___ %
   - Pass/Fail: ___

6. Network Usage
   - Data consumption (1 hour monitoring): < 5 MB
   - MQTT overhead: < 10% of total data
   - Result: ___ MB
   - Pass/Fail: ___
```

#### Compatibility Testing

**Test Plan: APP-TEST-003 - Device Compatibility**
```
iOS Devices to test:
- [ ] iPhone SE (3rd gen) - iOS 16
- [ ] iPhone 13 - iOS 17
- [ ] iPhone 15 Pro - iOS 17
- [ ] iPad (9th gen) - iPadOS 16
- [ ] iPad Air (5th gen) - iPadOS 17

Android Devices to test:
- [ ] Samsung Galaxy S21 - Android 12
- [ ] Samsung Galaxy S23 - Android 13
- [ ] Google Pixel 6 - Android 13
- [ ] Google Pixel 8 - Android 14
- [ ] OnePlus 10 Pro - Android 13
- [ ] Samsung Galaxy Tab S8 - Android 12

Test each device for:
1. App installs successfully
2. All features functional
3. UI renders correctly (no clipping, overlaps)
4. BLE provisioning works
5. Push notifications received
6. No crashes during typical usage (1 hour session)

Results:
Device: _________________
iOS/Android Version: ____
Install: Pass/Fail
Features: Pass/Fail
UI: Pass/Fail
BLE: Pass/Fail
Notifications: Pass/Fail
Stability: Pass/Fail
```

### 5.3 Integration Testing

**Test Plan: INT-TEST-001 - Full System Integration**
```
Objective: Verify end-to-end system functionality

Setup:
- Hardware: Fully assembled smart lunchbox
- Mobile App: Latest build on test device
- Backend: Staging environment
- MQTT Broker: Test instance

Test Scenarios:

1. Complete User Journey
   Steps:
   a. New user registers account
   b. User pairs device via BLE
   c. Device connects to WiFi and MQTT
   d. User monitors temperature in real-time
   e. User starts heating to 45°C
   f. Device heats food
   g. User receives notification when target reached
   h. User schedules daily heating for next 5 days
   i. User logs out and logs back in
   j. User views device status and history

   Expected Result: All steps complete successfully
   Pass/Fail: ___

2. Concurrent Users
   Steps:
   a. 3 users with separate devices
   b. All users online simultaneously
   c. Each user controls their device
   d. Verify no cross-device interference
   e. Verify correct data routing

   Expected Result: Isolated control, no data mixing
   Pass/Fail: ___

3. Network Resilience
   Steps:
   a. Start heating cycle
   b. Disconnect device WiFi mid-heating
   c. Device continues local control
   d. Reconnect WiFi after 2 minutes
   e. App syncs state with device

   Expected Result: Graceful handling, state sync
   Pass/Fail: ___

4. High-Frequency Updates
   Steps:
   a. Set temperature update rate to 1 second
   b. Monitor for 10 minutes
   c. Verify no message loss
   d. Verify app remains responsive

   Expected Result: Stable operation, <1% message loss
   Pass/Fail: ___

5. Firmware Update Process
   Steps:
   a. Device on firmware v1.0.0
   b. Backend publishes v1.1.0
   c. App notifies user
   d. User initiates update
   e. Device downloads firmware
   f. Device installs and reboots
   g. Device reconnects and reports v1.1.0
   h. App confirms update

   Expected Result: Successful OTA update
   Pass/Fail: ___
```

### 5.4 Deployment Steps

#### Backend Deployment

**Step 1: AWS Infrastructure Setup (Terraform)**
```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

# IoT Core
resource "aws_iot_thing" "lunchbox_thing" {
  name = "SmartLunchbox-${var.device_id}"
}

resource "aws_iot_certificate" "lunchbox_cert" {
  active = true
}

resource "aws_iot_policy" "lunchbox_policy" {
  name = "SmartLunchbox-Policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["iot:Connect", "iot:Publish", "iot:Subscribe", "iot:Receive"]
        Resource = "*"
      }
    ]
  })
}

# API Gateway
resource "aws_api_gateway_rest_api" "lunchbox_api" {
  name = "SmartLunchbox-API"
  description = "API for Smart Lunchbox app"
}

# DynamoDB Tables
resource "aws_dynamodb_table" "users" {
  name           = "SmartLunchbox-Users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }
}

resource "aws_dynamodb_table" "devices" {
  name           = "SmartLunchbox-Devices"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "device_id"

  attribute {
    name = "device_id"
    type = "S"
  }

  global_secondary_index {
    name            = "UserDevicesIndex"
    hash_key        = "user_id"
    projection_type = "ALL"
  }
}

# Lambda Functions
resource "aws_lambda_function" "device_register" {
  filename      = "lambda/device-register.zip"
  function_name = "SmartLunchbox-DeviceRegister"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  environment {
    variables = {
      DEVICES_TABLE = aws_dynamodb_table.devices.name
    }
  }
}

# S3 Bucket for Firmware
resource "aws_s3_bucket" "firmware" {
  bucket = "smartlunchbox-firmware"

  versioning {
    enabled = true
  }
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "high_error_rate" {
  alarm_name          = "SmartLunchbox-HighErrorRate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "Triggers when Lambda error count exceeds threshold"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
```

**Step 2: Deploy Backend Services**
```bash
# Initialize Terraform
terraform init

# Plan deployment
terraform plan -out=tfplan

# Apply infrastructure
terraform apply tfplan

# Deploy Lambda functions
cd lambda
npm install
npm run build
./deploy.sh

# Configure MQTT broker
cd ../mqtt
./setup-mosquitto.sh

# Setup monitoring
cd ../monitoring
./setup-cloudwatch.sh
```

**Step 3: Database Migration**
```bash
# Run initial migrations
npm run migrate:up

# Seed development data (if needed)
npm run seed
```

#### Mobile App Deployment

**iOS Deployment:**
```bash
# Step 1: Update version
cd ios
agvtool new-version -all 1.0.0

# Step 2: Build release
cd ..
npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle

# Step 3: Archive
xcodebuild -workspace ios/SmartLunchbox.xcworkspace \
  -scheme SmartLunchbox \
  -configuration Release \
  -archivePath build/SmartLunchbox.xcarchive \
  archive

# Step 4: Export IPA
xcodebuild -exportArchive \
  -archivePath build/SmartLunchbox.xcarchive \
  -exportPath build \
  -exportOptionsPlist ios/ExportOptions.plist

# Step 5: Upload to App Store Connect
xcrun altool --upload-app \
  -f build/SmartLunchbox.ipa \
  -t ios \
  -u YOUR_APPLE_ID \
  -p YOUR_APP_SPECIFIC_PASSWORD

# Step 6: Submit for review via App Store Connect
# https://appstoreconnect.apple.com
```

**Android Deployment:**
```bash
# Step 1: Update version
# Edit android/app/build.gradle
# versionCode = 1
# versionName = "1.0.0"

# Step 2: Generate release keystore (first time only)
keytool -genkey -v -keystore android/app/release.keystore \
  -alias smartlunchbox-release \
  -keyalg RSA -keysize 2048 -validity 10000

# Step 3: Build release APK/AAB
cd android
./gradlew bundleRelease

# Step 4: Sign APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore app/release.keystore \
  app/build/outputs/bundle/release/app-release.aab \
  smartlunchbox-release

# Step 5: Upload to Google Play Console
# https://play.google.com/console
# Upload app/build/outputs/bundle/release/app-release.aab

# Step 6: Submit for review
```

#### Hardware Deployment

**Step 1: Flash Production Firmware**
```bash
# Connect ESP32 via USB
# Compile firmware
cd firmware
pio run

# Flash firmware
pio run --target upload

# Flash filesystem (certificates, config)
pio run --target uploadfs

# Verify
pio device monitor
```

**Step 2: Provision Device**
```bash
# Generate unique device ID
DEVICE_ID=$(uuidgen)

# Create AWS IoT Thing
aws iot create-thing --thing-name "SmartLunchbox-${DEVICE_ID}"

# Create and attach certificate
CERT_ARN=$(aws iot create-keys-and-certificate \
  --set-as-active \
  --certificate-pem-outfile certs/${DEVICE_ID}-cert.pem \
  --public-key-outfile certs/${DEVICE_ID}-public.key \
  --private-key-outfile certs/${DEVICE_ID}-private.key \
  --query 'certificateArn' --output text)

# Attach policy
aws iot attach-policy \
  --policy-name SmartLunchbox-Policy \
  --target ${CERT_ARN}

# Flash certificates to device
esptool.py --port /dev/ttyUSB0 \
  write_flash 0x310000 certs/${DEVICE_ID}-cert.pem

# Store device ID in EEPROM
# (via serial command or second flash)
```

**Step 3: Quality Control**
```bash
# Run automated test suite
./test-device.sh ${DEVICE_ID}

# Expected output:
# [PASS] Power on self-test
# [PASS] WiFi connectivity
# [PASS] MQTT connection
# [PASS] Temperature sensors
# [PASS] Heating control
# [PASS] Cooling control
# [PASS] Safety systems
#
# Device ${DEVICE_ID} ready for shipment
```

#### Monitoring and Maintenance

**Step 1: Setup Monitoring Dashboard**
```bash
# Create CloudWatch dashboard
aws cloudwatch put-dashboard \
  --dashboard-name SmartLunchbox-Production \
  --dashboard-body file://monitoring/dashboard.json

# Setup alerting
aws sns create-topic --name SmartLunchbox-Alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:ACCOUNT:SmartLunchbox-Alerts \
  --protocol email \
  --notification-endpoint alerts@yourcompany.com
```

**Step 2: Log Aggregation**
```bash
# Setup Elasticsearch + Kibana (or use CloudWatch Logs Insights)
# Forward Lambda logs to Elasticsearch

# Create saved searches for common issues:
# - High error rate
# - Slow API responses
# - Device disconnections
# - Failed firmware updates
```

**Step 3: Continuous Deployment**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Lambda functions
        run: |
          npm install
          npm run build
          serverless deploy --stage production

  deploy-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and upload iOS
        run: |
          fastlane ios release

  deploy-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and upload Android
        run: |
          fastlane android release
```

---

## 6. APPENDICES

### Appendix A: API Reference

See Section 3.3 for complete API documentation.

### Appendix B: MQTT Message Schemas

See Section 1.2 for MQTT topic structure and message formats.

### Appendix C: Security Considerations

**Authentication:**
- User authentication via AWS Cognito (OAuth 2.0)
- JWT tokens with 1-hour expiration
- Refresh tokens with 30-day expiration
- Device authentication via X.509 certificates

**Encryption:**
- TLS 1.3 for all network communication
- AES-256 for local data at rest
- Certificate pinning in mobile app

**Compliance:**
- GDPR compliance for EU users
- CCPA compliance for California users
- Data retention: 90 days for telemetry, indefinite for account data
- Right to deletion implemented

### Appendix D: Bill of Materials (Detailed)

See Section 2.11 in README for preliminary BOM.

**Production BOM (per unit, 1000 qty):**
| Component | Part Number | Qty | Unit Cost | Total |
|-----------|-------------|-----|-----------|-------|
| ESP32-WROOM-32D | ESP32-WROOM-32D | 1 | $2.50 | $2.50 |
| DS18B20 Waterproof | DS18B20-WP | 1 | $2.00 | $2.00 |
| DHT22 | AM2302 | 1 | $2.50 | $2.50 |
| Peltier TEC1-12706 | TEC1-12706 | 1 | $4.00 | $4.00 |
| Power Supply 12V 10A | MW-RS-150-12 | 1 | $18.00 | $18.00 |
| Buck Converter Module | LM2596 | 1 | $0.80 | $0.80 |
| MOSFET IRF3205 | IRF3205 | 4 | $0.50 | $2.00 |
| MOSFET Driver IR2104 | IR2104 | 2 | $0.60 | $1.20 |
| Heat Sink 60x60x10mm | HS-6010 | 1 | $1.50 | $1.50 |
| Fan 12V 60mm | FAN-6012 | 1 | $2.00 | $2.00 |
| Thermal Fuse 73°C | TF-73C | 1 | $0.30 | $0.30 |
| PCB Custom | PCB-SLB-V1 | 1 | $3.00 | $3.00 |
| Enclosure | ENC-SLB | 1 | $12.00 | $12.00 |
| Thermal Insulation | FOAM-10mm | 1 | $1.00 | $1.00 |
| Connectors & Wire | MISC | 1 | $2.00 | $2.00 |
| Screws, Standoffs | FASTEN | 1 | $1.00 | $1.00 |
| **Total Component Cost** | | | | **$55.80** |
| Assembly Labor (15 min @ $30/hr) | | | | $7.50 |
| Testing (5 min) | | | | $2.50 |
| Packaging | | | | $2.00 |
| **Total Manufacturing Cost** | | | | **$67.80** |
| Profit Margin (40%) | | | | $27.12 |
| **Suggested Retail Price** | | | | **$94.92** |

### Appendix E: Timeline and Milestones

**Project Duration:** 12-16 weeks

**Phase 1: Discovery & Planning (Week 1-2)**
- Requirements finalization
- Architecture design
- Technology stack selection
- Hardware BOM validation

**Phase 2: Design (Week 3-4)**
- UI/UX wireframes
- Visual design
- Design system
- User flow diagrams

**Phase 3: Development (Week 5-10)**
- Backend API development (Week 5-7)
- Mobile app development (Week 5-9)
- Hardware firmware development (Week 5-8)
- Integration (Week 9-10)

**Phase 4: Testing (Week 11-13)**
- Unit testing (Week 11)
- Integration testing (Week 12)
- User acceptance testing (Week 13)

**Phase 5: Deployment (Week 14-16)**
- App store submission (Week 14)
- Backend deployment (Week 15)
- Hardware production (Week 15-16)
- Launch (Week 16)

### Appendix F: Glossary

**BLE:** Bluetooth Low Energy
**BMS:** Battery Management System
**CoAP:** Constrained Application Protocol
**MQTT:** Message Queuing Telemetry Transport
**OTA:** Over-The-Air (updates)
**PCB:** Printed Circuit Board
**PWM:** Pulse Width Modulation
**QoS:** Quality of Service
**TEC:** Thermoelectric Cooler (Peltier module)
**TLS:** Transport Layer Security
**UUID:** Universally Unique Identifier

### Appendix G: Contact and Support

**Technical Questions:**
- Email: dev@smartlunchbox.com
- Slack: #smart-lunchbox-dev

**Hardware Support:**
- Email: hardware@smartlunchbox.com

**Project Manager:**
- TBD

---

## DOCUMENT APPROVAL

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| Lead Developer | | | |
| Hardware Engineer | | | |
| Client Representative | | | |

---

**END OF REQUIREMENTS DOCUMENT**
