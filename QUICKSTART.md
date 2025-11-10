# Smart Lunchbox - Quick Start Guide

Get your Smart Lunchbox system up and running in 30 minutes!

## Prerequisites

Before you begin, ensure you have:

- ✅ Node.js 18+ installed
- ✅ PostgreSQL 14+ installed
- ✅ Mosquitto MQTT broker installed
- ✅ Git installed
- ✅ React Native development environment setup
- ✅ PlatformIO installed (for firmware)
- ✅ ESP32 hardware assembled (see `/docs/hardware/HARDWARE_GUIDE.md`)

## Step 1: Clone the Repository (2 minutes)

```bash
git clone <repository-url>
cd 02-smart-lunchbox-control-app
```

## Step 2: Setup Database (3 minutes)

```bash
# Create database
createdb smartlunchbox

# Create user (optional)
psql -c "CREATE USER smartlunchbox_user WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE smartlunchbox TO smartlunchbox_user;"
```

## Step 3: Setup MQTT Broker (2 minutes)

```bash
# Start Mosquitto
sudo systemctl start mosquitto  # Linux
# or
brew services start mosquitto   # macOS

# Create users
sudo mosquitto_passwd -c /etc/mosquitto/passwd backend_user
sudo mosquitto_passwd /etc/mosquitto/passwd device_user
sudo mosquitto_passwd /etc/mosquitto/passwd app_user

# Restart Mosquitto
sudo systemctl restart mosquitto
```

## Step 4: Setup Backend (5 minutes)

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Edit .env file - IMPORTANT: Update these values!
nano .env
```

**Minimum required .env values:**
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_NAME=smartlunchbox
DB_USER=smartlunchbox_user
DB_PASSWORD=your_password
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=backend_user
MQTT_PASSWORD=your_mqtt_password
JWT_SECRET=your_jwt_secret_change_this_to_something_random_and_long
JWT_REFRESH_SECRET=another_random_secret_change_this_too
```

```bash
# Build and start
npm run build
npm run dev
```

**Verify backend is running:**
```bash
curl http://localhost:3000/health
```

Expected response: `{"status":"healthy",...}`

## Step 5: Setup Mobile App (5 minutes)

```bash
cd ../mobile

# Install dependencies
npm install

# iOS only (macOS)
cd ios && pod install && cd ..

# Configure environment
cp .env.example .env
nano .env
```

**Update .env:**
```env
API_BASE_URL=http://localhost:3000
MQTT_BROKER_URL=ws://localhost:9001
```

**Run the app:**
```bash
# Android
npm run android

# iOS
npm run ios
```

## Step 6: Flash Firmware to ESP32 (5 minutes)

```bash
cd ../firmware

# Edit WiFi credentials
nano include/config.h
```

**Update these lines:**
```cpp
// Add at the top or create credentials.h
#define WIFI_SSID "Your_WiFi_Name"
#define WIFI_PASSWORD "your_wifi_password"
#define MQTT_SERVER "localhost"  // or your server IP
#define MQTT_USER "device_user"
#define MQTT_PASSWORD "your_mqtt_password"
```

```bash
# Connect ESP32 via USB

# Build and upload
pio run --target upload

# Monitor serial output
pio device monitor
```

## Step 7: Test the System (5 minutes)

### Test MQTT Communication

**Terminal 1 - Subscribe to device messages:**
```bash
mosquitto_sub -h localhost -t "smartlunchbox/#" -u backend_user -P your_mqtt_password -v
```

**Terminal 2 - Publish test command:**
```bash
mosquitto_pub -h localhost \
  -t "smartlunchbox/LB-TEST123/control/heat" \
  -m '{"action":"start","targetTemp":40,"maxDuration":1800}' \
  -u backend_user -P your_mqtt_password
```

### Test Mobile App

1. Open the mobile app
2. Register/Login (if auth is implemented)
3. Add device:
   - Enter device ID from serial monitor
   - Or scan QR code (if implemented)
4. Monitor temperature readings
5. Test heating control

## Common Issues & Solutions

### Backend won't start

**Issue:** `Error: listen EADDRINUSE: address already in use :::3000`
**Solution:** Kill process on port 3000
```bash
lsof -ti:3000 | xargs kill -9
```

### Database connection failed

**Issue:** `Connection refused`
**Solution:** Verify PostgreSQL is running
```bash
sudo systemctl status postgresql
# or
pg_isready
```

### MQTT connection failed

**Issue:** `Connection refused`
**Solution:** Check Mosquitto status
```bash
sudo systemctl status mosquitto
# Check if port 1883 is listening
netstat -an | grep 1883
```

### ESP32 won't connect to WiFi

**Issue:** Device shows "WiFi connection failed"
**Solution:**
1. Verify SSID and password are correct
2. Ensure using 2.4GHz network (ESP32 doesn't support 5GHz)
3. Check signal strength
4. Review serial output for error messages

### Temperature readings show 0 or -127

**Issue:** Invalid temperature readings
**Solution:**
1. Check DS18B20 wiring (VDD, GND, DQ)
2. Verify 4.7kΩ pullup resistor is connected
3. Check DHT22 connections
4. Test sensors individually

## Verify Complete System

Run this checklist to ensure everything is working:

- [ ] Backend server responds to `/health` endpoint
- [ ] PostgreSQL database is accessible
- [ ] Mosquitto broker is running
- [ ] Mobile app launches without errors
- [ ] ESP32 connects to WiFi (serial monitor shows "WiFi connected")
- [ ] ESP32 connects to MQTT (serial monitor shows "MQTT connected")
- [ ] Temperature readings appear in serial monitor
- [ ] Backend logs show device messages (check `backend/logs/combined.log`)
- [ ] Mobile app can subscribe to temperature updates
- [ ] Sending heating command from app triggers ESP32 response

## Next Steps

Once everything is working:

1. **Review Documentation:**
   - Read `/docs/hardware/HARDWARE_GUIDE.md` for hardware details
   - Review `/docs/api/MQTT_TOPICS.md` for MQTT specifications
   - Check `/docs/deployment/SETUP_GUIDE.md` for production deployment

2. **Complete Implementation:**
   - Implement remaining mobile app features
   - Add database models and API endpoints
   - Create user authentication flow
   - Implement push notifications
   - Add temperature history graphs

3. **Test Hardware:**
   - Verify heating functionality
   - Test cooling functionality
   - Check safety shutdown
   - Measure temperature accuracy
   - Test power consumption

4. **Production Deployment:**
   - Deploy backend to AWS EC2
   - Setup PostgreSQL RDS
   - Configure production MQTT broker
   - Build and submit mobile apps to stores

## Development Tips

### Hot Reload

**Backend:**
```bash
npm run dev  # Uses ts-node-dev for hot reload
```

**Mobile App:**
- Metro bundler hot reloads automatically
- Shake device for dev menu

**Firmware:**
```bash
# Monitor and auto-upload on save
pio device monitor
```

### Debugging

**Backend Logs:**
```bash
tail -f backend/logs/combined.log
```

**MQTT Messages:**
```bash
mosquitto_sub -h localhost -t "smartlunchbox/#" -u backend_user -P password -v
```

**ESP32 Serial:**
```bash
pio device monitor --baud 115200
```

## Performance Optimization

Once running, optimize for better performance:

1. **Backend:**
   - Add Redis for session caching
   - Implement connection pooling
   - Enable compression middleware

2. **Mobile App:**
   - Implement local caching
   - Reduce MQTT message frequency (if needed)
   - Optimize re-renders

3. **ESP32:**
   - Fine-tune PID parameters
   - Adjust sensor read intervals
   - Optimize power consumption

## Support

If you encounter issues not covered here:

1. Check detailed documentation in `/docs/`
2. Review `PROJECT_README.md` for comprehensive information
3. Check `PROJECT_SUMMARY.md` for project structure
4. Review ESP32 serial output for error messages
5. Check backend logs in `backend/logs/`

## Security Checklist (Before Production)

- [ ] Change all default passwords
- [ ] Generate strong JWT secrets (32+ characters)
- [ ] Enable MQTT authentication
- [ ] Setup TLS/SSL for MQTT (port 8883)
- [ ] Setup HTTPS for backend API
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Setup firewall rules
- [ ] Encrypt database credentials
- [ ] Enable database backups

## Congratulations!

You now have a working Smart Lunchbox IoT system!

**What's Working:**
- ✅ Backend server receiving and processing requests
- ✅ MQTT broker handling device communication
- ✅ Database storing application data
- ✅ Mobile app communicating with backend
- ✅ ESP32 firmware reading sensors and controlling temperature
- ✅ Real-time temperature monitoring via MQTT

**Time to celebrate!** 🎉

For production deployment and advanced features, refer to the comprehensive documentation in the `/docs/` directory.
