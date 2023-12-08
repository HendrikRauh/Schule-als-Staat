// This is a simple test program to test the relay module

#define RELAY_PIN 8

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
}

void loop() {
  digitalWrite(RELAY_PIN, HIGH); // Turn the relay on (HIGH is the voltage level)
  delay(2000);                   // Wait for two seconds
  digitalWrite(RELAY_PIN, LOW);  // Turn the relay off by making the voltage LOW
  delay(2000);                   // Wait for two seconds
}