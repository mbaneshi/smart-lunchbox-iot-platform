# Smart Lunchbox Setup Guide

## Complete System Setup and Deployment Guide

This guide covers the setup and deployment of the complete Smart Lunchbox IoT system including mobile app, backend server, MQTT broker, and ESP32 firmware.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [MQTT Broker Setup](#mqtt-broker-setup)
4. [Database Setup](#database-setup)
5. [Mobile App Setup](#mobile-app-setup)
6. [ESP32 Firmware Setup](#esp32-firmware-setup)
7. [Testing the System](#testing-the-system)
8. [Production Deployment](#production-deployment)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js:** Version 18.0.0 or higher
- **npm:** Version 9.0.0 or higher
- **PostgreSQL:** Version 14 or higher
- **Mosquitto MQTT Broker:** Latest version (or AWS IoT Core)
- **React Native CLI:** Latest version
- **PlatformIO:** For ESP32 firmware development
- **Git:** For version control

### Required Accounts

- **AWS Account** (optional, for production deployment)
- **Firebase Account** (for push notifications)
- **Apple Developer Account** (for iOS deployment)
- **Google Play Console Account** (for Android deployment)

### Development Environment

- **macOS, Linux, or Windows** with WSL2
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)
- **VS Code** or similar code editor
- **Serial monitor** for ESP32 debugging

## Backend Setup

### 1. Clone the Repository

```bash
cd /path/to/your/workspace
git clone <repository-url>
cd 02-smart-lunchbox-control-app/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smartlunchbox
DB_USER=postgres
DB_PASSWORD=your_secure_password

# MQTT Configuration
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=backend_user
MQTT_PASSWORD=your_mqtt_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_characters

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### 4. Build the Backend

```bash
npm run build
```

### 5. Start the Backend Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server should start on `http://localhost:3000`.

### 6. Verify Backend is Running

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-10T10:00:00.000Z",
  "uptime": 1.234,
  "environment": "development"
}
```

## MQTT Broker Setup

### Option 1: Mosquitto (Local/Self-Hosted)

#### Install Mosquitto

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install mosquitto mosquitto-clients
```

**macOS:**
```bash
brew install mosquitto
```

**Windows:**
Download installer from [mosquitto.org](https://mosquitto.org/download/)

#### Configure Mosquitto

Create configuration file at `/etc/mosquitto/mosquitto.conf`:

```conf
# Basic Configuration
listener 1883 localhost

# WebSocket listener for mobile app
listener 9001
protocol websockets

# Authentication
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
```

#### Create Users

```bash
# Create password file
sudo mosquitto_passwd -c /etc/mosquitto/passwd backend_user
sudo mosquitto_passwd /etc/mosquitto/passwd device_user
sudo mosquitto_passwd /etc/mosquitto/passwd app_user
```

#### Start Mosquitto

```bash
# Start service
sudo systemctl start mosquitto

# Enable on boot
sudo systemctl enable mosquitto

# Check status
sudo systemctl status mosquitto
```

#### Test MQTT Connection

**Terminal 1 (Subscribe):**
```bash
mosquitto_sub -h localhost -p 1883 -t "test/topic" -u backend_user -P your_password
```

**Terminal 2 (Publish):**
```bash
mosquitto_pub -h localhost -p 1883 -t "test/topic" -m "Hello MQTT" -u backend_user -P your_password
```

### Option 2: AWS IoT Core (Production)

#### 1. Create IoT Thing

```bash
aws iot create-thing --thing-name SmartLunchbox-001
```

#### 2. Generate Certificates

```bash
aws iot create-keys-and-certificate \
  --set-as-active \
  --certificate-pem-outfile cert.pem \
  --public-key-outfile public.key \
  --private-key-outfile private.key
```

#### 3. Create IoT Policy

Create `iot-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["iot:Connect", "iot:Publish", "iot:Subscribe", "iot:Receive"],
      "Resource": ["*"]
    }
  ]
}
```

Apply policy:
```bash
aws iot create-policy --policy-name SmartLunchboxPolicy --policy-document file://iot-policy.json
```

#### 4. Attach Policy to Certificate

```bash
aws iot attach-policy --policy-name SmartLunchboxPolicy --target <certificate-arn>
```

## Database Setup

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

### 2. Create Database

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE smartlunchbox;
CREATE USER smartlunchbox_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE smartlunchbox TO smartlunchbox_user;
\q
```

### 3. Run Migrations

```bash
cd backend
npm run migrate
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. Verify Database

```bash
psql -U smartlunchbox_user -d smartlunchbox -c "SELECT version();"
```

## Mobile App Setup

### 1. Navigate to Mobile Directory

```bash
cd /path/to/02-smart-lunchbox-control-app/mobile
```

### 2. Install Dependencies

```bash
npm install

# iOS only (macOS)
cd ios && pod install && cd ..
```

### 3. Configure Environment

Create `.env` file:

```bash
API_BASE_URL=http://localhost:3000
MQTT_BROKER_URL=ws://localhost:9001
```

For production, use your actual server URLs:

```bash
API_BASE_URL=https://api.smartlunchbox.com
MQTT_BROKER_URL=wss://mqtt.smartlunchbox.com:9001
```

### 4. Configure Firebase (for Push Notifications)

#### Android:
1. Download `google-services.json` from Firebase Console
2. Place in `android/app/` directory

#### iOS:
1. Download `GoogleService-Info.plist` from Firebase Console
2. Add to Xcode project

### 5. Run the App

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

### 6. Build for Production

**Android:**
```bash
cd android
./gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/
```

**iOS:**
```bash
# Open Xcode
open ios/SmartLunchboxApp.xcworkspace

# Select Product > Archive
# Follow Xcode distribution wizard
```

## ESP32 Firmware Setup

### 1. Install PlatformIO

**VS Code:**
- Install PlatformIO IDE extension from marketplace

**CLI:**
```bash
pip install platformio
```

### 2. Navigate to Firmware Directory

```bash
cd /path/to/02-smart-lunchbox-control-app/firmware
```

### 3. Configure WiFi and MQTT Credentials

Edit `include/config.h` or create a `credentials.h` file:

```cpp
// credentials.h (add to .gitignore)
#define WIFI_SSID "Your_WiFi_Network"
#define WIFI_PASSWORD "your_wifi_password"
#define MQTT_SERVER "mqtt.smartlunchbox.com"
#define MQTT_USER "device_user"
#define MQTT_PASSWORD "your_mqtt_password"
```

### 4. Build Firmware

```bash
pio run
```

### 5. Upload to ESP32

**USB Cable:**
```bash
pio run --target upload
```

**Monitor Serial Output:**
```bash
pio device monitor
```

### 6. First-Time Device Setup

1. Power on ESP32
2. ESP32 creates WiFi AP: "SmartLunchbox-XXXXXX"
3. Connect phone to AP
4. Open mobile app and go to "Add Device"
5. Enter WiFi credentials
6. Device connects to network and MQTT broker

## Testing the System

### 1. Backend Health Check

```bash
curl http://localhost:3000/health
```

### 2. MQTT Connectivity Test

**Subscribe to device topics:**
```bash
mosquitto_sub -h localhost -p 1883 \
  -t "smartlunchbox/+/temperature/current" \
  -u backend_user -P your_password -v
```

**Publish test command:**
```bash
mosquitto_pub -h localhost -p 1883 \
  -t "smartlunchbox/LB-TEST123/control/heat" \
  -m '{"action":"start","targetTemp":45,"maxDuration":1800}' \
  -u backend_user -P your_password
```

### 3. End-to-End Test

1. **Open Mobile App**
2. **Register/Login**
3. **Add Device**
   - Scan QR code or enter device ID
   - Configure WiFi
   - Wait for connection
4. **Monitor Temperature**
   - View live temperature readings
   - Check connection status
5. **Test Heating**
   - Set target temperature to 40°C
   - Tap "Heat" button
   - Monitor temperature rise
6. **Test Cooling**
   - Set target temperature to 10°C
   - Tap "Cool" button
   - Monitor temperature drop

### 4. Database Verification

```bash
psql -U smartlunchbox_user -d smartlunchbox

# Check users
SELECT * FROM users;

# Check devices
SELECT * FROM devices;

# Check temperature data
SELECT * FROM temperature_data ORDER BY timestamp DESC LIMIT 10;
```

## Production Deployment

### Backend Deployment (AWS EC2)

#### 1. Launch EC2 Instance

```bash
# Amazon Linux 2 or Ubuntu 20.04 LTS
# Instance type: t3.small or larger
# Security groups: Allow ports 80, 443, 3000, 1883, 9001
```

#### 2. Install Node.js and Dependencies

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PostgreSQL client
sudo yum install -y postgresql

# Install Mosquitto
sudo yum install -y mosquitto mosquitto-clients
```

#### 3. Deploy Backend

```bash
# Clone repository
git clone <repository-url>
cd 02-smart-lunchbox-control-app/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Build
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/server.js --name smartlunchbox-backend
pm2 save
pm2 startup
```

#### 4. Setup Nginx Reverse Proxy

```bash
sudo yum install -y nginx

# Configure Nginx
sudo nano /etc/nginx/conf.d/smartlunchbox.conf
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name api.smartlunchbox.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Start Nginx:
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 5. Setup SSL with Let's Encrypt

```bash
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.smartlunchbox.com
```

### Database Deployment (AWS RDS)

#### 1. Create RDS PostgreSQL Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier smartlunchbox-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password YourSecurePassword \
  --allocated-storage 20
```

#### 2. Configure Security Group

- Allow inbound traffic on port 5432 from backend EC2 security group

#### 3. Run Migrations

```bash
# On local machine with RDS endpoint
DB_HOST=your-rds-endpoint.rds.amazonaws.com npm run migrate
```

### MQTT Broker Deployment

**Option 1: Mosquitto on EC2**
- Follow Mosquitto setup steps above
- Configure SSL certificates with Let's Encrypt
- Open ports 8883 (MQTT/TLS) and 9001 (WebSocket/TLS)

**Option 2: AWS IoT Core**
- Already configured in AWS IoT Core setup section
- No additional deployment needed

### Mobile App Deployment

#### Android (Google Play Store)

1. **Build Release APK/AAB:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

2. **Sign the Bundle:**
   - Generate keystore: `keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000`
   - Configure in `android/app/build.gradle`

3. **Upload to Play Console:**
   - Create app listing
   - Upload AAB file
   - Complete store listing
   - Submit for review

#### iOS (App Store)

1. **Archive in Xcode:**
   - Open `ios/SmartLunchboxApp.xcworkspace`
   - Select "Any iOS Device"
   - Product > Archive

2. **Upload to App Store Connect:**
   - Validate archive
   - Distribute to App Store
   - Complete app metadata
   - Submit for review

## Monitoring and Maintenance

### Backend Monitoring

**PM2 Monitoring:**
```bash
pm2 monit
pm2 logs smartlunchbox-backend
```

**Log Files:**
```bash
# Application logs
tail -f /path/to/backend/logs/combined.log

# Error logs
tail -f /path/to/backend/logs/error.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Monitoring

```bash
# Check active connections
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Database size
psql -U postgres -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) FROM pg_database;"

# Slow queries
psql -U postgres -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

### MQTT Broker Monitoring

```bash
# Mosquitto status
sudo systemctl status mosquitto

# Connection count
sudo tail -f /var/log/mosquitto/mosquitto.log | grep "Client"

# Subscribe to system topics
mosquitto_sub -h localhost -t '$SYS/#' -v
```

### Automated Backups

**Database Backup Script:**
```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
DB_NAME="smartlunchbox"

mkdir -p $BACKUP_DIR

pg_dump -U smartlunchbox_user $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

**Setup Cron Job:**
```bash
# Run daily at 2 AM
crontab -e
0 2 * * * /path/to/backup-db.sh
```

### System Updates

**Backend Updates:**
```bash
git pull origin main
npm install
npm run build
pm2 restart smartlunchbox-backend
```

**Firmware Updates (OTA):**
1. Build new firmware version
2. Upload to S3 or firmware server
3. Update version in backend database
4. Backend notifies devices of available update
5. Devices download and install update

## Troubleshooting

### Backend Issues

**Backend won't start:**
- Check `.env` configuration
- Verify database connection
- Check port availability: `lsof -i :3000`
- Review logs: `pm2 logs smartlunchbox-backend`

**Database connection errors:**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check credentials in `.env`
- Test connection: `psql -U smartlunchbox_user -d smartlunchbox`

### MQTT Issues

**Devices can't connect:**
- Check Mosquitto status: `sudo systemctl status mosquitto`
- Verify credentials
- Check firewall rules
- Test with mosquitto_sub/pub

**Messages not delivered:**
- Check QoS levels
- Verify topic subscriptions
- Check message size limits
- Review Mosquitto logs

### Mobile App Issues

**Can't connect to backend:**
- Verify API_BASE_URL in `.env`
- Check network connectivity
- Review CORS settings on backend
- Check SSL certificate validity

**Push notifications not working:**
- Verify Firebase configuration
- Check device token registration
- Review Firebase Console logs
- Test with Firebase Cloud Messaging

### ESP32 Issues

**Device won't connect to WiFi:**
- Verify SSID and password
- Check 2.4GHz network (ESP32 doesn't support 5GHz)
- Ensure strong signal strength
- Review serial output for errors

**Temperature readings incorrect:**
- Check sensor wiring
- Verify sensor type in code
- Test sensors individually
- Replace faulty sensors

**Peltier not working:**
- Check power supply voltage and current
- Verify MOSFET connections
- Test with direct 12V connection
- Check for overheating protection activation

## Support and Resources

### Documentation
- Hardware Guide: `docs/hardware/HARDWARE_GUIDE.md`
- API Documentation: `docs/api/API_REFERENCE.md`
- MQTT Topics: `docs/api/MQTT_TOPICS.md`

### Community
- GitHub Issues: Report bugs and feature requests
- Discord/Slack: Community support
- Email: support@smartlunchbox.com

### Development
- Development environment: Follow setup guide above
- Contributing: See CONTRIBUTING.md
- Code style: Follow ESLint/Prettier configuration

## Conclusion

This setup guide provides comprehensive instructions for deploying the Smart Lunchbox IoT system. Follow the steps carefully and test thoroughly before production deployment.

For additional support or questions, refer to the documentation or contact the development team.
