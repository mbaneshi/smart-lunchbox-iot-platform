# Smart Lunchbox Control App - Complete IoT System

## Project Overview

The Smart Lunchbox Control App is a comprehensive IoT solution that allows users to remotely control the temperature of their lunchbox through a mobile application. The system uses a Peltier-based heating and cooling module controlled by an ESP32 microcontroller, with real-time monitoring and control via MQTT protocol.

## System Architecture

```
┌─────────────────┐     HTTPS/WSS    ┌──────────────┐     MQTT     ┌──────────────┐
│   Mobile App    │◄────────────────►│   Backend    │◄────────────►│   ESP32      │
│  (React Native) │                  │   (Node.js)  │              │  Firmware    │
└─────────────────┘                  └──────────────┘              └──────────────┘
                                             │                              │
                                             ▼                              ▼
                                     ┌──────────────┐              ┌──────────────┐
                                     │  PostgreSQL  │              │  Temperature │
                                     │   Database   │              │   Sensors    │
                                     └──────────────┘              │   Peltier    │
                                                                   │   Module     │
                                                                   └──────────────┘
```

## Key Features

### Mobile Application
- ✅ Real-time temperature monitoring (updates every 2 seconds)
- ✅ Manual heating and cooling control
- ✅ Temperature presets (Deep Cool, Cool, Warm, Hot)
- ✅ Timer and scheduling functionality
- ✅ Device pairing via BLE or WiFi AP mode
- ✅ Multi-device support
- ✅ Push notifications for alerts
- ✅ Temperature history and graphs
- ✅ User authentication and profiles

### ESP32 Firmware
- ✅ Dual temperature sensors (DS18B20 + DHT22)
- ✅ PID temperature control algorithm
- ✅ Peltier module with PWM control
- ✅ WiFi connectivity (2.4 GHz)
- ✅ MQTT communication with TLS
- ✅ BLE provisioning for easy setup
- ✅ OTA firmware updates
- ✅ Safety features and emergency shutdown
- ✅ Status LED indicators

### Backend Services
- ✅ RESTful API for user management
- ✅ MQTT broker integration
- ✅ PostgreSQL database for data persistence
- ✅ JWT authentication
- ✅ Real-time device status tracking
- ✅ Temperature data logging
- ✅ Push notification service
- ✅ Firmware update management

## Technology Stack

### Mobile App
- **Framework:** React Native 0.72+
- **Language:** TypeScript 5.0+
- **State Management:** Redux Toolkit / Zustand
- **Navigation:** React Navigation 6.x
- **UI Components:** React Native Paper
- **MQTT:** MQTT.js
- **API Client:** Axios
- **Charts:** Victory Native

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript 5.0+
- **Database:** PostgreSQL 14+
- **ORM:** Sequelize
- **MQTT:** MQTT.js
- **Authentication:** JWT
- **Logging:** Winston
- **Process Manager:** PM2

### Firmware
- **MCU:** ESP32-WROOM-32D / ESP32-S3
- **Framework:** Arduino / ESP-IDF
- **Language:** C++
- **Build System:** PlatformIO
- **MQTT:** PubSubClient
- **Sensors:** DS18B20, DHT22
- **OTA:** ArduinoOTA

### Infrastructure
- **MQTT Broker:** Mosquitto / AWS IoT Core
- **Database:** PostgreSQL / AWS RDS
- **Cloud Platform:** AWS EC2 / Lambda
- **CDN:** CloudFront (for firmware updates)
- **Push Notifications:** Firebase Cloud Messaging

## Project Structure

```
02-smart-lunchbox-control-app/
├── mobile/                       # React Native mobile application
│   ├── src/
│   │   ├── app/                 # App-level configuration
│   │   │   ├── navigation/      # Navigation setup
│   │   │   └── config/          # App configuration files
│   │   ├── features/            # Feature modules
│   │   │   ├── auth/           # Authentication
│   │   │   ├── device/         # Device management
│   │   │   ├── temperature/    # Temperature monitoring & control
│   │   │   ├── timer/          # Timer & scheduling
│   │   │   └── onboarding/     # Device onboarding
│   │   ├── services/           # External services
│   │   │   ├── mqtt/           # MQTT client
│   │   │   ├── api/            # REST API client
│   │   │   ├── storage/        # Secure storage
│   │   │   └── notifications/  # Push notifications
│   │   ├── shared/             # Shared components & utilities
│   │   ├── store/              # Redux store
│   │   └── types/              # TypeScript types
│   ├── android/                # Android-specific code
│   ├── ios/                    # iOS-specific code
│   └── package.json
│
├── backend/                     # Node.js backend server
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # Database models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   │   └── mqtt.service.ts # MQTT integration
│   │   ├── middleware/         # Express middleware
│   │   ├── utils/              # Utility functions
│   │   └── database/           # Migrations & seeds
│   ├── logs/                   # Application logs
│   └── package.json
│
├── firmware/                    # ESP32 firmware
│   ├── src/
│   │   └── main.cpp            # Main firmware code
│   ├── include/
│   │   └── config.h            # Hardware configuration
│   ├── lib/                    # External libraries
│   ├── data/                   # SPIFFS data files
│   └── platformio.ini          # PlatformIO configuration
│
├── docs/                        # Documentation
│   ├── hardware/
│   │   └── HARDWARE_GUIDE.md   # Complete hardware guide & schematics
│   ├── api/
│   │   ├── API_REFERENCE.md    # REST API documentation
│   │   └── MQTT_TOPICS.md      # MQTT topics specification
│   └── deployment/
│       └── SETUP_GUIDE.md      # Setup & deployment guide
│
├── REQUIREMENTS.md              # Detailed technical requirements
├── README.md                    # Project overview
└── PROJECT_README.md           # This file (comprehensive guide)
```

## Hardware Components

### Required Parts
1. **ESP32-WROOM-32D** - Main microcontroller
2. **DS18B20** - Food temperature sensor (waterproof probe recommended)
3. **DHT22** - Ambient temperature & humidity sensor
4. **TEC1-12706** - Peltier module (40x40mm, 12V 6A)
5. **Heatsinks** - 2x aluminum heatsinks with fins
6. **Cooling Fan** - 40mm 12V DC fan
7. **12V 10A Power Supply** - AC/DC adapter or Mean Well RS-150-12
8. **Buck Converter** - LM2596 (12V to 3.3V)
9. **MOSFET Modules** - 2x IRF520/IRF540N or relay modules
10. **Resistors** - 4.7kΩ, 10kΩ, 220Ω
11. **Status LED** - RGB or single color
12. **Thermal Paste** - High-performance (Arctic MX-4 or similar)
13. **Insulated Container** - Lunchbox with foam insulation
14. **Miscellaneous** - Jumper wires, PCB, connectors, fuse

### Total Hardware Cost
Estimated: $80-120 USD per unit (in small quantities)

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Mosquitto MQTT broker
- React Native development environment
- PlatformIO (for firmware)

### 1. Clone Repository

```bash
git clone <repository-url>
cd 02-smart-lunchbox-control-app
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run build
npm run dev
```

### 3. Setup Database

```bash
# Create PostgreSQL database
createdb smartlunchbox

# Run migrations
npm run migrate
```

### 4. Setup MQTT Broker

```bash
# Install Mosquitto
sudo apt-get install mosquitto mosquitto-clients  # Ubuntu/Debian
# or
brew install mosquitto  # macOS

# Start Mosquitto
sudo systemctl start mosquitto
```

### 5. Setup Mobile App

```bash
cd mobile
npm install
cd ios && pod install && cd ..  # iOS only (macOS)

# Configure .env
cp .env.example .env
# Edit .env with backend URLs

# Run app
npm run android  # Android
npm run ios      # iOS
```

### 6. Flash Firmware

```bash
cd firmware

# Configure WiFi credentials in include/config.h
# Connect ESP32 via USB

# Build and upload
pio run --target upload

# Monitor serial output
pio device monitor
```

## Configuration

### Backend Environment Variables

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartlunchbox
DB_USER=postgres
DB_PASSWORD=your_password
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=backend_user
MQTT_PASSWORD=your_mqtt_password
JWT_SECRET=your_jwt_secret_minimum_32_characters
```

### Mobile App Environment Variables

```env
API_BASE_URL=http://localhost:3000
MQTT_BROKER_URL=ws://localhost:9001
```

### Firmware Configuration

Edit `firmware/include/config.h`:

```cpp
#define WIFI_SSID "Your_WiFi_Network"
#define WIFI_PASSWORD "your_wifi_password"
#define MQTT_SERVER "mqtt.smartlunchbox.com"
#define MQTT_USER "device_user"
#define MQTT_PASSWORD "your_mqtt_password"
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Devices
- `GET /api/devices` - List user devices
- `POST /api/devices` - Register new device
- `GET /api/devices/:id` - Get device details
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Remove device

### Temperature
- `GET /api/temperature/:deviceId/current` - Current temperature
- `GET /api/temperature/:deviceId/history` - Temperature history
- `POST /api/temperature/:deviceId/control` - Send control command

### Schedules
- `GET /api/schedules/:deviceId` - List schedules
- `POST /api/schedules/:deviceId` - Create schedule
- `PUT /api/schedules/:deviceId/:scheduleId` - Update schedule
- `DELETE /api/schedules/:deviceId/:scheduleId` - Delete schedule

## MQTT Topics

### Device → Backend/App
- `smartlunchbox/{device_id}/temperature/current` - Temperature readings
- `smartlunchbox/{device_id}/status/online` - Online/offline status
- `smartlunchbox/{device_id}/alerts` - Alert messages
- `smartlunchbox/{device_id}/firmware/version` - Firmware version

### Backend/App → Device
- `smartlunchbox/{device_id}/temperature/target` - Set target temperature
- `smartlunchbox/{device_id}/control/heat` - Heating control
- `smartlunchbox/{device_id}/control/cool` - Cooling control
- `smartlunchbox/{device_id}/control/power` - Power control
- `smartlunchbox/{device_id}/timer/schedule` - Schedule configuration
- `smartlunchbox/{device_id}/firmware/update` - Firmware update command

## Safety Features

### Hardware Safety
- ✅ Maximum temperature limit: 65°C (software)
- ✅ Emergency shutoff at 70°C (hardware)
- ✅ Thermal fuse backup
- ✅ Safety cutoff input pin
- ✅ Over-current protection (fuse)
- ✅ Maximum heating time: 60 minutes
- ✅ Maximum cooling time: 120 minutes

### Software Safety
- ✅ PID control for temperature stability
- ✅ Continuous safety checks every second
- ✅ Automatic shutdown on sensor failure
- ✅ Temperature range validation
- ✅ Command timeout protection
- ✅ Watchdog timer

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Mobile App Tests
```bash
cd mobile
npm test
```

### Hardware Tests
1. Power supply voltage verification
2. Sensor calibration
3. Peltier functionality test
4. Safety shutdown test
5. WiFi connectivity test
6. MQTT communication test

## Deployment

### Backend Deployment (AWS EC2)
```bash
# On EC2 instance
git clone <repository-url>
cd backend
npm install
npm run build
pm2 start dist/server.js --name smartlunchbox
pm2 save
```

### Mobile App Deployment

**Android:**
```bash
cd mobile/android
./gradlew assembleRelease
# Upload APK to Google Play Console
```

**iOS:**
```bash
# Open Xcode
open mobile/ios/SmartLunchboxApp.xcworkspace
# Archive and upload to App Store Connect
```

### Production Considerations
- Use AWS RDS for PostgreSQL
- Use AWS IoT Core for MQTT (scalable)
- Setup SSL/TLS certificates
- Configure CDN for firmware updates
- Implement monitoring and alerting
- Setup automated backups

## Monitoring

### Backend Monitoring
```bash
# PM2 monitoring
pm2 monit

# View logs
pm2 logs smartlunchbox

# Application logs
tail -f backend/logs/combined.log
```

### MQTT Monitoring
```bash
# Subscribe to all topics
mosquitto_sub -h localhost -t "smartlunchbox/#" -v
```

### Database Monitoring
```bash
# Connection count
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
```

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check `.env` configuration
- Verify PostgreSQL is running
- Check port 3000 availability
- Review logs: `pm2 logs smartlunchbox`

**Device can't connect to WiFi:**
- Verify SSID and password
- Ensure 2.4GHz network (not 5GHz)
- Check signal strength
- Review serial monitor output

**Temperature readings incorrect:**
- Check sensor wiring
- Verify sensor type in firmware
- Test sensors individually
- Replace faulty sensors

**MQTT messages not received:**
- Verify broker is running
- Check credentials
- Review topic subscriptions
- Check firewall rules

## Performance Specifications

### Temperature Control
- **Heating rate:** 5-10°C per minute (depending on food mass)
- **Cooling rate:** 3-7°C per minute (ambient dependent)
- **Temperature accuracy:** ±0.5°C
- **Control precision:** ±1°C (steady state)
- **Response time:** < 30 seconds to setpoint changes

### Power Consumption
- **Idle:** < 2W
- **Heating:** 40-75W
- **Cooling:** 40-75W
- **Maintaining:** 10-20W

### Communication
- **Temperature update rate:** 2 seconds
- **MQTT latency:** < 100ms (local network)
- **API response time:** < 200ms (typical)
- **WiFi reconnect time:** < 10 seconds

## Security Considerations

### Network Security
- TLS/SSL encryption for all production traffic
- MQTT authentication required
- JWT tokens for API authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints

### Device Security
- Secure storage of WiFi credentials
- MQTT password protection
- OTA update signature verification
- Factory reset capability

### Data Privacy
- User data encrypted at rest
- Secure transmission of all data
- GDPR compliance considerations
- User consent for data collection

## Maintenance

### Regular Maintenance
- **Weekly:** Clean food contact surfaces
- **Monthly:** Inspect wiring, clean heatsink
- **Annually:** Replace thermal paste, recalibrate sensors

### Software Updates
- **Backend:** Rolling updates with zero downtime
- **Mobile App:** Submit updates through app stores
- **Firmware:** OTA updates pushed to devices

## Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit pull request

### Code Style
- Follow ESLint configuration for TypeScript
- Use Prettier for code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## License

This project is proprietary software. All rights reserved.

## Support

For technical support or questions:
- **Email:** support@smartlunchbox.com
- **Documentation:** See `docs/` directory
- **GitHub Issues:** Report bugs and feature requests

## Acknowledgments

- ESP32 Arduino Core team
- React Native community
- Mosquitto MQTT broker developers
- All open-source library contributors

## Project Status

**Version:** 1.0.0
**Status:** Production Ready
**Last Updated:** 2025-11-10

### Completed Features
- ✅ Mobile app (iOS & Android)
- ✅ Backend API server
- ✅ MQTT broker integration
- ✅ ESP32 firmware
- ✅ Hardware design & documentation
- ✅ Setup & deployment guides

### Future Enhancements
- 🔄 Machine learning for predictive heating
- 🔄 Voice control integration (Alexa, Google Assistant)
- 🔄 Battery power mode
- 🔄 Multiple temperature zones
- 🔄 Solar charging option
- 🔄 Advanced analytics dashboard

## Conclusion

The Smart Lunchbox Control App is a complete, production-ready IoT system that demonstrates best practices in mobile development, backend architecture, embedded systems, and IoT communication protocols. The system is designed for reliability, scalability, and user-friendly operation.

For detailed information on specific components, refer to the documentation in the `docs/` directory.
