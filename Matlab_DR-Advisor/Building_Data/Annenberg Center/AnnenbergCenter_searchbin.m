function exitcode = annenbergCenter_searchbin(bin_number)
%{
The function search bin takes an input argument as a bin number from 1-5
corresponding to diffferent ranges of power consumption (kW) for College
Hall and returns the average conditions for those ranges. 
The Bin numbers correspond to the following power consumption ranges:
    Bin 1 : < 37 kW
    Bin 2 : 37-55 kW
    Bin 3 : 55-74 kW
    Bin 4 : 74-92 kW
    Bin 5 : 92-111 kW

    Sample query: Under what conditions does College Hall consume more than
    90 kW ?
    Response -> searchbin(5)

    Function output structure: 
    response.names = cell array of variable names.
    response.values = array of avg/top variable values.
%}

% define an empty response structure.
response=[];

% check is the input argument is valid
validarg = [1,2,3,4,5];
bin_number = str2num(bin_number);
isvalid = ismember(bin_number,validarg);

if(~isvalid)
    disp('Invalid argument!!: Arg must be either 1,2,3,4 or 5');
    exitcode = 1;
else

% load the Bin data structure into the Matlab workspace.
load Bin-AnnenbergCenter.mat;

% define the names of the output variables or features which will be
% returned.

response.names = {'DayOfMonth','TimeOfDay','AvgTemperature','AvgSolar', ...
    'AvgWindSpeed','AvgGusts','AvgHumidity','AvgDewPoint'};
response.values = [Bin(bin_number).dom_mode(1),Bin(bin_number).tod_mode(1),...
    Bin(bin_number).avg_tempC,Bin(bin_number).avg_sol,...
    Bin(bin_number).avg_winspeed, Bin(bin_number).avg_gusts,...
    Bin(bin_number).avg_hum,Bin(bin_number).avg_dew];
disp(response);
exitcode = 0;
end
end

