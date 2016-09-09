function [out_signal] = Oktavfilter(signal,fm,fs,N)
fn = fs/2;

% octave band filter
fu = fm/sqrt(2);
fo = 2*fu;
Wn_u = (fu/fn);
Wn_o = (fo/fn);
[b_u,a_u] = butter(N, Wn_u, 'high');
[b_o,a_o] = butter(N, Wn_o, 'low');
out_signal = filter(b_u,a_u,signal);
out_signal = filter(b_o,a_o,out_signal);
end

