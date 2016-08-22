TheAudiometer
=

A software audiometer [fixed frequencies](http://en.wikipedia.org/wiki/Pure_tone_audiometry) (up to 20kHz) for [absolute hearing threshold](http://en.wikipedia.org/wiki/Absolute_threshold_of_hearing) estimation.
For reduction of software maintenance and setup implemented is done using HTML5/JavaScript.
The program can be used standalone as it is executed in a modern (HTML5) webbrowser.

Basic functionality (for each frequency, each ear individually):

1. Set initial loudness to lowest possible loudness (tbd)
2. Play sinus tone, e.g. beep with defined length (constant: tbd), followed by silence of defined length (constant: tbd)
3. If user presses the button, decrease loudness (range tbd)
4. If user does not press the button, then increase loudness (range tbd)
5. Store time, frequency and loudness level
6. If 30s are reached: end else Continue with _step 2._

Features
==
* Frequencies: 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 12kHz, 16kHz, 20kHZ
* Fixed frequency audiometry for narrowband (up to 8kHz), wideband (up to 12kHz) and full (up to 20kHz)
* Data export as CSV
* Plot results (optional)

Plan
==
1. Feasibility (part 1): tone generation using HTML5 possible?
2. Feasibility (part 2). tone generation precise enough (frequency and loudness) with a [dummy head recording](http://en.wikipedia.org/wiki/Dummy_head_recording)?
3. Implementation of audiometry procedure (without UI)
4. Concept for calibration procedure and calibration with dummy head (frequency and loudness)
5. Implementation for data aggregation and export
6. Implementation of UI to plot results
7. Setup and calibration of reference setup

Reference Setup
==
The reference implementation will use a [Sennheiser HDA 300](http://de-de.sennheiser.com/audiometer-kopfhoerer-high-frequency-testing-geschlossener-dynamischer-hda-300), which will be either connected to an internal soundcard or if not sufficient a [Edirol UA-25](http://www.rolandus.com/products/ua-25/) will be used.
For the implementation the webbrowser Chrome/Chromium should be used until all features are implemented and then check for compatbility with other browsers.
"# TheAudiometer-master" 
