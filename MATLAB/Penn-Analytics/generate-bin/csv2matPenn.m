% imports Penn building csv file and coverts into matlab file that
% includes column headers
%creates building structure 

function [matlabfile] = csv2matPenn(csvdata,x)

%reads csv file into array csv data
data = csvread(csvdata);  

%defines colname and name variables
colnames = {'year','month','dom','tod','tempC','tempF','dew','hum','sol','wspeed','gusts','wdir','hdd','cdd','occ','area','value'};
name = x;

% Creates fields for structure array
building.(name).colnames = {'year','month','dom','tod','tempC','tempF','dew','hum','sol','wspeed','gusts','wdir','hdd','cdd','occ','area','value'}; 
building.(name).catcol = {'year','month','dom','tod'};
building.(name).year = data (1:end,1);
building.(name).month = data(1:end,2);
building.(name).dom = data(1:end,3);
building.(name).tod = data(1:end,4);
building.(name).tempC = data(1:end,5);
building.(name).tempF = data (1:end,6);
building.(name).dew = data(1:end,7);
building.(name).hum = data(1:end,8);
building.(name).sol = data(1:end,9);
building.(name).wspeed = data(1:end,10);
building.(name).gusts = data(1:end,11);
building.(name).wdir = data(1:end,12);
building.(name).hdd = data(1:end,13);
building.(name).cdd = data(1:end,14);
building.(name).occ = data(1:end,15);
building.(name).area = data (1:end,16);
building.(name).value = data (1:end,17);

%indexes data array to get start and end dates
startyear = data (1,1);
startmonth = data (1,2);
startday = data (1,3);
endyear = data (end,1);
endmonth = data (end,2);
endday = data (end,3);

% fields for start and end dates 
formatSpec = 'month:%d day:%d  year:%d';
building.startdate = sprintf(formatSpec, startmonth, startday, startyear);
building.enddate = sprintf(formatSpec, endmonth, endday, endyear);

 % adds columns names into csv data 
A = num2cell(data);
matlabfile = [colnames;A];

%Saves Filename in current directory 
Filename = (name);
save (Filename)


