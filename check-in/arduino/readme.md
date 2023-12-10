# Hardware

## Cable colors

| Color  | Meaning               |
| ------ | --------------------- |
| Red    | 5V                    |
| Black  | GND                   |
| Purple | Data Relay/ LED-Strip |
| Green  | Data Matrix           |
| Blue   | Data PIR              |

> The colors should be without orange and white, but i did not have enough cables in the right colors.

---

## [Relay](https://funduinoshop.com/bauelemente/taster-und-schalter/relais/relaiskarte-1-kanal-5v/230v-fuer-arduino)

The relay is used to control the LED-Strip.

### PINs

Starting at the green LED:

| PIN | Connection |
| --- | ---------- |
| VCC | 5V         |
| GND | GND        |
| IN  | D6         |

### Terminal

| Terminal | Connection |
| -------- | ---------- |
| COM      | 12V        |
| NO       | LED-Strip  |
| NC       |            |

`NO` is connected to `COM` when the relay is activated, which means the LED-Strip is getting power through the relay.

## [WS2812 Matrix (16x16)](https://funduinoshop.com/bauelemente/aktive-bauelemente/leds-und-leuchten/ws2812-matrix/flexible-matte/16x16-mit-256-pixeln-vergleichbar-mit-neopixel)

The LED Matrix is used to display the status of the check-in (success, error, etc.).

### PINs

| PIN | Connection |
| --- | ---------- |
| VCC | 5V         |
| DIN | D7         |
| GND | GND        |

## [PIR-Sensor HC-SR501](https://funduinoshop.com/elektronische-module/sensoren/bewegung-distanz/bewegungsmelder-pir-sensor-hc-sr501)

The PIR-Sensor is used to detect if no person has walked in front of the sensor for a certain time, to put the station to sleep if no one is using it.

### PINs

Starting near the jumper:

| PIN | Connection |
| --- | ---------- |
| GND | GND        |
| OUT | D8         |
| VCC | 5V         |

### Jumper

The yellow jumper on the PIR is used to set the mode of the sensor.

| Position      | Mode                                                                   |
| ------------- | ---------------------------------------------------------------------- |
| At the Edge   | Triggers only for the hold time and then deactivates                   |
| In the middle | Triggers for the hold time but stays active as long as there is motion |

### Potentiometer

#### Sensitivity

The orange potentiometer near the jumper is used to set the sensitivity of the sensor. The more clockwise the potentiometer is turned, the more sensitive the sensor is.

#### Holding Time

The orange potentiometer away from the jumper is used to set the time the sensor stays active after detecting motion. The more clockwise the potentiometer is turned, the longer the sensor stays active.