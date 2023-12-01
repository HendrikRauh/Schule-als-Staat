#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2); 

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Ready");
  Serial.println("Ready");
}

void loop() {
  if (Serial.available()) {
    String data = Serial.readString();
    data.trim();
    if (data == "error") {
      lcd.clear();
      lcd.print("FEHLER");
      Serial.println("OK");
    } else if (data == "in") {
      lcd.clear();
      lcd.print("EINGECHECKT");
      Serial.println("OK");
    } else if (data == "out") {
      lcd.clear();
      lcd.print("AUSGECHECKT");
      Serial.println("OK");
    } else {
      Serial.println("ERROR - Unknown command");
    }
  }
}