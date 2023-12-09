// This is a simple test program for the PIR

#define PIR_PIN 6
#define LED_PIN 13

void setup()
{
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
}

void loop()
{
  digitalWrite(LED_PIN, digitalRead(PIR_PIN));
}