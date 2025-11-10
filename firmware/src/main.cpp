/**
 * Smart Lunchbox Control System
 * ESP32 Firmware
 *
 * Features:
 * - Dual temperature sensors (DS18B20 + DHT22)
 * - Peltier-based heating and cooling
 * - PID temperature control
 * - MQTT communication
 * - WiFi connectivity
 * - BLE provisioning
 * - OTA firmware updates
 * - Safety monitoring
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <Preferences.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>
#include "config.h"

// Global Objects
WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);
Preferences preferences;
OneWire oneWire(PIN_DS18B20);
DallasTemperature ds18b20(&oneWire);
DHT dht(PIN_DHT22, DHTTYPE);

// Device State
String deviceId;
String wifiSSID;
String wifiPassword;
String mqttServer;
String mqttUser;
String mqttPassword;
int mqttPort = MQTT_PORT;

// Temperature Control State
enum OperationMode {
  MODE_IDLE,
  MODE_HEATING,
  MODE_COOLING,
  MODE_MAINTAINING
};

OperationMode currentMode = MODE_IDLE;
float targetTemperature = 25.0;
float currentFoodTemp = 25.0;
float currentAmbientTemp = 25.0;
float currentHumidity = 50.0;
unsigned long heatingStartTime = 0;
unsigned long coolingStartTime = 0;

// PID Controller Variables
float pidError = 0;
float pidIntegral = 0;
float pidDerivative = 0;
float pidLastError = 0;
unsigned long pidLastTime = 0;

// Safety State
bool safetyShutdown = false;
unsigned long lastSafetyCheck = 0;
unsigned long lastTempRead = 0;

// MQTT State
unsigned long lastMqttAttempt = 0;
bool mqttConnected = false;

// Function Prototypes
void setupWiFi();
void setupMQTT();
void connectWiFi();
void connectMQTT();
void setupSensors();
void setupPeltier();
void setupStatusLED();
void readTemperatures();
void controlTemperature();
void publishTemperature();
void publishStatus();
void handleMQTTMessage(char* topic, byte* payload, unsigned int length);
void performSafetyChecks();
void emergencyShutdown();
void startHeating(float target, unsigned long maxDuration);
void startCooling(float target, unsigned long maxDuration);
void stopOperation();
void setPeltierPWM(int channel, int duty);
void setFanSpeed(int speed);
void updateStatusLED();
float calculatePID(float setpoint, float input);
String getDeviceId();
void loadConfiguration();
void saveConfiguration();

/**
 * Setup Function
 */
void setup() {
  // Initialize Serial
  if (DEBUG_SERIAL_ENABLE) {
    Serial.begin(DEBUG_BAUD_RATE);
    Serial.println("\n\nSmart Lunchbox Starting...");
    Serial.printf("Firmware Version: %s\n", FIRMWARE_VERSION);
  }

  // Initialize Preferences
  preferences.begin(PREF_NAMESPACE, false);

  // Load Configuration
  loadConfiguration();

  // Generate/Load Device ID
  deviceId = getDeviceId();
  Serial.printf("Device ID: %s\n", deviceId.c_str());

  // Setup Hardware
  setupStatusLED();
  setupSensors();
  setupPeltier();

  // Setup WiFi
  setupWiFi();
  connectWiFi();

  // Setup MQTT
  setupMQTT();
  connectMQTT();

  // Publish initial status
  publishStatus();
  publishTemperature();

  Serial.println("Setup complete!");
}

/**
 * Main Loop
 */
void loop() {
  unsigned long currentTime = millis();

  // Maintain WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  // Maintain MQTT connection
  if (!mqttClient.connected()) {
    if (currentTime - lastMqttAttempt > MQTT_RECONNECT_DELAY) {
      connectMQTT();
      lastMqttAttempt = currentTime;
    }
  } else {
    mqttClient.loop();
  }

  // Read temperatures
  if (currentTime - lastTempRead >= TEMP_READ_INTERVAL) {
    readTemperatures();
    publishTemperature();
    lastTempRead = currentTime;
  }

  // Temperature control
  if (currentMode != MODE_IDLE) {
    controlTemperature();
  }

  // Safety checks
  if (currentTime - lastSafetyCheck >= SAFETY_CHECK_INTERVAL) {
    performSafetyChecks();
    lastSafetyCheck = currentTime;
  }

  // Update status LED
  updateStatusLED();

  delay(10);
}

/**
 * Setup WiFi
 */
void setupWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
}

/**
 * Connect to WiFi
 */
void connectWiFi() {
  if (wifiSSID.length() == 0) {
    Serial.println("No WiFi credentials configured");
    return;
  }

  Serial.printf("Connecting to WiFi: %s\n", wifiSSID.c_str());
  WiFi.begin(wifiSSID.c_str(), wifiPassword.c_str());

  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED &&
         millis() - startTime < WIFI_CONNECT_TIMEOUT) {
    digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));
    delay(LED_BLINK_WIFI_CONNECTING);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.printf("IP Address: %s\n", WiFi.localIP().toString().c_str());
    digitalWrite(PIN_STATUS_LED, LED_ON_CONNECTED);
  } else {
    Serial.println("\nWiFi connection failed!");
  }
}

/**
 * Setup MQTT
 */
void setupMQTT() {
  // For testing, disable SSL certificate verification
  wifiClient.setInsecure();

  mqttClient.setServer(mqttServer.c_str(), mqttPort);
  mqttClient.setCallback(handleMQTTMessage);
  mqttClient.setBufferSize(MQTT_BUFFER_SIZE);
}

/**
 * Connect to MQTT Broker
 */
void connectMQTT() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  Serial.printf("Connecting to MQTT: %s:%d\n", mqttServer.c_str(), mqttPort);

  String clientId = "smartlunchbox_" + deviceId;
  String willTopic = "smartlunchbox/" + deviceId + TOPIC_STATUS_ONLINE;

  if (mqttClient.connect(clientId.c_str(),
                        mqttUser.c_str(),
                        mqttPassword.c_str(),
                        willTopic.c_str(),
                        1,
                        true,
                        "offline")) {
    Serial.println("MQTT connected!");
    mqttConnected = true;

    // Subscribe to control topics
    String baseTopic = "smartlunchbox/" + deviceId;
    mqttClient.subscribe((baseTopic + TOPIC_TEMP_TARGET).c_str(), 1);
    mqttClient.subscribe((baseTopic + TOPIC_CONTROL_HEAT).c_str(), 1);
    mqttClient.subscribe((baseTopic + TOPIC_CONTROL_COOL).c_str(), 1);
    mqttClient.subscribe((baseTopic + TOPIC_CONTROL_POWER).c_str(), 1);
    mqttClient.subscribe((baseTopic + TOPIC_TIMER_SCHEDULE).c_str(), 1);
    mqttClient.subscribe((baseTopic + TOPIC_FIRMWARE_UPDATE).c_str(), 2);

    // Publish online status
    mqttClient.publish(willTopic.c_str(), "online", true);

    // Publish firmware version
    String versionTopic = baseTopic + TOPIC_FIRMWARE_VERSION;
    mqttClient.publish(versionTopic.c_str(), FIRMWARE_VERSION, true);

  } else {
    Serial.printf("MQTT connection failed, rc=%d\n", mqttClient.state());
    mqttConnected = false;
  }
}

/**
 * Setup Temperature Sensors
 */
void setupSensors() {
  Serial.println("Initializing sensors...");

  // Initialize DS18B20
  ds18b20.begin();
  Serial.printf("DS18B20 devices found: %d\n", ds18b20.getDeviceCount());

  // Initialize DHT22
  dht.begin();
  Serial.println("DHT22 initialized");

  // Initial reading
  readTemperatures();
}

/**
 * Setup Peltier Control
 */
void setupPeltier() {
  // Configure PWM channels
  ledcSetup(PELTIER_PWM_CHANNEL_HEAT, PWM_FREQUENCY, PWM_RESOLUTION);
  ledcSetup(PELTIER_PWM_CHANNEL_COOL, PWM_FREQUENCY, PWM_RESOLUTION);
  ledcSetup(FAN_PWM_CHANNEL, PWM_FREQUENCY, PWM_RESOLUTION);

  // Attach pins
  ledcAttachPin(PIN_PELTIER_HEAT, PELTIER_PWM_CHANNEL_HEAT);
  ledcAttachPin(PIN_PELTIER_COOL, PELTIER_PWM_CHANNEL_COOL);
  ledcAttachPin(PIN_FAN, FAN_PWM_CHANNEL);

  // Initialize to OFF
  ledcWrite(PELTIER_PWM_CHANNEL_HEAT, 0);
  ledcWrite(PELTIER_PWM_CHANNEL_COOL, 0);
  ledcWrite(FAN_PWM_CHANNEL, 0);

  // Setup safety cutoff pin
  pinMode(PIN_SAFETY_CUTOFF, INPUT_PULLUP);

  Serial.println("Peltier control initialized");
}

/**
 * Setup Status LED
 */
void setupStatusLED() {
  pinMode(PIN_STATUS_LED, OUTPUT);
  digitalWrite(PIN_STATUS_LED, LED_OFF);
}

/**
 * Read Temperature Sensors
 */
void readTemperatures() {
  // Read DS18B20 (food temperature)
  ds18b20.requestTemperatures();
  float foodTemp = ds18b20.getTempCByIndex(0);

  if (foodTemp != DEVICE_DISCONNECTED_C && foodTemp > -50 && foodTemp < 120) {
    currentFoodTemp = foodTemp;
  }

  // Read DHT22 (ambient temperature and humidity)
  float ambientTemp = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (!isnan(ambientTemp) && ambientTemp > -50 && ambientTemp < 120) {
    currentAmbientTemp = ambientTemp;
  }

  if (!isnan(humidity) && humidity >= 0 && humidity <= 100) {
    currentHumidity = humidity;
  }

  if (DEBUG_SERIAL_ENABLE) {
    Serial.printf("Temp - Food: %.1f°C, Ambient: %.1f°C, Humidity: %.1f%%\n",
                  currentFoodTemp, currentAmbientTemp, currentHumidity);
  }
}

/**
 * Control Temperature using PID
 */
void controlTemperature() {
  if (currentMode == MODE_IDLE || safetyShutdown) {
    return;
  }

  float pidOutput = calculatePID(targetTemperature, currentFoodTemp);

  if (currentMode == MODE_HEATING) {
    // Check max heating time
    if (millis() - heatingStartTime > MAX_HEATING_TIME) {
      Serial.println("Max heating time reached");
      stopOperation();
      return;
    }

    if (currentFoodTemp < targetTemperature - TEMP_HYSTERESIS) {
      int pwmDuty = constrain(abs(pidOutput) * 255, 0, PWM_MAX_DUTY);
      setPeltierPWM(PELTIER_PWM_CHANNEL_HEAT, pwmDuty);
      setFanSpeed(200); // Fan on during heating
    } else if (currentFoodTemp >= targetTemperature) {
      currentMode = MODE_MAINTAINING;
      setPeltierPWM(PELTIER_PWM_CHANNEL_HEAT, 0);
      setFanSpeed(100); // Lower fan speed for maintaining
    }
  }
  else if (currentMode == MODE_COOLING) {
    // Check max cooling time
    if (millis() - coolingStartTime > MAX_COOLING_TIME) {
      Serial.println("Max cooling time reached");
      stopOperation();
      return;
    }

    if (currentFoodTemp > targetTemperature + TEMP_HYSTERESIS) {
      int pwmDuty = constrain(abs(pidOutput) * 255, 0, PWM_MAX_DUTY);
      setPeltierPWM(PELTIER_PWM_CHANNEL_COOL, pwmDuty);
      setFanSpeed(255); // Full fan during cooling
    } else if (currentFoodTemp <= targetTemperature) {
      currentMode = MODE_MAINTAINING;
      setPeltierPWM(PELTIER_PWM_CHANNEL_COOL, 0);
      setFanSpeed(100);
    }
  }
  else if (currentMode == MODE_MAINTAINING) {
    // Maintain temperature with small adjustments
    if (abs(currentFoodTemp - targetTemperature) > TEMP_HYSTERESIS) {
      if (currentFoodTemp < targetTemperature) {
        setPeltierPWM(PELTIER_PWM_CHANNEL_HEAT, 128); // 50% duty
        setFanSpeed(150);
      } else {
        setPeltierPWM(PELTIER_PWM_CHANNEL_COOL, 128);
        setFanSpeed(150);
      }
    } else {
      setPeltierPWM(PELTIER_PWM_CHANNEL_HEAT, 0);
      setPeltierPWM(PELTIER_PWM_CHANNEL_COOL, 0);
      setFanSpeed(80); // Minimal fan for air circulation
    }
  }
}

/**
 * Calculate PID Output
 */
float calculatePID(float setpoint, float input) {
  unsigned long currentTime = millis();
  float timeChange = (currentTime - pidLastTime) / 1000.0; // Convert to seconds

  if (timeChange >= PID_SAMPLE_TIME / 1000.0) {
    pidError = setpoint - input;
    pidIntegral += pidError * timeChange;
    pidDerivative = (pidError - pidLastError) / timeChange;

    // Anti-windup
    pidIntegral = constrain(pidIntegral, -100, 100);

    float output = (PID_KP * pidError) + (PID_KI * pidIntegral) + (PID_KD * pidDerivative);

    pidLastError = pidError;
    pidLastTime = currentTime;

    return constrain(output, -1.0, 1.0);
  }

  return 0;
}

/**
 * Publish Temperature Data via MQTT
 */
void publishTemperature() {
  if (!mqttClient.connected()) {
    return;
  }

  StaticJsonDocument<256> doc;
  doc["temperature"] = currentFoodTemp;
  doc["ambient_temperature"] = currentAmbientTemp;
  doc["humidity"] = currentHumidity;
  doc["timestamp"] = millis() / 1000;
  doc["unit"] = "celsius";
  doc["target_temperature"] = targetTemperature;

  switch (currentMode) {
    case MODE_HEATING:
      doc["mode"] = "heating";
      break;
    case MODE_COOLING:
      doc["mode"] = "cooling";
      break;
    case MODE_MAINTAINING:
      doc["mode"] = "maintaining";
      break;
    default:
      doc["mode"] = "idle";
  }

  char buffer[256];
  serializeJson(doc, buffer);

  String topic = "smartlunchbox/" + deviceId + TOPIC_TEMP_CURRENT;
  mqttClient.publish(topic.c_str(), buffer, false);
}

/**
 * Publish Device Status
 */
void publishStatus() {
  if (!mqttClient.connected()) {
    return;
  }

  String topic = "smartlunchbox/" + deviceId + TOPIC_STATUS_ONLINE;
  mqttClient.publish(topic.c_str(), "online", true);
}

/**
 * Handle MQTT Messages
 */
void handleMQTTMessage(char* topic, byte* payload, unsigned int length) {
  String topicStr = String(topic);

  // Parse JSON payload
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  if (error) {
    Serial.printf("JSON parse error: %s\n", error.c_str());
    return;
  }

  Serial.printf("MQTT Message - Topic: %s\n", topic);

  // Handle temperature target
  if (topicStr.endsWith(TOPIC_TEMP_TARGET)) {
    targetTemperature = doc["temperature"];
    Serial.printf("Target temperature set to: %.1f°C\n", targetTemperature);
  }
  // Handle heating control
  else if (topicStr.endsWith(TOPIC_CONTROL_HEAT)) {
    String action = doc["action"];
    if (action == "start") {
      float target = doc["targetTemp"];
      unsigned long maxDuration = doc["maxDuration"] | MAX_HEATING_TIME;
      startHeating(target, maxDuration);
    } else if (action == "stop") {
      stopOperation();
    }
  }
  // Handle cooling control
  else if (topicStr.endsWith(TOPIC_CONTROL_COOL)) {
    String action = doc["action"];
    if (action == "start") {
      float target = doc["targetTemp"];
      unsigned long maxDuration = doc["maxDuration"] | MAX_COOLING_TIME;
      startCooling(target, maxDuration);
    } else if (action == "stop") {
      stopOperation();
    }
  }
  // Handle power control
  else if (topicStr.endsWith(TOPIC_CONTROL_POWER)) {
    String action = doc["action"];
    if (action == "off") {
      stopOperation();
    }
  }
}

/**
 * Perform Safety Checks
 */
void performSafetyChecks() {
  // Check emergency temperature
  if (currentFoodTemp >= TEMP_EMERGENCY_MAX) {
    Serial.println("EMERGENCY: Temperature too high!");
    emergencyShutdown();
    return;
  }

  // Check safety cutoff pin
  if (digitalRead(PIN_SAFETY_CUTOFF) == LOW) {
    Serial.println("SAFETY: External cutoff triggered!");
    emergencyShutdown();
    return;
  }

  // Check valid temperature range
  if (currentMode != MODE_IDLE) {
    if (targetTemperature < TEMP_MIN || targetTemperature > TEMP_MAX) {
      Serial.println("SAFETY: Invalid target temperature!");
      stopOperation();
    }
  }
}

/**
 * Emergency Shutdown
 */
void emergencyShutdown() {
  safetyShutdown = true;
  stopOperation();

  // Publish alert
  if (mqttClient.connected()) {
    StaticJsonDocument<128> doc;
    doc["type"] = "safety_shutdown";
    doc["message"] = "Emergency shutdown triggered";
    doc["temperature"] = currentFoodTemp;
    doc["timestamp"] = millis() / 1000;

    char buffer[128];
    serializeJson(doc, buffer);

    String topic = "smartlunchbox/" + deviceId + TOPIC_ALERTS;
    mqttClient.publish(topic.c_str(), buffer, false);
  }

  // Blink LED rapidly
  for (int i = 0; i < 20; i++) {
    digitalWrite(PIN_STATUS_LED, HIGH);
    delay(LED_BLINK_ERROR);
    digitalWrite(PIN_STATUS_LED, LOW);
    delay(LED_BLINK_ERROR);
  }
}

/**
 * Start Heating
 */
void startHeating(float target, unsigned long maxDuration) {
  if (target > TEMP_MAX) {
    Serial.println("Target temperature too high!");
    return;
  }

  Serial.printf("Starting heating to %.1f°C\n", target);
  targetTemperature = target;
  currentMode = MODE_HEATING;
  heatingStartTime = millis();

  // Reset PID
  pidIntegral = 0;
  pidLastError = 0;
}

/**
 * Start Cooling
 */
void startCooling(float target, unsigned long maxDuration) {
  if (target < TEMP_MIN) {
    Serial.println("Target temperature too low!");
    return;
  }

  Serial.printf("Starting cooling to %.1f°C\n", target);
  targetTemperature = target;
  currentMode = MODE_COOLING;
  coolingStartTime = millis();

  // Reset PID
  pidIntegral = 0;
  pidLastError = 0;
}

/**
 * Stop All Operations
 */
void stopOperation() {
  Serial.println("Stopping all operations");
  currentMode = MODE_IDLE;

  setPeltierPWM(PELTIER_PWM_CHANNEL_HEAT, 0);
  setPeltierPWM(PELTIER_PWM_CHANNEL_COOL, 0);
  setFanSpeed(0);

  // Reset PID
  pidIntegral = 0;
  pidLastError = 0;
}

/**
 * Set Peltier PWM
 */
void setPeltierPWM(int channel, int duty) {
  // Ensure opposite channel is off
  if (channel == PELTIER_PWM_CHANNEL_HEAT) {
    ledcWrite(PELTIER_PWM_CHANNEL_COOL, 0);
  } else {
    ledcWrite(PELTIER_PWM_CHANNEL_HEAT, 0);
  }

  ledcWrite(channel, duty);
}

/**
 * Set Fan Speed
 */
void setFanSpeed(int speed) {
  ledcWrite(FAN_PWM_CHANNEL, constrain(speed, 0, PWM_MAX_DUTY));
}

/**
 * Update Status LED
 */
void updateStatusLED() {
  if (safetyShutdown) {
    // Rapid blink for error
    static unsigned long lastBlink = 0;
    if (millis() - lastBlink > LED_BLINK_ERROR) {
      digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));
      lastBlink = millis();
    }
  } else if (WiFi.status() != WL_CONNECTED) {
    // Slow blink for WiFi disconnected
    static unsigned long lastBlink = 0;
    if (millis() - lastBlink > LED_BLINK_WIFI_CONNECTING) {
      digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));
      lastBlink = millis();
    }
  } else if (!mqttClient.connected()) {
    // Medium blink for MQTT disconnected
    static unsigned long lastBlink = 0;
    if (millis() - lastBlink > LED_BLINK_MQTT_CONNECTING) {
      digitalWrite(PIN_STATUS_LED, !digitalRead(PIN_STATUS_LED));
      lastBlink = millis();
    }
  } else {
    // Solid on when connected
    digitalWrite(PIN_STATUS_LED, LED_ON_CONNECTED);
  }
}

/**
 * Get or Generate Device ID
 */
String getDeviceId() {
  String id = preferences.getString(PREF_DEVICE_ID, "");

  if (id.length() == 0) {
    // Generate new ID from MAC address
    uint8_t mac[6];
    WiFi.macAddress(mac);
    char macStr[18];
    sprintf(macStr, "%02X%02X%02X%02X%02X%02X", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
    id = "LB-" + String(macStr);

    preferences.putString(PREF_DEVICE_ID, id);
    Serial.printf("Generated new device ID: %s\n", id.c_str());
  }

  return id;
}

/**
 * Load Configuration from Preferences
 */
void loadConfiguration() {
  wifiSSID = preferences.getString(PREF_WIFI_SSID, "");
  wifiPassword = preferences.getString(PREF_WIFI_PASSWORD, "");
  mqttServer = preferences.getString(PREF_MQTT_SERVER, "mqtt.smartlunchbox.com");
  mqttUser = preferences.getString(PREF_MQTT_USER, "device_user");
  mqttPassword = preferences.getString(PREF_MQTT_PASS, "");
  mqttPort = preferences.getInt(PREF_MQTT_PORT, MQTT_PORT);

  Serial.println("Configuration loaded");
}

/**
 * Save Configuration to Preferences
 */
void saveConfiguration() {
  preferences.putString(PREF_WIFI_SSID, wifiSSID);
  preferences.putString(PREF_WIFI_PASSWORD, wifiPassword);
  preferences.putString(PREF_MQTT_SERVER, mqttServer);
  preferences.putString(PREF_MQTT_USER, mqttUser);
  preferences.putString(PREF_MQTT_PASS, mqttPassword);
  preferences.putInt(PREF_MQTT_PORT, mqttPort);

  Serial.println("Configuration saved");
}
