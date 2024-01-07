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
   neoMatrix.drawLine(1, 6, 14, 6, color);
   neoMatrix.drawLine(0, 7, 15, 7, color);
   neoMatrix.drawLine(0, 8, 15, 8, color);
   neoMatrix.drawLine(1, 9, 14, 9, color);

   neoMatrix.drawLine(10, 2, 15, 7, color);
   neoMatrix.drawLine(10, 3, 15, 8, color);
   neoMatrix.drawLine(10, 4, 14, 8, color);
   neoMatrix.drawLine(10, 5, 14, 9, color);

   neoMatrix.drawLine(1, 8, 5, 4, color);
   neoMatrix.drawLine(0, 8, 5, 3, color);
   neoMatrix.drawLine(0, 7, 5, 2, color);
   neoMatrix.drawLine(1, 9, 5, 5, color);

   neoMatrix.drawLine(1, 8, 5, 11, color);
   neoMatrix.drawLine(0, 8, 5, 12, color);
   neoMatrix.drawLine(0, 7, 5, 13, color);
   neoMatrix.drawLine(1, 9, 5, 10, color);

   neoMatrix.drawLine(10, 13, 15, 7, color);
   neoMatrix.drawLine(10, 12, 15, 8, color);
   neoMatrix.drawLine(10, 11, 14, 8, color);
   neoMatrix.drawLine(10, 10, 14, 9, color);
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