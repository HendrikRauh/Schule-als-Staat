#include <Adafruit_GFX.h>
#include <Adafruit_NeoMatrix.h>
#include <Adafruit_NeoPixel.h>

#define PIN 7 // Change this to the pin you've connected the matrix to
Adafruit_NeoMatrix matrix = Adafruit_NeoMatrix(16, 16, PIN, NEO_MATRIX_TOP + NEO_MATRIX_LEFT + NEO_MATRIX_COLUMNS + NEO_MATRIX_ZIGZAG, NEO_GRB + NEO_KHZ800);

const uint16_t colors[] = {
    matrix.Color(255, 0, 0), matrix.Color(0, 255, 0), matrix.Color(0, 0, 255)};

void setup() {
  // put your setup code here, to run once:
  matrix.begin();
  matrix.setTextWrap(false);
  matrix.setBrightness(1);
}

void loop() {
  // put your main code here, to run repeatedly:
  matrix.drawLine(0, 8, matrix.width() - 1, matrix.height() - 8, matrix.Color(255, 255, 255)); //grundstrich weiß
  matrix.drawLine(0, 7, matrix.width() - 1, matrix.height() - 9, matrix.Color(255, 255, 255));
  matrix.drawLine(0, 6, matrix.width() - 2, matrix.height() - 10, matrix.Color(255, 255, 255)); //grundstriche außen
  matrix.drawLine(0, 9, matrix.width() - 2, matrix.height() - 7, matrix.Color(255, 255, 255));

  matrix.drawLine(matrix.width() - 1, 8, 8, matrix.height() - 1, matrix.Color(255, 255, 255)); //pfeilstrich links, wenn pfeil zu mir zeigt
  matrix.drawLine(matrix.width() - 1, 7, 7, matrix.height() - 1, matrix.Color(255, 255, 255));
  matrix.drawLine(matrix.width() - 2, 7, 6, matrix.height() - 1, matrix.Color(255, 255, 255)); //pfeilstriche außen
  matrix.drawLine(matrix.width() - 2, 6, 5, matrix.height() - 1, matrix.Color(255, 255, 255));

  matrix.drawLine(7, 0, matrix.width() - 1, matrix.height() - 8, matrix.Color(255, 255, 255)); //pfeilstrich rechts, wenn pfeil zu mir zeigt
  matrix.drawLine(8, 0, matrix.width() - 1, matrix.height() - 9, matrix.Color(255, 255, 255));
  matrix.drawLine(6, 0, matrix.width() - 2, matrix.height() - 8, matrix.Color(255, 255, 255));
  matrix.drawLine(5, 0, matrix.width() - 2, matrix.height() - 7, matrix.Color(255, 255, 255));

  matrix.show();
  delay(2000);

}
