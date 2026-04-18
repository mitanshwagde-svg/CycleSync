% Washing Machine Cycle Time using a Mamdani Fuzzy Inference System
% Inputs:
%   1. DirtLevel (0 to 10)
%   2. LoadSize  (0 to 10)
% Output:
%   1. WashTime  (0 to 60 minutes)

% Load fuzzy logic toolkit for Octave/JDoodle
pkg load fuzzy-logic-toolkit

clc;
clear;
close all;

% Create Mamdani FIS
fis = newfis('WashingMachineCycle');

% Input 1: Dirt Level
fis = addvar(fis, 'input', 'DirtLevel', [0 10]);
fis = addmf(fis, 'input', 1, 'Low', 'trimf', [0 0 4]);
fis = addmf(fis, 'input', 1, 'Medium', 'trimf', [2 5 8]);
fis = addmf(fis, 'input', 1, 'High', 'trimf', [6 10 10]);

% Input 2: Load Size
fis = addvar(fis, 'input', 'LoadSize', [0 10]);
fis = addmf(fis, 'input', 2, 'Small', 'trimf', [0 0 4]);
fis = addmf(fis, 'input', 2, 'Medium', 'trimf', [2 5 8]);
fis = addmf(fis, 'input', 2, 'Large', 'trimf', [6 10 10]);

% Output: Wash Time
fis = addvar(fis, 'output', 'WashTime', [0 60]);
fis = addmf(fis, 'output', 1, 'Short', 'trimf', [0 0 20]);
fis = addmf(fis, 'output', 1, 'Medium', 'trimf', [15 30 45]);
fis = addmf(fis, 'output', 1, 'Long', 'trimf', [40 60 60]);

% Rule list format:
% [DirtLevel LoadSize WashTime Weight AND_or_OR]
rules = [
    1 1 1 1 1
    1 2 1 1 1
    1 3 2 1 1
    2 1 2 1 1
    2 2 2 1 1
    2 3 3 1 1
    3 1 3 1 1
    3 2 3 1 1
    3 3 3 1 1
];

fis = addrule(fis, rules);

% Display the FIS structure
disp('Washing Machine Fuzzy Inference System Created Successfully.');
disp(fis);

% Example case study
exampleInput = [8 9]; % [DirtLevel LoadSize]
exampleOutput = evalfis(exampleInput, fis);

fprintf('\nExample Case Study:\n');
fprintf('Dirt Level = %.1f\n', exampleInput(1));
fprintf('Load Size  = %.1f\n', exampleInput(2));
fprintf('Predicted Wash Time = %.2f minutes\n', exampleOutput);

% --- Graphics functions commented out for JDoodle compatibility ---
% Plot overall FIS structure
% figure('Name', 'FIS Structure');
% plotfis(fis);
% title('Washing Machine Mamdani FIS');

% Plot membership functions for input 1
% figure('Name', 'Dirt Level Membership Functions');
% plotmf(fis, 'input', 1);
% title('Membership Functions for Dirt Level');

% Plot membership functions for input 2
% figure('Name', 'Load Size Membership Functions');
% plotmf(fis, 'input', 2);
% title('Membership Functions for Load Size');

% Plot membership functions for output
% figure('Name', 'Wash Time Membership Functions');
% plotmf(fis, 'output', 1);
% title('Membership Functions for Wash Time');

% Open rule viewer
% ruleview(fis);

% Generate and plot surface view
% figure('Name', 'Surface Viewer');
% gensurf(fis);
% title('Surface View of Wash Time');
