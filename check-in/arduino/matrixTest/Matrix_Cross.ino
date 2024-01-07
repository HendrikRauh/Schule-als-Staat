#include <Adafruit_GFX.h>
#include <Adafruit_NeoMatrix.h>
#include <Adafruit_NeoPixel.h>

const int NEO_MATRIX_PIN = 7;

Adafruit_NeoMatrix neoMatrix = Adafruit_NeoMatrix(16, 16, NEO_MATRIX_PIN, NEO_MATRIX_TOP + NEO_MATRIX_LEFT + NEO_MATRIX_COLUMNS + NEO_MATRIX_ZIGZAG, NEO_GRB + NEO_KHZ800);

const uint16_t WHITE = neoMatrix.Color(255, 255, 255);
const uint16_t RED = neoMatrix.Color(255, 0, 0);
const uint16_t GREEN = neoMatrix.Color(0, 255, 0);
const uint16_t BLUE = neoMatrix.Color(0, 0, 255);
const uint16_t BLACK = neoMatrix.Color(0, 0, 0);

void initializeNeoMatrix()
{
   neoMatrix.begin();
   neoMatrix.setTextWrap(false);
   neoMatrix.setBrightness(1);
}

void drawArrowOnMatrix(uint16_t color, char direction)
{
   neoMatrix.fillScreen(BLACK);

   rotateMatrixToMatchDirection(direction);
   drawArrowPointingUp(color);
   updateNeoMatrixDisplay();
   neoMatrix.setRotation(0);
}

void rotateMatrixToMatchDirection(char direction)
{
   switch (direction)
   {
   case 'u':
       neoMatrix.setRotation(0);
       break;
   case 'r':
       neoMatrix.setRotation(1);
       break;
   case 'd':
       neoMatrix.setRotation(2);
       break;
   case 'l':
       neoMatrix.setRotation(3);
       break;
   default:
       break;
   }
}

void drawArrowPointingUp(uint16_t color)
{
  neoMatrix.drawLine(0, 0, 15, 15, color);
  neoMatrix.drawLine(1, 0, 15, 14, color);
  neoMatrix.drawLine(2, 0, 15, 13, color);
  neoMatrix.drawLine(0, 1, 14, 15, color);
  neoMatrix.drawLine(0, 2, 13, 15, color);
  neoMatrix.drawLine(0, 3, 12, 15, color);
  neoMatrix.drawLine(3, 0, 15, 12, color);

  neoMatrix.drawLine(0, 15, 15, 0, color);
  neoMatrix.drawLine(0, 14, 14, 0, color);
  neoMatrix.drawLine(0, 13, 13, 0, color);
  neoMatrix.drawLine(1, 15, 15, 1, color);
  neoMatrix.drawLine(2, 15, 15, 2, color);
  neoMatrix.drawLine(0, 12, 12, 0, color);
  neoMatrix.drawLine(3, 15, 15, 3, color);
}

void updateNeoMatrixDisplay()
{
   neoMatrix.show();
}

void setup()
{
   initializeNeoMatrix();
}

void loop()
{
   drawArrowOnMatrix(WHITE, 'u');
   delay(1000);
   drawArrowOnMatrix(RED, 'r');
   delay(1000);
   drawArrowOnMatrix(GREEN, 'd');
   delay(1000);
   drawArrowOnMatrix(BLUE, 'l');
   delay(1000);
}