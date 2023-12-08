# Hardware

## Cable colors

| Color        | Meaning             |
| ------------ | ------------------- |
| Red / Orange | 5V                  |
| Black / Gray | GND                 |
| Blue         | Data to component   |
| Yellow       | Data from component |

> The colors should be without orange and gray, but i did not have enough cables

## Relay

The relay is used to control the LED-Strip.

### PINs

| PIN | Connection |
| --- | ---------- |
| VCC | 5V         |
| GND | GND        |
| IN  | D8         |

### Terminal

| Terminal | Connection |
| -------- | ---------- |
| COM      | 12V        |
| NO       | LED-Strip  |
| NC       |            |

`NO` is connected to `COM` when the relay is activated, which means the LED-Strip is getting power through the relay.

## PIR-Sensor

The PIR-Sensor is used to detect if no person has walked in front of the sensor for a certain time, to put the station to sleep if no one is using it.

### PINs

| PIN | Connection |
| --- | ---------- |
| VCC | 5V         |
| OUT | D6         |
| GND | GND        |

### Jumper

The yellow jumper on the PIR is used to set the mode of the sensor.

| Position      | Mode                                                                    |
| ------------- | ----------------------------------------------------------------------- |
| At the Edge   | Triggers only for the hold time and then deactivates                    |
| In the middle | Triggers for the hold time but stays active as long as there is motion |

### Potentiometer

#### Sensitivity

The orange potentiometer near the jumper is used to set the sensitivity of the sensor. The more clockwise the potentiometer is turned, the more sensitive the sensor is.

#### Holding Time

The orange potentiometer away from the jumper is used to set the time the sensor stays active after detecting motion. The more clockwise the potentiometer is turned, the longer the sensor stays active.

## LED Matrix

The LED Matrix is used to display the status of the check-in (success, error, etc.).

### PINs

| PIN | Connection |
| --- | ---------- |
| VCC | 5V         |
| DIN | 7          |
| GND | GND        |