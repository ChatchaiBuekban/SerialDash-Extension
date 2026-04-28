/*
 * Serial Dash — Dummy Data Generator
 *
 * Streams 6 simulated channels over serial as a comma-separated line:
 *
 *   <ch0>,<ch1>,<ch2>,<ch3>,<ch4>,<ch5>\r\n
 *
 * Channel layout (good for showcasing every widget type):
 *   ch0 — Temperature (sine, ~20–30 °C)        → Line / Gauge / Value
 *   ch1 — RPM (sawtooth + noise, 0–4000)       → Bar / Line
 *   ch2 — Battery (random walk, 3.3–4.2 V)     → Simple Gauge / Value
 *   ch3 — Pressure (square wave, 0/100)        → Level / Status
 *   ch4 — Humidity (slow sine + noise, 30–70%) → Gauge / Line
 *   ch5 — Switch (0 or 1)                      → Status LED
 *
 * Wire it up:
 *   1. Flash this sketch to any Arduino-compatible board.
 *   2. In VS Code, run "Serial Dash: Open Dashboard".
 *   3. Pick the board's serial port at 115200 baud and Connect.
 *
 * Tested on Arduino Uno / Nano / ESP32 / RP2040.
 */

const unsigned long BAUD          = 115200;
const unsigned long SAMPLE_PERIOD = 50;   // ms between samples (~20 Hz)

unsigned long lastSampleMs = 0;
float battery   = 3.7;   // walked
bool  pressure  = false;
bool  switchVal = false;
unsigned long lastSwitchToggleMs = 0;
unsigned long lastPressureToggleMs = 0;

void setup() {
  Serial.begin(BAUD);
  randomSeed(analogRead(A0));   // change pin if A0 is unused on your board
}

void loop() {
  const unsigned long now = millis();
  if (now - lastSampleMs < SAMPLE_PERIOD) return;
  lastSampleMs = now;

  const float t = now / 1000.0;

  // ch0: temperature — sine around 25 °C, ±5 °C, period 30 s
  const float temperature = 25.0 + 5.0 * sin(2.0 * PI * t / 30.0);

  // ch1: RPM — sawtooth 0..4000 over 8 s, with small noise
  const float rpm = (fmod(t, 8.0) / 8.0) * 4000.0
                  + (random(-50, 51));

  // ch2: battery — bounded random walk 3.3..4.2 V
  battery += (random(-10, 11)) * 0.001;
  if (battery < 3.30) battery = 3.30;
  if (battery > 4.20) battery = 4.20;

  // ch3: pressure — square wave, toggles every 3 s, scaled 0/100
  if (now - lastPressureToggleMs >= 3000) {
    pressure = !pressure;
    lastPressureToggleMs = now;
  }
  const float pressureVal = pressure ? 100.0 : 0.0;

  // ch4: humidity — slow sine 30..70% with noise
  const float humidity = 50.0 + 20.0 * sin(2.0 * PI * t / 45.0)
                       + (random(-10, 11)) * 0.1;

  // ch5: switch — flips every ~1.5 s
  if (now - lastSwitchToggleMs >= 1500) {
    switchVal = !switchVal;
    lastSwitchToggleMs = now;
  }

  // Send as CSV — Serial Dash splits on ',' by default
  Serial.print(temperature, 2);   Serial.print(',');
  Serial.print(rpm, 0);           Serial.print(',');
  Serial.print(battery, 3);       Serial.print(',');
  Serial.print(pressureVal, 1);   Serial.print(',');
  Serial.print(humidity, 1);      Serial.print(',');
  Serial.println(switchVal ? 1 : 0);
}
