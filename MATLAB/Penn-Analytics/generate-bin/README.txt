README

Instructions to generate Bin.mat files for different Penn buildings.

(1) The matlab script college_hall_analytics.m geenrates the Bin.mat file. However, it can be used to geenrate the file for any building and not just college hall.
(2) The CSV files for the different buildings should be present in the same directory as the college_hall_analytics.m function.
(3) On Line 9 of the college_hall_analytics.m file you need to specify the name of the building and the corresponding CSV data file for that building: 
For example, for the DRL building , you would edit that line to the follwoing:
Data = csv2matPenn('New_15_DRL_2.csv','DRL');
(4) When the run the code, the Bin structure will be generated and stored in the matlab workspace. You can see that this structure is generated on the Line 110 in college_hall_analytics.m
(5) You can save the variable from the workspace so that it is stored as Bin-DRL.mat file. If you do not save the variable Bin into a mat file then it will be lost when you clear the workspace in Matlab, or if you exit Matlab.

(6) *** VERY IMPORTANT ***
The function searchbin.m, which returns the answer to the query, is hardcoded to load a file name Bin.mat from the same directory as the function (Line 35). So if you have a file named Bin-DRL.mat in the directory instead of Bin.mat, then the function will either return an error that it did not find Bin.mat, or return the output for the Bin.mat file which is present in the directory, which might have been another building's file. 
So make sure you either have the correct Bin.mat file in the diretory or you modify the function searchbin.m to accept different file names. 