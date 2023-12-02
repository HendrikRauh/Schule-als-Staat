# Serial Commands

This document describes the commands used in the Arduino program for serial communication with the scanner.

## To Arduino

- `error`: This command is used when the scanner could not successfully read a QR code.
- `in`: This command is used when a person enters.
- `out`: This command is used when a person exits.
- `inout`: This command is used when the direction is unknown.
- `closing`: This command is used when the system is closing.
- `connected`: This command is used when the system is connected.

> Feedback: `OK` or `ERROR`

## To PC

- `wakeUp`: This command is used to wake up the scanner (activate camera etc.)
- `sleep`: This command is used to put the scanner to sleep (deactivate camera etc.)