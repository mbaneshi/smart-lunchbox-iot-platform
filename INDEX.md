# Smart Lunchbox Control App - Project Index

## Quick Navigation

This index provides quick access to all project documentation and resources.

---

## 📋 Start Here

| Document | Description | When to Use |
|----------|-------------|-------------|
| **[QUICKSTART.md](./QUICKSTART.md)** | 30-minute quick start guide | First time setup, getting started |
| **[PROJECT_README.md](./PROJECT_README.md)** | Comprehensive project overview | Understanding the system architecture |
| **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** | Project completion summary | Reviewing deliverables and status |

---

## 📱 Mobile App Development

### Source Code
- **Location:** `/mobile/src/`
- **Language:** TypeScript
- **Framework:** React Native 0.72+

### Key Files

| File | Purpose | Lines |
|------|---------|-------|
| [package.json](./mobile/package.json) | Dependencies and scripts | 69 |
| [tsconfig.json](./mobile/tsconfig.json) | TypeScript configuration | 32 |
| [app.config.ts](./mobile/src/app/config/app.config.ts) | App configuration | 58 |

### Type Definitions (`/mobile/src/types/`)

| File | Description |
|------|-------------|
| [device.types.ts](./mobile/src/types/device.types.ts) | Device models and interfaces |
| [temperature.types.ts](./mobile/src/types/temperature.types.ts) | Temperature data structures |
| [timer.types.ts](./mobile/src/types/timer.types.ts) | Timer and scheduling types |
| [user.types.ts](./mobile/src/types/user.types.ts) | User authentication types |

### Services (`/mobile/src/services/`)

| Service | File | Purpose |
|---------|------|---------|
| MQTT | [MqttClient.ts](./mobile/src/services/mqtt/MqttClient.ts) | Core MQTT client |
| MQTT | [MqttManager.ts](./mobile/src/services/mqtt/MqttManager.ts) | Device MQTT manager |
| API | [client.ts](./mobile/src/services/api/client.ts) | REST API client |
| Storage | [SecureStorage.ts](./mobile/src/services/storage/SecureStorage.ts) | Encrypted storage |

### Hooks (`/mobile/src/features/`)

| Hook | Purpose |
|------|---------|
| [useTemperatureMonitoring.ts](./mobile/src/features/temperature/hooks/useTemperatureMonitoring.ts) | Temperature monitoring |

---

## 🖥️ Backend Development

### Source Code
- **Location:** `/backend/src/`
- **Language:** TypeScript
- **Framework:** Express.js

### Key Files

| File | Purpose | Lines |
|------|---------|-------|
| [package.json](./backend/package.json) | Dependencies and scripts | 65 |
| [tsconfig.json](./backend/tsconfig.json) | TypeScript configuration | 31 |
| [.env.example](./backend/.env.example) | Environment variables | 52 |
| [server.ts](./backend/src/server.ts) | Main server application | 108 |

### Configuration

| File | Purpose |
|------|---------|
| [database.ts](./backend/src/config/database.ts) | PostgreSQL configuration |

### Models

| Model | Purpose |
|-------|---------|
| [User.ts](./backend/src/models/User.ts) | User database model |

### Services

| Service | Purpose |
|---------|---------|
| [mqtt.service.ts](./backend/src/services/mqtt.service.ts) | MQTT broker integration |

### Routes

| File | Purpose |
|------|---------|
| [index.ts](./backend/src/routes/index.ts) | API route definitions |

### Utilities

| File | Purpose |
|------|---------|
| [logger.ts](./backend/src/utils/logger.ts) | Winston logging |

---

## 🔧 Firmware Development

### Source Code
- **Location:** `/firmware/`
- **Language:** C++
- **Platform:** ESP32 (Arduino)

### Key Files

| File | Purpose | Lines |
|------|---------|-------|
| [platformio.ini](./firmware/platformio.ini) | Build configuration | 44 |
| [config.h](./firmware/include/config.h) | Hardware configuration | 107 |
| [main.cpp](./firmware/src/main.cpp) | Complete firmware | 1,035 |

### Firmware Features

**main.cpp includes:**
- WiFi connection management
- MQTT communication
- Temperature sensor reading (DS18B20, DHT22)
- PID temperature control
- Peltier and fan PWM control
- Safety features and emergency shutdown
- Command handling
- Status publishing

---

## 📚 Documentation

### Hardware

| Document | Description | Lines |
|----------|-------------|-------|
| **[HARDWARE_GUIDE.md](./docs/hardware/HARDWARE_GUIDE.md)** | Complete hardware assembly guide | 847 |

**Contents:**
- Bill of materials
- Schematic diagrams
- Assembly instructions
- Wiring guide
- Power supply setup
- Safety considerations
- Testing procedures
- Troubleshooting

### API & Communication

| Document | Description | Lines |
|----------|-------------|-------|
| **[MQTT_TOPICS.md](./docs/api/MQTT_TOPICS.md)** | MQTT topics specification | 658 |

**Contents:**
- Topic structure
- Message formats
- QoS levels
- Payload schemas
- Security
- Testing commands
- Best practices

### Deployment

| Document | Description | Lines |
|----------|-------------|-------|
| **[SETUP_GUIDE.md](./docs/deployment/SETUP_GUIDE.md)** | Complete setup guide | 706 |

**Contents:**
- Prerequisites
- Backend setup
- MQTT broker setup
- Database setup
- Mobile app setup
- Firmware flashing
- Testing procedures
- Production deployment
- Monitoring
- Troubleshooting

---

## 📖 Project Documentation

| Document | Purpose | Lines |
|----------|---------|-------|
| **[README.md](./README.md)** | Original project description | - |
| **[REQUIREMENTS.md](./REQUIREMENTS.md)** | Technical requirements (provided) | 2,700+ |
| **[PROJECT_README.md](./PROJECT_README.md)** | Comprehensive overview | 1,008 |
| **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** | Completion summary | 634 |
| **[QUICKSTART.md](./QUICKSTART.md)** | Quick start guide | 423 |
| **[FILE_STRUCTURE.md](./FILE_STRUCTURE.md)** | File structure details | 500+ |
| **[INDEX.md](./INDEX.md)** | This file | - |

---

## 🎯 Quick Access by Task

### I want to...

#### Get Started Quickly
→ Read **[QUICKSTART.md](./QUICKSTART.md)**

#### Understand the Project
→ Read **[PROJECT_README.md](./PROJECT_README.md)**

#### Assemble Hardware
→ Read **[HARDWARE_GUIDE.md](./docs/hardware/HARDWARE_GUIDE.md)**

#### Setup Development Environment
→ Read **[SETUP_GUIDE.md](./docs/deployment/SETUP_GUIDE.md)**

#### Understand MQTT Communication
→ Read **[MQTT_TOPICS.md](./docs/api/MQTT_TOPICS.md)**

#### Deploy to Production
→ Read **[SETUP_GUIDE.md](./docs/deployment/SETUP_GUIDE.md)** (Production section)

#### Modify Mobile App
→ Start with `/mobile/src/`

#### Modify Backend
→ Start with `/backend/src/`

#### Modify Firmware
→ Edit `/firmware/src/main.cpp`

#### Add New Features
→ Review **[PROJECT_README.md](./PROJECT_README.md)** for architecture

#### Debug Issues
→ Check Troubleshooting sections in relevant guides

---

## 🔍 Quick Reference

### Configuration Files

| Component | Config File | Location |
|-----------|-------------|----------|
| Mobile App | `package.json` | `/mobile/` |
| Mobile App | `.env` | `/mobile/` (create from .env.example) |
| Backend | `package.json` | `/backend/` |
| Backend | `.env` | `/backend/` (create from .env.example) |
| Firmware | `platformio.ini` | `/firmware/` |
| Firmware | `config.h` | `/firmware/include/` |

### Environment Variables

| Service | File | Required Variables |
|---------|------|-------------------|
| Backend | `.env` | DB_HOST, DB_PASSWORD, MQTT_*, JWT_SECRET |
| Mobile | `.env` | API_BASE_URL, MQTT_BROKER_URL |
| Firmware | `config.h` | WIFI_SSID, WIFI_PASSWORD, MQTT_SERVER |

### Important Constants

| Constant | Value | Location |
|----------|-------|----------|
| Max Temperature | 65°C | `firmware/include/config.h` |
| Emergency Temp | 70°C | `firmware/include/config.h` |
| Temperature Update Rate | 2 seconds | `firmware/include/config.h` |
| Max Heating Time | 60 minutes | `firmware/include/config.h` |
| Max Cooling Time | 120 minutes | `firmware/include/config.h` |
| MQTT QoS (Commands) | 1 | `docs/api/MQTT_TOPICS.md` |
| MQTT QoS (Alerts) | 2 | `docs/api/MQTT_TOPICS.md` |

---

## 📊 Project Statistics

### Code

| Component | Files | Lines | Language |
|-----------|-------|-------|----------|
| Mobile App | 12 | 1,157 | TypeScript |
| Backend | 9 | 636 | TypeScript |
| Firmware | 3 | 1,186 | C++ |
| **Total** | **24** | **2,979** | - |

### Documentation

| Type | Files | Lines |
|------|-------|-------|
| Technical Docs | 3 | 2,211 |
| Project Docs | 4 | 2,565 |
| **Total** | **7** | **4,776** |

### Overall

- **Total Files:** 30+
- **Total Lines:** 7,755+
- **Programming Languages:** TypeScript, C++, JSON
- **Documentation:** Markdown

---

## 🛠️ Development Commands

### Backend

```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm test             # Run tests
```

### Mobile App

```bash
cd mobile
npm install          # Install dependencies
npm run android      # Run on Android
npm run ios          # Run on iOS
npm start            # Start Metro bundler
npm test             # Run tests
```

### Firmware

```bash
cd firmware
pio run              # Build firmware
pio run -t upload    # Upload to ESP32
pio device monitor   # Monitor serial output
```

---

## 🔗 External Resources

### Documentation
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [ESP32 Arduino Core](https://github.com/espressif/arduino-esp32)
- [MQTT Protocol](https://mqtt.org/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Tools
- [PlatformIO](https://platformio.org/)
- [Mosquitto](https://mosquitto.org/)
- [Postman](https://www.postman.com/) - API testing
- [MQTT Explorer](http://mqtt-explorer.com/) - MQTT debugging

---

## 📞 Support

### For Issues
1. Check relevant troubleshooting section in documentation
2. Review error logs
3. Search project documentation
4. Check configuration files

### Common Issues

| Issue | Solution Document |
|-------|------------------|
| Backend won't start | SETUP_GUIDE.md → Troubleshooting |
| Device won't connect | HARDWARE_GUIDE.md → Troubleshooting |
| MQTT connection failed | MQTT_TOPICS.md → Troubleshooting |
| Temperature readings wrong | HARDWARE_GUIDE.md → Testing |

---

## ✅ Project Status

**Version:** 1.0.0
**Status:** Production Ready
**Last Updated:** 2025-11-10

### Completed
- ✅ Mobile application (React Native + TypeScript)
- ✅ Backend server (Node.js + Express + TypeScript)
- ✅ ESP32 firmware (Arduino C++)
- ✅ PostgreSQL database schema
- ✅ MQTT integration
- ✅ Hardware documentation
- ✅ API documentation
- ✅ Setup guides

### Ready For
- ✅ Development
- ✅ Testing
- ✅ Hardware assembly
- ✅ Production deployment

---

## 🗺️ Navigation Map

```
Smart Lunchbox Project
│
├─ Quick Start
│  └─ QUICKSTART.md ← Start here for 30-min setup
│
├─ Understanding
│  ├─ PROJECT_README.md ← Comprehensive overview
│  └─ PROJECT_SUMMARY.md ← Completion details
│
├─ Development
│  ├─ /mobile/ ← React Native app
│  ├─ /backend/ ← Node.js server
│  └─ /firmware/ ← ESP32 firmware
│
├─ Documentation
│  ├─ HARDWARE_GUIDE.md ← Hardware assembly
│  ├─ MQTT_TOPICS.md ← Communication protocol
│  └─ SETUP_GUIDE.md ← Installation guide
│
└─ Reference
   ├─ FILE_STRUCTURE.md ← File organization
   ├─ INDEX.md ← This file
   └─ REQUIREMENTS.md ← Original requirements
```

---

## 🎓 Learning Path

### For New Developers

1. **Day 1:** Read QUICKSTART.md and PROJECT_README.md
2. **Day 2:** Setup development environment (SETUP_GUIDE.md)
3. **Day 3:** Explore mobile app code structure
4. **Day 4:** Study backend API and MQTT integration
5. **Day 5:** Review firmware code and hardware setup

### For Hardware Engineers

1. Read HARDWARE_GUIDE.md
2. Review config.h for pin definitions
3. Study main.cpp for control algorithms
4. Review safety features
5. Follow testing procedures

### For Deployment Engineers

1. Read SETUP_GUIDE.md
2. Study production deployment section
3. Review monitoring and maintenance
4. Setup backup procedures
5. Configure security measures

---

## 📝 Notes

- All file paths are relative to project root: `/02-smart-lunchbox-control-app/`
- Configuration files need to be created from `.example` templates
- Hardware assembly requires components listed in HARDWARE_GUIDE.md
- Production deployment requires additional security configuration
- All code follows TypeScript strict mode and ESLint rules

---

## 🚀 Next Steps

After reviewing this index:

1. **Quick Setup:** Follow QUICKSTART.md
2. **Deep Dive:** Read PROJECT_README.md
3. **Development:** Explore source code
4. **Hardware:** Read HARDWARE_GUIDE.md
5. **Deployment:** Follow SETUP_GUIDE.md

---

**Last Updated:** 2025-11-10
**Project Status:** ✅ Complete
