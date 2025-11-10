# Smart Lunchbox Hardware Guide

## Overview

This document provides comprehensive information about the hardware components, assembly instructions, and schematics for the Smart Lunchbox Control System.

## Table of Contents

1. [Components](#components)
2. [Schematic Diagram](#schematic-diagram)
3. [Assembly Instructions](#assembly-instructions)
4. [Wiring Guide](#wiring-guide)
5. [Power Supply Setup](#power-supply-setup)
6. [Safety Considerations](#safety-considerations)
7. [Testing Procedures](#testing-procedures)
8. [Troubleshooting](#troubleshooting)

## Components

### Required Components

#### Microcontroller
- **ESP32-WROOM-32D** or **ESP32-S3**
  - Flash: 4MB minimum
  - Wi-Fi: 802.11 b/g/n (2.4 GHz)
  - Bluetooth: BLE 5.0
  - GPIO: Minimum 6 pins required
  - Operating Voltage: 3.3V
  - Quantity: 1

#### Temperature Sensors
- **DS18B20 Digital Temperature Sensor**
  - Temperature Range: -55°C to +125°C
  - Accuracy: ±0.5°C (-10°C to +85°C)
  - Interface: 1-Wire
  - Package: TO-92 or Waterproof probe
  - Quantity: 1

- **DHT22 Temperature & Humidity Sensor**
  - Temperature Range: -40°C to +80°C
  - Humidity Range: 0-100% RH
  - Accuracy: ±0.5°C, ±2-5% RH
  - Interface: Single-wire digital
  - Quantity: 1

#### Thermal Management
- **TEC1-12706 Peltier Module**
  - Voltage: 12V DC
  - Current: 6A maximum
  - Power: 72W maximum
  - Temperature Differential: 66°C
  - Dimensions: 40mm x 40mm x 3.6mm
  - Quantity: 1

- **Heatsink**
  - Size: 40mm x 40mm minimum
  - Material: Aluminum
  - Fins: Maximum surface area
  - Quantity: 2 (hot and cold side)

- **Cooling Fan**
  - Size: 40mm x 40mm
  - Voltage: 12V DC
  - Current: 0.15A typical
  - Speed: 5000-7000 RPM
  - Airflow: 10+ CFM
  - Quantity: 1-2

#### Power Components
- **12V Power Supply**
  - Type: AC/DC adapter or Mean Well RS-150-12
  - Input: 100-240V AC, 50/60Hz
  - Output: 12V DC, 10A (120W)
  - Quantity: 1

- **LM2596 Buck Converter**
  - Input: 12V DC
  - Output: 3.3V DC (adjustable)
  - Current: 3A maximum
  - For ESP32 power
  - Quantity: 1

#### Control & Protection
- **MOSFET Modules** (or Relay Modules)
  - Type: IRF520 or IRF540N MOSFET
  - Or: 2-channel 5V relay module
  - Rating: 12V, 10A minimum
  - Quantity: 2 (heat and cool control)

- **4.7kΩ Resistor**
  - For DS18B20 pullup
  - Quantity: 1

- **10kΩ Resistor**
  - For DHT22 pullup
  - Quantity: 1

- **Status LED**
  - Color: RGB or single color
  - Current: 20mA
  - Voltage: 3.3V
  - Quantity: 1

- **220Ω Resistor**
  - For LED current limiting
  - Quantity: 1

#### Thermal Interface
- **Thermal Paste**
  - Type: High-performance (Arctic MX-4 or similar)
  - For Peltier-to-heatsink interface
  - Quantity: 2g tube

#### Enclosure & Insulation
- **Insulated Container**
  - Type: Vacuum-insulated or foam-insulated lunchbox
  - Size: Appropriate for food storage
  - Material: Stainless steel interior recommended

- **Foam Insulation**
  - Type: Closed-cell foam
  - Thickness: 10-20mm
  - For additional thermal isolation

#### Miscellaneous
- **Jumper Wires**
  - Type: Female-to-female, male-to-female
  - Length: 10-20cm
  - Quantity: 20-30 pieces

- **Breadboard** (for prototyping)
  - Size: Half or full size
  - Optional for testing

- **PCB** (for production)
  - Custom designed board
  - Or universal prototype board

- **Power Connector**
  - Type: DC barrel jack or USB-C
  - Rating: 12V, 10A

- **Safety Fuse**
  - Type: Automotive blade fuse or inline fuse
  - Rating: 10A
  - Quantity: 1

## Schematic Diagram

### System Block Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Power Supply (12V 10A)                   │
└─────────┬──────────────────────────┬────────────────────────┘
          │                          │
          │                          │
          ▼                          ▼
    ┌─────────┐              ┌──────────────┐
    │  Buck   │              │   MOSFET     │
    │Converter│              │   Drivers    │
    │ 12V→3.3V│              │              │
    └────┬────┘              └──────┬───────┘
         │                          │
         │                          ▼
         │                   ┌─────────────┐
         │                   │   Peltier   │
         │                   │   Module    │
         │                   │  + Fan      │
         │                   └─────────────┘
         │
         ▼
    ┌─────────────────────────────────────┐
    │            ESP32-WROOM-32D          │
    │                                     │
    │  GPIO 4  ──→ DS18B20 (Food Temp)   │
    │  GPIO 5  ──→ DHT22 (Ambient)       │
    │  GPIO 18 ──→ Peltier Heat Control  │
    │  GPIO 19 ──→ Peltier Cool Control  │
    │  GPIO 21 ──→ Fan PWM Control       │
    │  GPIO 22 ──→ Status LED            │
    │  GPIO 23 ──→ Safety Cutoff Input   │
    │                                     │
    │  Wi-Fi   ──→ MQTT Broker           │
    │  BLE     ──→ Provisioning          │
    └─────────────────────────────────────┘
```

### Detailed Pin Connections

#### ESP32 Pin Configuration

```
ESP32 Pin    │ Connection              │ Description
─────────────┼─────────────────────────┼────────────────────────────
GPIO 4       │ DS18B20 Data            │ 1-Wire temperature sensor
GPIO 5       │ DHT22 Data              │ Digital temp/humidity sensor
GPIO 18      │ MOSFET Gate (Heat)      │ Peltier heating control
GPIO 19      │ MOSFET Gate (Cool)      │ Peltier cooling control
GPIO 21      │ Fan PWM                 │ Fan speed control
GPIO 22      │ Status LED              │ System status indicator
GPIO 23      │ Safety Input            │ Emergency shutoff
3.3V         │ Sensors VCC             │ Power for sensors
GND          │ Common Ground           │ System ground
```

#### DS18B20 Wiring

```
DS18B20 Pin  │ Connection              │ Notes
─────────────┼─────────────────────────┼────────────────────
VDD (Red)    │ ESP32 3.3V              │ Power supply
DQ (Yellow)  │ ESP32 GPIO 4            │ Data line (4.7kΩ pullup)
GND (Black)  │ ESP32 GND               │ Ground
```

**Important:** Connect a 4.7kΩ resistor between VDD and DQ (pullup resistor).

#### DHT22 Wiring

```
DHT22 Pin    │ Connection              │ Notes
─────────────┼─────────────────────────┼────────────────────
VCC (Pin 1)  │ ESP32 3.3V              │ Power supply
DATA (Pin 2) │ ESP32 GPIO 5            │ Data line (10kΩ pullup)
NC (Pin 3)   │ Not Connected           │ Not used
GND (Pin 4)  │ ESP32 GND               │ Ground
```

**Note:** Some DHT22 modules have built-in pullup resistors.

#### Peltier Module Control

```
Component       │ Connection              │ Notes
────────────────┼─────────────────────────┼────────────────────
MOSFET Source   │ GND                     │ Common ground
MOSFET Drain    │ Peltier (-)             │ Low side switching
MOSFET Gate     │ ESP32 GPIO 18/19        │ Control signal
Peltier (+)     │ 12V Power Supply        │ High side
Flyback Diode   │ Across Peltier          │ Protection (optional)
```

### Power Distribution Diagram

```
AC Mains (110-240V)
        │
        ▼
   ┌─────────┐
   │  AC/DC  │
   │  Power  │
   │ Supply  │
   └────┬────┘
        │ 12V DC, 10A
        ├──────────────┬──────────────┬───────────────┐
        │              │              │               │
        ▼              ▼              ▼               ▼
    ┌───────┐    ┌─────────┐    ┌────────┐    ┌──────────┐
    │ Buck  │    │ Peltier │    │  Fan   │    │  MOSFET  │
    │3.3V   │    │ Module  │    │ 12V    │    │ Drivers  │
    └───┬───┘    └─────────┘    └────────┘    └──────────┘
        │
        ▼
   ┌─────────┐
   │  ESP32  │
   │ Sensors │
   │   LED   │
   └─────────┘
```

## Assembly Instructions

### Step 1: Prepare Components

1. Gather all components listed above
2. Test ESP32 with a simple blink sketch
3. Verify power supply output voltage (should be 12V ±0.5V)
4. Check continuity of all wires

### Step 2: Build Power Circuit

1. **Buck Converter Setup:**
   - Connect 12V input to buck converter
   - Adjust output to 3.3V using onboard potentiometer
   - Verify output voltage with multimeter
   - Add capacitors (100µF) on input and output for stability

2. **Power Distribution:**
   - Create common ground bus
   - Connect all ground connections to ground bus
   - Add fuse in series with 12V power line

### Step 3: Connect Temperature Sensors

1. **DS18B20 Setup:**
   - Solder wires to DS18B20 pins (VDD, DQ, GND)
   - Add 4.7kΩ resistor between VDD and DQ
   - Connect VDD to 3.3V, GND to ground, DQ to GPIO 4
   - Use heat shrink tubing for insulation

2. **DHT22 Setup:**
   - Connect DHT22 to breadboard or PCB
   - Wire VCC to 3.3V, GND to ground, DATA to GPIO 5
   - Add 10kΩ pullup resistor if not built-in

### Step 4: Assemble Peltier Cooling System

1. **Heatsink Preparation:**
   - Clean all surfaces with isopropyl alcohol
   - Apply thin, even layer of thermal paste to both heatsinks

2. **Peltier Assembly:**
   ```
   [Fan] → [Heatsink] ← [Peltier] → [Heatsink] → [Food Container]

   Cold Side (blue)                  Hot Side (red)
   ```

   - Place Peltier module between two heatsinks
   - Apply thermal paste on both sides of Peltier
   - Secure with thermal adhesive or mechanical clamps
   - Mount fan on hot-side heatsink (blowing outward)

3. **Install in Enclosure:**
   - Mount assembly on container wall
   - Ensure cold side faces food compartment
   - Insulate hot side from cold side
   - Seal gaps with foam or silicone

### Step 5: Wire MOSFET/Relay Control

1. **Heating Circuit:**
   - Connect GPIO 18 to MOSFET gate (through 220Ω resistor)
   - MOSFET source to GND
   - MOSFET drain to Peltier negative (cooling side)
   - Peltier positive (heating side) to 12V

2. **Cooling Circuit:**
   - Connect GPIO 19 to second MOSFET gate
   - Wire as above but with reversed polarity for Peltier

3. **Fan Control:**
   - GPIO 21 to MOSFET gate for PWM control
   - Or connect fan directly to 12V for always-on operation

### Step 6: Add Status LED

1. Connect LED anode to GPIO 22 through 220Ω resistor
2. Connect LED cathode to GND
3. Optional: Use RGB LED for multi-color status

### Step 7: Safety Features

1. **Safety Cutoff:**
   - Connect normally-closed switch to GPIO 23
   - Pull GPIO 23 to GND when switch opens
   - Mount switch in accessible location

2. **Thermal Fuse:**
   - Install thermal fuse (70°C rating) in series with Peltier
   - Mount fuse on hot-side heatsink

### Step 8: Final Assembly

1. Mount ESP32 on breadboard or PCB
2. Organize wiring with zip ties or cable management
3. Double-check all connections against schematic
4. Insulate exposed connections
5. Mount components securely in enclosure
6. Add strain relief for external wires

## Wiring Guide

### Color Code Recommendations

```
Wire Color   │ Usage
─────────────┼────────────────────────────
Red          │ 12V Positive
Black        │ Ground (GND)
Orange       │ 3.3V
Yellow       │ Data/Signal lines
Blue         │ PWM signals
Green        │ Sensor signals
White        │ Communication (UART, etc.)
```

### Connection Checklist

- [ ] ESP32 powered at 3.3V
- [ ] All grounds connected to common ground
- [ ] DS18B20 with 4.7kΩ pullup
- [ ] DHT22 connected correctly
- [ ] Peltier controlled by MOSFETs
- [ ] Fan PWM connected
- [ ] Status LED with current-limiting resistor
- [ ] Safety cutoff switch installed
- [ ] Power supply fuse installed
- [ ] All connections insulated
- [ ] Thermal paste applied properly

## Power Supply Setup

### Voltage Requirements

```
Component      │ Voltage │ Current  │ Power
───────────────┼─────────┼──────────┼────────
ESP32          │ 3.3V    │ 500mA    │ 1.65W
DS18B20        │ 3.3V    │ 1mA      │ 0.003W
DHT22          │ 3.3V    │ 1.5mA    │ 0.005W
Peltier (max)  │ 12V     │ 6A       │ 72W
Fan            │ 12V     │ 150mA    │ 1.8W
MOSFETs        │ -       │ -        │ 2W (heat)
───────────────┼─────────┼──────────┼────────
TOTAL          │ 12V     │ ~7A      │ ~85W
```

### Power Supply Selection

**Recommended:** Mean Well RS-150-12
- Output: 12V, 12.5A (150W)
- Efficiency: 88%
- Protection: Overload, short circuit, over voltage
- Cooling: Natural convection

**Alternative:** 12V 10A wall adapter
- Ensure UL/CE certification
- Check temperature rating
- Verify sustained load capacity

### Power Distribution

1. **Main Power Rail:**
   - Use 18 AWG wire for 12V distribution
   - Add 100µF capacitor near ESP32
   - Add 1000µF capacitor near Peltier

2. **Buck Converter:**
   - Input: 12V
   - Output: 3.3V, 3A
   - Efficiency: ~85%
   - Heat dissipation: Mount on small heatsink

## Safety Considerations

### Electrical Safety

1. **Insulation:**
   - All exposed connections must be insulated
   - Use heat shrink tubing on solder joints
   - Keep high-voltage components separated

2. **Fusing:**
   - Install 10A fuse in 12V line
   - Use slow-blow type for inrush current
   - Mount in accessible location

3. **Grounding:**
   - Ensure proper grounding of AC supply
   - Use polarized connectors
   - No ground loops

### Thermal Safety

1. **Temperature Limits:**
   - Software limit: 65°C
   - Emergency shutoff: 70°C
   - Thermal fuse: 70°C

2. **Overheating Prevention:**
   - Adequate heatsinking on hot side
   - Forced air cooling (fan)
   - Thermal paste properly applied
   - No obstruction of airflow

3. **Cold Side Protection:**
   - Minimum temperature: 4°C (prevent freezing)
   - Insulation prevents condensation
   - Moisture-resistant components

### Food Safety

1. **Temperature Ranges:**
   - Hot holding: 60°C minimum
   - Cold storage: 4°C maximum
   - Danger zone: 4-60°C (avoid prolonged exposure)

2. **Materials:**
   - Food-grade contact surfaces
   - Stainless steel preferred
   - BPA-free plastics

3. **Cleaning:**
   - Electronics sealed from food compartment
   - Removable, washable liner
   - Drainage for condensation

### User Safety

1. **Hot Surfaces:**
   - Warn user about heatsink temperature
   - Insulate hot-side components
   - Add warning labels

2. **Electrical:**
   - No user-serviceable parts
   - Tamper-evident seals
   - Clear safety instructions

## Testing Procedures

### Pre-Assembly Tests

1. **Power Supply Test:**
   - Measure output voltage: 12V ±0.5V
   - Check ripple: <100mV pk-pk
   - Verify current capacity under load

2. **Buck Converter Test:**
   - Adjust output to 3.3V ±0.1V
   - Load test with 500mA dummy load
   - Check efficiency and temperature

3. **Sensor Tests:**
   - DS18B20: Read room temperature
   - DHT22: Read temperature and humidity
   - Verify readings are reasonable

### Post-Assembly Tests

1. **Continuity Check:**
   - Verify all connections with multimeter
   - Check for shorts between power rails
   - Confirm ground connections

2. **Power-Up Test:**
   - Power ESP32 only (no Peltier)
   - Check voltage at all points
   - Verify LED operation

3. **Sensor Integration:**
   - Upload test firmware
   - Read sensor values via serial
   - Verify data accuracy

### Functional Tests

1. **Heating Test:**
   - Set target temperature above ambient
   - Verify heating activation
   - Monitor temperature rise
   - Check for overshoot

2. **Cooling Test:**
   - Set target below ambient
   - Verify cooling activation
   - Monitor temperature drop
   - Check fan operation

3. **Safety Tests:**
   - Trigger safety cutoff
   - Verify emergency shutdown
   - Test temperature limits
   - Check fuse operation

### Performance Tests

1. **Thermal Performance:**
   - Heating rate: Measure °C/minute
   - Cooling rate: Measure °C/minute
   - Steady-state error: Target ± actual
   - Response time to setpoint changes

2. **Power Consumption:**
   - Idle: <2W
   - Heating: 40-75W (depending on load)
   - Cooling: 40-75W
   - Maintaining: 10-20W

3. **Reliability:**
   - Run 24-hour test
   - Cycle heating/cooling 100 times
   - Check for component failures
   - Monitor temperature stability

## Troubleshooting

### Common Issues

#### ESP32 Won't Boot

- **Symptoms:** No LED, no serial output
- **Causes:**
  - Power supply voltage incorrect
  - Short circuit
  - GPIO 0 pulled low during boot
- **Solutions:**
  - Verify 3.3V at ESP32 VCC
  - Check for shorts with multimeter
  - Disconnect GPIO 0 during boot

#### Sensors Not Reading

- **DS18B20 Issues:**
  - Check pullup resistor (4.7kΩ)
  - Verify wiring (VDD, GND, DQ)
  - Test with example sketch
  - Try different sensor

- **DHT22 Issues:**
  - Check power supply (3.3V)
  - Verify data pin connection
  - Increase read delay (2000ms)
  - Replace sensor if faulty

#### Peltier Not Working

- **No Heat/Cool:**
  - Check MOSFET connections
  - Verify gate voltage (3.3V when on)
  - Check Peltier polarity
  - Test with direct 12V connection

- **Weak Performance:**
  - Insufficient thermal paste
  - Poor heatsink contact
  - Inadequate airflow
  - Power supply current limited

#### Overheating

- **Causes:**
  - Fan not running
  - Heatsink undersized
  - Blocked airflow
  - Ambient temperature too high

- **Solutions:**
  - Verify fan operation
  - Upgrade heatsink
  - Clear obstructions
  - Add insulation between hot/cold sides

#### WiFi Connection Issues

- **Symptoms:** Cannot connect to WiFi
- **Causes:**
  - Incorrect credentials
  - Signal too weak
  - 5GHz network (ESP32 is 2.4GHz only)
  - Power supply noise

- **Solutions:**
  - Verify SSID and password
  - Move closer to router
  - Use 2.4GHz network
  - Add filter capacitors

### Diagnostic Tools

1. **Serial Monitor:**
   - Check boot messages
   - Monitor sensor readings
   - View MQTT messages
   - Debug output

2. **Multimeter:**
   - Measure voltages
   - Check continuity
   - Test resistance
   - Verify ground connections

3. **Oscilloscope:**
   - Check PWM signals
   - Measure power supply ripple
   - Debug communication issues
   - Analyze signal integrity

4. **Thermal Camera:**
   - Identify hot spots
   - Check heat distribution
   - Verify thermal paste application
   - Monitor temperature gradients

## Maintenance

### Regular Maintenance

1. **Weekly:**
   - Clean food contact surfaces
   - Check for condensation
   - Verify operation

2. **Monthly:**
   - Inspect wiring for damage
   - Clean heatsink fins
   - Test safety features
   - Update firmware if available

3. **Annually:**
   - Replace thermal paste
   - Check fan bearings
   - Test power supply output
   - Recalibrate sensors if needed

### Replacement Parts

Keep spare parts on hand:
- DS18B20 sensor
- DHT22 sensor
- Fan (40mm, 12V)
- MOSFETs
- Fuse (10A)
- Thermal paste

## Conclusion

This hardware guide provides comprehensive information for building the Smart Lunchbox Control System. Always prioritize safety and follow proper assembly procedures. Test thoroughly before use and maintain regularly for optimal performance.

For additional support, refer to:
- Firmware documentation
- API documentation
- Setup guides
- Community forums
