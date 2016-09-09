clear all
close all
clc

%% Parameter definition

fs = 44.1e3;
nbits = 16;
nchannels = 1;

r = audiorecorder(fs, nbits, nchannels);

cal.ntimes = 1;
cal.rectime = 5; %sec

meas.ntimes = 1;
meas.rectime = 5;

N = 5; %bandpass filter order
cal.fm = 250;

%% Input Microphone Calibration

cal_rec = zeros(cal.ntimes,cal.rectime*fs);
rms_cal = zeros(1,cal.ntimes);

for i=1:cal.ntimes
    fprintf('\n Calibration-Recording %1.0f of %1.0f: Put the calibrator into the left ear and press enter', i,cal.ntimes);
    pause;
    fprintf('\n recording...');
    recordblocking(r,cal.rectime);
    cal_rec(i,:) = getaudiodata(r);
    cal_rec(i,:) = Oktavfilter(cal_rec(i,:),cal.fm,fs,N);
    rms_cal(i) = sqrt(mean(cal_rec(i,:).^2));               % calculate RMS
    fprintf('\n recording done \n');
end

ref_val = 20*log10(mean(rms_cal)) - 114;                          % must be equivalent to 114 db(SPL)

%% Measurement 

prompt = '\n  How many different frequencies would you like to measure) \n';
meas.ftimes = input(prompt);

rms_audiometer = zeros(2,meas.ftimes);

for j=1:meas.ftimes
    meas_rec = zeros(meas.ntimes,meas.rectime*fs);
    rms_meas = zeros(1,meas.ntimes);
    
    prompt = '\n Which octave-band do you want to measure? (middle frequency, [Hz]) \n';
    meas.fm = input(prompt);
    
    rms_audiometer(1,j) = meas.fm;

    for i=1:meas.ntimes
        fprintf('\n Audiometer-Recording %1.0f of %1.0f: Put the Headphones on the artificial Head and press enter', i,meas.ntimes);
        pause;
        fprintf('\n recording...');
        recordblocking(r,meas.rectime);
        meas_rec(i,:) = getaudiodata(r);
        meas_rec(i,:) = Oktavfilter(meas_rec(i,:),meas.fm,fs,N);
        rms_meas(i) = sqrt(mean(meas_rec(i,:).^2));               % calculate RMS
        fprintf('\n recording done');
    end

    rms_audiometer(2,j) = 20*log10(mean(rms_meas)) - ref_val; 
end