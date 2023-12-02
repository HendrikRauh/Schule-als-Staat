/*
This Arduino program tests the serial communication with the scanner using a three-color LED system (Red, Green, and Yellow). 
The program listens for specific commands sent over the serial port and changes the LED color based on the received command. 
*/

const String READY_STATUS_COLOR = "RY";
const String CONNECTED_STATUS_COLOR = "GRY";
const String DISCONNECTING_STATUS_COLOR = "Y";
const String IN_OUT_STATUS_COLOR = "G";
const String IN_STATUS_COLOR = "GY";
const String OUT_STATUS_COLOR = "GR";
const String ERROR_STATUS_COLOR = "R";

const int LED_RED_PIN = 4;
const int LED_GREEN_PIN = 7;
const int LED_YELLOW_PIN = 8;

void setColor(const String& color)
{
  digitalWrite(LED_RED_PIN, color.indexOf('R') != -1 ? HIGH : LOW);
  digitalWrite(LED_GREEN_PIN, color.indexOf('G') != -1 ? HIGH : LOW);
  digitalWrite(LED_YELLOW_PIN, color.indexOf('Y') != -1 ? HIGH : LOW);
}

void handleCommand(const String& data, const String& command, const String& color)
{
  if (data == command)
  {
    setColor(color);
    Serial.println("OK");
  }
}

void setup()
{
  Serial.begin(115200);
  pinMode(LED_RED_PIN, OUTPUT);
  pinMode(LED_GREEN_PIN, OUTPUT);
  pinMode(LED_YELLOW_PIN, OUTPUT);

  setColor(READY_STATUS_COLOR);
  Serial.println("Ready");
}

void loop()
{
  if (Serial.available())
  {
    String data = Serial.readString();
    data.trim();

    handleCommand(data, "error", ERROR_STATUS_COLOR);
    handleCommand(data, "in", IN_STATUS_COLOR);
    handleCommand(data, "out", OUT_STATUS_COLOR);
    handleCommand(data, "inout", IN_OUT_STATUS_COLOR);
    handleCommand(data, "closing", DISCONNECTING_STATUS_COLOR);
    handleCommand(data, "connected", CONNECTED_STATUS_COLOR);

    if (data != "error" && data != "in" && data != "out" && data != "inout" && data != "ready" && data != "closing" && data != "connected")
    {
      Serial.println("ERROR");
    }
  }
}