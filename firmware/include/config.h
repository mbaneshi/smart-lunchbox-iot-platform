#ifndef CONFIG_H
#define CONFIG_H

// Device Information
#define DEVICE_NAME "SmartLunchbox"
#define FIRMWARE_VERSION "1.0.0"
#define DEVICE_MODEL "SLB-ESP32-V1"

// GPIO Pin Definitions
#define PIN_DS18B20 4          // Temperature Sensor 1 (DS18B20)
#define PIN_DHT22 5            // Temperature Sensor 2 (DHT22)
#define PIN_PELTIER_HEAT 18    // Peltier Relay (Heating)
#define PIN_PELTIER_COOL 19    // Peltier Relay (Cooling)
#define PIN_FAN 21             // Fan Control (PWM)
#define PIN_STATUS_LED 22      // Status LED
#define PIN_SAFETY_CUTOFF 23   // Safety Cutoff Input

// DHT Sensor Type
#define DHTTYPE DHT22

// Temperature Settings
#define TEMP_MIN 4.0f
#define TEMP_MAX 65.0f
#define TEMP_EMERGENCY_MAX 70.0f
#define TEMP_HYSTERESIS 0.5f   // Temperature hysteresis for control
#define TEMP_READ_INTERVAL 2000 // ms

// Safety Limits
#define MAX_HEATING_TIME 3600000    // 60 minutes in ms
#define MAX_COOLING_TIME 7200000    // 120 minutes in ms
#define SAFETY_CHECK_INTERVAL 1000  // ms

// Peltier Control Settings
#define PELTIER_PWM_CHANNEL_HEAT 0
#define PELTIER_PWM_CHANNEL_COOL 1
#define FAN_PWM_CHANNEL 2
#define PWM_FREQUENCY 5000
#define PWM_RESOLUTION 8
#define PWM_MAX_DUTY 255

// PID Controller Parameters
#define PID_KP 2.0f
#define PID_KI 0.5f
#define PID_KD 1.0f
#define PID_SAMPLE_TIME 2000 // ms

// WiFi Settings
#define WIFI_CONNECT_TIMEOUT 30000 // ms
#define WIFI_RECONNECT_INTERVAL 60000 // ms
#define MAX_WIFI_NETWORKS 5

// MQTT Settings
#define MQTT_PORT 8883
#define MQTT_KEEPALIVE 60
#define MQTT_RECONNECT_DELAY 5000
#define MQTT_MAX_RETRIES 3
#define MQTT_BUFFER_SIZE 512

// BLE Settings (for provisioning)
#define BLE_DEVICE_NAME "SmartLunchbox"
#define BLE_SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define BLE_CHAR_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
#define BLE_PROVISIONING_TIMEOUT 300000 // 5 minutes

// Status LED Patterns
#define LED_BLINK_WIFI_CONNECTING 200
#define LED_BLINK_MQTT_CONNECTING 500
#define LED_BLINK_ERROR 100
#define LED_ON_CONNECTED HIGH
#define LED_OFF LOW

// MQTT Topics (will be prefixed with smartlunchbox/{device_id}/)
#define TOPIC_TEMP_CURRENT "/temperature/current"
#define TOPIC_TEMP_TARGET "/temperature/target"
#define TOPIC_CONTROL_HEAT "/control/heat"
#define TOPIC_CONTROL_COOL "/control/cool"
#define TOPIC_CONTROL_POWER "/control/power"
#define TOPIC_STATUS_ONLINE "/status/online"
#define TOPIC_TIMER_SCHEDULE "/timer/schedule"
#define TOPIC_ALERTS "/alerts"
#define TOPIC_FIRMWARE_VERSION "/firmware/version"
#define TOPIC_FIRMWARE_UPDATE "/firmware/update"

// Preferences Keys
#define PREF_NAMESPACE "smartlunchbox"
#define PREF_DEVICE_ID "device_id"
#define PREF_WIFI_SSID "wifi_ssid"
#define PREF_WIFI_PASSWORD "wifi_pass"
#define PREF_MQTT_SERVER "mqtt_server"
#define PREF_MQTT_USER "mqtt_user"
#define PREF_MQTT_PASS "mqtt_pass"
#define PREF_MQTT_PORT "mqtt_port"

// Debug Settings
#define DEBUG_SERIAL_ENABLE true
#define DEBUG_BAUD_RATE 115200

#endif // CONFIG_H
