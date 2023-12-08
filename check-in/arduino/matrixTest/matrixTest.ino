// This is a test file for the 16x16 RGB LED Matrix

#include <Adafruit_GFX.h>
#include <Adafruit_NeoMatrix.h>
#include <Adafruit_NeoPixel.h>

#define PIN 7 // Change this to the pin you've connected the matrix to
Adafruit_NeoMatrix matrix = Adafruit_NeoMatrix(16, 16, PIN, NEO_MATRIX_TOP + NEO_MATRIX_LEFT + NEO_MATRIX_COLUMNS + NEO_MATRIX_ZIGZAG, NEO_GRB + NEO_KHZ800);

const uint16_t colors[] = {
    matrix.Color(255, 0, 0), matrix.Color(0, 255, 0), matrix.Color(0, 0, 255)};

void setup()
{
  matrix.begin();
  matrix.setTextWrap(false);
  matrix.setBrightness(1); // help i get blind by this thing :D
}

void loop()
{

  // Draw a red cross
  matrix.fillScreen(0);
  matrix.drawLine(0, 0, matrix.width() - 1, matrix.height() - 1, matrix.Color(255, 0, 0));
  matrix.drawLine(matrix.width() - 1, 0, 0, matrix.height() - 1, matrix.Color(255, 0, 0));
  matrix.show();
  delay(2000);

  // Draw a green border
  matrix.fillScreen(0);
  matrix.drawRect(1, 1, matrix.width() - 2, matrix.height() - 2, matrix.Color(0, 255, 0));
  matrix.show();
  delay(2000);

  // White flash
  for (int i = 0; i < 2; i++)
  {
    matrix.fillScreen(matrix.Color(255, 255, 255));
    matrix.show();
    delay(500);
    matrix.fillScreen(matrix.Color(0, 0, 0));
    matrix.show();
    delay(100);
  }
}
