function SoundGenerator(frequency, activeChannel, afterBeepCallback) {
    this.frequency = frequency;
    this.activeChannel = activeChannel; //0: Left? 1:Right?

    if (!(afterBeepCallback instanceof Function)) {
        console.error("afterBeepCallback is not a function!");
        afterBeepCallback = function () {
        };
    }
    this.afterBeepCallback = afterBeepCallback;

    this.gain = 0; //TODO

    //Setup audio infrastructure.
    this.audioContext = new AudioContext();

    this.gainNode = this.audioContext.createGain();
    this.gain_dummy = this.audioContext.createGain();
    this.merger = this.audioContext.createChannelMerger(2);
    this.merger.connect(this.audioContext.destination);

    this.gainNode.connect(this.merger, 0, this.activeChannel);
    this.gain_dummy.connect(this.merger, 0, this.activeChannel + 1); //+1 is not cleverst thing here!

    this.oscillator = null;
}

SoundGenerator.prototype = Object.create(SoundGenerator.prototype);
SoundGenerator.prototype.constructor = SoundGenerator;

SoundGenerator.prototype._beeping = function () {
    // Audiometer._handleBeep() wird aufgerufen
	this.afterBeepCallback();

    console.log("SoundGenerator: next beep with " + this.getFrequency() + "Hz and gain " + this.getGain());

    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.connect(this.gainNode);
	
	
	// LOOP ? How to end?
    this.oscillator.onended = (this._beeping).bind(this);

    this.oscillator.frequency.value = this.frequency;
    //this.gainNode.gain.value = this.getGain(); //TODO
	//console.log("Current Gain before:" + this.gainNode.gain.value);

	
	var startTime = this.audioContext.currentTime;				// according to DIN EN 60645-1 p. 27

	this.oscillator.start(startTime);		
	this.gainNode.gain.setValueAtTime(0, startTime);	
	this.gainNode.gain.linearRampToValueAtTime(this.gain, startTime + 0.05);			// ramp length 20 - 50ms (chose 40ms)
	this.gainNode.gain.setValueAtTime(this.gain, startTime + 0.05 + 0.2);				// beep length must be more than 150 ms (chose 200ms)
	this.gainNode.gain.linearRampToValueAtTime(0, startTime + 0.05 + 0.2 + 0.05);		// ramp length 20 - 50ms (chose 40ms)
    this.oscillator.stop(startTime + 0.05 + 0.2 + 0.05 + 0.2);   									//End in 
};

SoundGenerator.prototype.start = function () {
    this._beeping();
};
SoundGenerator.prototype.stop = function () {
    // LOOP ? How to end? Just one time!
	console.log("Beep");
	this.audioContext.close();
	if (this.oscillator !== null){
        this.oscillator.onended = null;
	}
};
SoundGenerator.prototype.getFrequency = function () {
    return this.frequency;
};
SoundGenerator.prototype.setFrequency = function (frequency) {
    this.frequency = frequency;
};
SoundGenerator.prototype.getGain = function () {
    return this.gain;
};
SoundGenerator.prototype.setGain = function (gain) {
    this.gain = gain;
};


function Audiometer(calibration, frequency, activeChannel, finishedCallback) {
    this.calibration = calibration;
    this.frequency = frequency;
    this.activeChannel = activeChannel;

    this.soundGenerator = new SoundGenerator(frequency, activeChannel, (this._handleBeep).bind(this));

    this.startTime = undefined;

    this.loudness = 20; //Configurable?

    if (!(finishedCallback instanceof Function)) {
        console.error("finishedCallback is not a function!");
        finishedCallback = function () {
        };
    }
    this.finishedCallback = finishedCallback;


    this.buttonPressed = false;
    this.userFeedback = [];

    this.node = null;
}
Audiometer.prototype = Object.create(Audiometer.prototype);
Audiometer.prototype.constructor = Audiometer;
Audiometer.prototype.createUI = function () {
    this.node = document.createElement("div");
    return this.node;
};
Audiometer.prototype.releaseUI = function () {
    this.node = null;
    this._stop();
};

Audiometer.prototype.start = function () {
    this.buttonPressed = false;
    this.startTime = Date.now();

    this.soundGenerator.setGain(this.calibration.getFrequencyGain(this.frequency, this.activeChannel, this.loudness));
    this.soundGenerator.start();
};
Audiometer.prototype._stop = function () {
    this.soundGenerator.stop();
	
	//"ready function Callback" in HTML script tag
    this.finishedCallback();
};
Audiometer.prototype.increaseLoudness = function () {
    this.buttonPressed = false;
};
Audiometer.prototype.decreaseLoudness = function () {
    this.buttonPressed = true;
};
Audiometer.prototype.getData = function () {
    return this.userFeedback;
};
Audiometer.prototype._handleBeep = function () {
    this.userFeedback.push(this.loudness);

    if (Date.now() - this.startTime > 30 * 1000) {
        
		// Programm nach 30 sec ändern
		
		//Erst ganz am ende aufrufen
		this._stop();

        return;
    }
    this.node.innerHTML = this.soundGenerator.getGain() + " --- " + (Date.now() - this.startTime) / 1000 + " sec";

    var loudnessNext = null;
    if (this.buttonPressed) {
        loudnessNext = this.calibration.getLoudnessPrev(this.frequency, this.activeChannel, this.loudness);
    } else {
        loudnessNext = this.calibration.getLoudnessNext(this.frequency, this.activeChannel, this.loudness);
    }
    if (loudnessNext !== null) this.loudness = loudnessNext;
    this.soundGenerator.setGain(this.calibration.getFrequencyGain(this.frequency, this.activeChannel, this.loudness));
	
	
};

/**
 * Provides access to calibration data.
 *
 * Uses an array (one-dimensional) that stores two-dimensional array:
 * column 1: frequency
 * column 2: active channel: 0 left; 1 right
 * column 3: loudness
 * column 4: to be used frequency
 * column 5: gain
 *
 * @param {type} data 
 *
 * @returns {Calibration}
 */
function Calibration(data) {
    this.data = data;
}
Calibration.prototype = Object.create(Calibration);
Calibration.prototype.constructor = Calibration;
Calibration.prototype.verify = function () {
    //TODO Check data structure
};
Calibration.prototype.getFrequencyGain = function (frequency, channel, loudness) {
    var indexBestFit = null;
    for (var i = 0; i < this.data.length; i = i + 5) {
        if (this.data[i] === frequency && this.data[i + 1] === channel) {
            if (this.data[i + 2] === loudness) {
                return this.data[i + 4];
            }

            if (indexBestFit === null && loudness - this.data[i + 2] > 0) indexBestFit = i;
            else if (loudness - this.data[i + 2] > 0 && this.data[i + 2] < this.data[indexBestFit + 2]) {
                indexBestFit = i;
            }
        }
    }
    if (indexBestFit !== null) {
        console.warn("Exact loudness is not availabl: closest minimal");
        return [this.data[indexBestFit + 3], this.data[indexBestFit + 4]];
    }
    //TODO: Report error!
};
Calibration.prototype.getLoudnessPrev = function (frequency, channel, loudness) {
    var indexBestFit = null;
    var indexExtreme = null;

    for (var i = 0; i < this.data.length; i = i + 5) {

        if (this.data[i] === frequency && this.data[i + 1] === channel) {

            if (indexBestFit === null && loudness - this.data[i + 2] > 0) indexBestFit = i;
            if (loudness - this.data[i + 2] > 0 && this.data[i + 2] > this.data[indexBestFit + 2]) {
                indexBestFit = i;
            }

            if (indexExtreme === null) indexExtreme = i;
            if (this.data[indexExtreme + 2] > this.data[i + 2]) indexExtreme = i;
        }
    }
    if (indexBestFit !== null) {
        return this.data[indexBestFit + 2];
    }
    return this.data[indexExtreme + 2];
};
Calibration.prototype.getLoudnessNext = function (frequency, channel, loudness) {
    var indexBestFit = null;
    var indexExtreme = null;
    for (var i = 0; i < this.data.length; i = i + 5) {

        if (this.data[i] === frequency && this.data[i + 1] === channel) {

            if (indexBestFit === null && loudness - this.data[i + 2] < 0) indexBestFit = i;
            if (loudness - this.data[i + 2] < 0 && this.data[i + 2] < this.data[indexBestFit + 2]) {
                indexBestFit = i;
            }

            if (indexExtreme === null) indexExtreme = i;
            if (this.data[indexExtreme + 2] < this.data[i + 2]) indexExtreme = i;
        }
    }
    if (indexBestFit !== null) {
        return this.data[indexBestFit + 2];
    }
    return this.data[indexExtreme + 2];
};


function Calibrator(frequency, activeChannel, gain) {
    this.frequency = frequency; //Expecting array
    this.frequencyIndex = 0;
    this.gain = gain; //Expecting ordered array!
    this.gainIndex = 0;

    this.soundGenerator = new SoundGenerator(this.frequency[this.frequencyIndex], activeChannel, (this._handleBeep).bind(this));

    this.buttonPressed = false;

    this.node = null;
}
Calibrator.prototype = Object.create(Calibrator.prototype);
Calibrator.prototype.constructor = Calibrator;
Calibrator.prototype.createUI = function () {
    this.node = document.createElement("div");
    return this.node;
};
Calibrator.prototype.releaseUI = function () {
    this.node = null;
    this._stop();
};
Calibrator.prototype.start = function () {
    this.buttonPressed = false;

    this.soundGenerator.setGain(this.gain[this.gainIndex]);
    this.soundGenerator.start();
};
Calibrator.prototype._stop = function () {
    this.soundGenerator.stop();
};
Calibrator.prototype.increaseFrequency = function () {
    if (this.frequencyIndex + 1 < this.frequency.length) {
        this.frequencyIndex++;
        return;
    }
    console.warn("Reached maximum freq!");
};
Calibrator.prototype.decreaseFrequency = function () {
    if (this.frequencyIndex > 0) {
        this.frequencyIndex--;
        return;
    }
    console.warn("Reached minimum freq!");
};
Calibrator.prototype.increaseGain = function (steps) {
    if (this.gainIndex + steps + 1 < this.gain.length) {
        this.gainIndex += steps;
        return;
    }
    console.warn("Reached maximum gain!");
};
Calibrator.prototype.decreaseGain = function (steps) {
    if (this.gainIndex - steps > 0) {
        this.gainIndex -= steps;
        return;
    }
    console.warn("Reached minimum gain!");
};
Calibrator.prototype._handleBeep = function () {
    this.soundGenerator.setGain(this.gain[this.gainIndex]);
    this.soundGenerator.setFrequency(this.frequency[this.frequencyIndex]);

    this.node.innerHTML = "The next beep will be: " + this.soundGenerator.getFrequency() + " Hz " + this.soundGenerator.getGain() + " Gain";
};