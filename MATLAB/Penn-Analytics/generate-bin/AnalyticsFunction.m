 function[Bin,ST,Interval] = AnalyticsFunction(Tree, number_bins)

leaf_index = find((Tree.Children(:,1)==0)&(Tree.Children(:,2)==0)); % index of node that is a leaf
numleafs = length(leaf_index); % number of leaf nodes 
fprintf('The tree has %d leaf nodes \n',numleafs);

% returns node, which is the index of of training samples in each leaf
[Yfit,node] = resubPredict(Tree); 
Y_mean = zeros(1,numleafs);

% Training Data that the tree uses
%Different than Ytrain because does not use all data points to train model
TreeY = Tree.Y;
TreeX = Tree.X;

for i=1:numleafs
    
    % find indices of data points that end up in this leaf
    ST(i).leaves = {find(node==leaf_index(i))};
    
    % prediction at the leaf
    ST(i).mean = Tree.NodeMean(leaf_index(i));
    Y_mean(i) = ST(i).mean;
    % find the training samples which contribute to this leaf (support)
    
    ST(i).xdata = {TreeX(ST(i).leaves{1,1},:)};
    ST(i).xlength = length(cell2mat(ST(i).xdata));
    
    % find the training labels which contribute to this leaf
    ST(i).ydata = {TreeY(ST(i).leaves{1,1})};
    ST(i).ylength = length(cell2mat(ST(i).ydata));
    
    % finds the confidence interval for data points in each leaf
    ydata_array = cell2mat(ST(i).ydata);
    ts = ([-2 2]);
    ST(i).CI = mean(ydata_array)+ ts;

end
%Creates a Scatterplot with Y mean value at each leave on the X axis and
% the leaf index on the Y axis
figure(1)
Xaxis = linspace (1,numleafs,numleafs);
Scatterplot = scatter(Y_mean,Xaxis,10);
xlabel 'Y mean for each leaf';
ylabel 'leaf index';

% Gets the range of the Y_means 
Ymax = max(Y_mean);
Ymin= min(Y_mean) ;

% Divides the Y_axis by number_bins to create the number of bins that
% the user specifies
for r = 2:(number_bins);
    Interval = (Ymax - Ymin) ./ number_bins;  %width of each bin   
    
    %edges of each bin
    Ymin_interval.bin(1) = Ymin;
    Ymax_interval.bin(1) = Ymin_interval.bin(1) + Interval;
    Ymin_interval.bin(r) = Ymax_interval.bin(r-1);
    Ymax_interval.bin(r) = Ymin_interval.bin(r) + Interval ;
                                                                                                                                                                                                                        


end

%at each iteration, creates box plots and calculates average values for data points within each bin 
for h = 1:(number_bins); 
   
    
        %creates vector with zeros as long as the number of leafs 
        % Will add leafs that lie within specified Bin range
        % then remove extra zeros
        Data_index = zeros(1,numleafs);

        %Find the index of the leaf which are within specified Bin width and adds
        %them to Data_index
        for ii=1:numleafs
            if (ST(ii).mean >= Ymin_interval.bin(h)) && (ST(ii).mean <= Ymax_interval.bin(h)); 
            Data_index(ii) = ii;  % vector with leafs that lie within 
            end
        end    
        %Removes zeros from Data_index, leaving only list with indeces of leafs
        %within range 
        Data_index = Data_index(Data_index ~= 0);

        % scalar that will count the total number of data points in all the leafs
        % that lie within the specified bin range 
        Total_Points = 0;

        % loops through the vector with leafs
        for j= 1:length(Data_index);    
            leaf_number = Data_index(j); % leaf_number in the node number of the leaf 
            RelData_Points = cell2mat(ST(leaf_number).leaves);% array with Y data points in each leaf



            for jj = 1:length(RelData_Points);  %for loop that will iterate through each data point and take each feature 
                Xtree_index = RelData_Points(jj);% index of X data point
                Train_row = TreeX(Xtree_index,:); % row taken from original Xtrain data with feature information

                % parses Xtrain data and creates data structure with feature
                % information for each data point in each leaf
                Q.Leaf(j).Point(jj).dom = Train_row(1,1);
                Q.Leaf(j).Point(jj).tod = Train_row(1,2);
                Q.Leaf(j).Point(jj).tempC = Train_row(1,3);
                Q.Leaf(j).Point(jj).sol = Train_row(1,4);
                Q.Leaf(j).Point(jj).occ = Train_row(1,5);
                Q.Leaf(j).Point(jj).mon = Train_row(1,6); 
                Q.Leaf(j).Point(jj).winspeed = Train_row(1,7);
                Q.Leaf(j).Point(jj).windir = Train_row(1,8);
                Q.Leaf(j).Point(jj).gusts = Train_row(1,9);
                Q.Leaf(j).Point(jj).hum = Train_row(1,10);
                Q.Leaf(j).Point(jj).dew = Train_row(1,11);
                Q.Leaf(j).Point(jj).hdd = Train_row(1,12);
                Q.Leaf(j).Point(jj).cdd = Train_row(1,13);

                Total_Points =  Total_Points + 1; % Counts that total number of data points that the loop iterates through
            end   
        end
% Creates empty cells that will be filled with values of each feature
            Totalcell_dom = {};
            Totalcell_tod = {};
            TotalSum_tempC = 0;
            Totalcell_tempC = {};
            TotalSum_sol = 0;
            Totalcell_sol = {};
            Totalcell_occ={};
            Totalcell_mon = {};
            TotalSum_winspeed = 0;
            Totalcell_winspeed ={};
            TotalSum_windir = 0;
            Totalcell_windir = {};
            TotalSum_gusts = 0;
            Totalcell_gusts = {};
            TotalSum_hum = 0;
            Totalcell_hum={};
            TotalSum_dew = 0;
            Totalcell_dew={};
            TotalSum_hdd = 0;
            Totalcell_hdd={};
            TotalSum_cdd = 0;
            Totalcell_cdd = {};


        %iterates through leaves and sums values for each feature
        % It is the total sum of values for each feature in data points that lie within the
        % specified bin range 
        % Also adds all the values for each feature into a cell
        for f= 1:length(Data_index);

            Totalcell_dom = [Totalcell_dom,{Q.Leaf(f).Point(:).dom} ];
            Totalcell_tod = [Totalcell_tod,{Q.Leaf(f).Point(:).tod}] ;

            TotalSum_tempC = sum([Q.Leaf(f).Point(:).tempC]) + TotalSum_tempC ;
            Totalcell_tempC = [Totalcell_tempC,{Q.Leaf(f).Point(:).tempC}];

            TotalSum_sol = sum([Q.Leaf(f).Point(:).sol]) + TotalSum_sol ;
            Totalcell_sol = [Totalcell_sol,{Q.Leaf(f).Point(:).sol}];

            Totalcell_occ = [Totalcell_occ,{Q.Leaf(f).Point(:).occ}];
            Totalcell_mon = [Totalcell_mon,{Q.Leaf(f).Point(:).mon}];

            TotalSum_winspeed = sum([Q.Leaf(f).Point(:).winspeed]) + TotalSum_winspeed;
            Totalcell_winspeed = [Totalcell_winspeed,{Q.Leaf(f).Point(:).winspeed}];

            TotalSum_windir = sum([Q.Leaf(f).Point(:).windir]) + TotalSum_winspeed ; 
            Totalcell_windir = [Totalcell_windir,{Q.Leaf(f).Point(:).windir}];

            TotalSum_gusts = sum([Q.Leaf(f).Point(:).gusts]) + TotalSum_gusts ;
            Totalcell_gusts = [Totalcell_gusts,{Q.Leaf(f).Point(:).gusts}];

            TotalSum_hum = sum([Q.Leaf(f).Point(:).hum]) +TotalSum_hum ; 
            Totalcell_hum = [Totalcell_hum,{Q.Leaf(f).Point(:).hum}];

            TotalSum_dew = sum([Q.Leaf(f).Point(:).dew]) + TotalSum_dew ;
            Totalcell_dew = [Totalcell_dew,{Q.Leaf(f).Point(:).dew}];

            TotalSum_hdd = sum([Q.Leaf(f).Point(:).hdd]) + TotalSum_hdd  ;
            Totalcell_hdd = [Totalcell_hdd,{Q.Leaf(f).Point(:).hdd}];

            TotalSum_cdd = sum([Q.Leaf(f).Point(:).cdd]) + TotalSum_cdd ;
            Totalcell_cdd = [Totalcell_cdd,{Q.Leaf(f).Point(:).cdd}];
        end

        % Converts cells into arrays,
        TotalSum_domarray = cell2mat(Totalcell_dom);
        TotalSum_todarray = cell2mat(Totalcell_tod);
        TotalSum_occarray = cell2mat(Totalcell_occ);
        TotalSum_monarray = cell2mat(Totalcell_mon);

        TotalSum_array_tempC = cell2mat(Totalcell_tempC);
        TotalSum_array_sol= cell2mat(Totalcell_sol);
        TotalSum_array_winspeed = cell2mat(Totalcell_winspeed);
        TotalSum_array_windir = cell2mat(Totalcell_windir);
        TotalSum_array_gusts = cell2mat(Totalcell_gusts);
        TotalSum_array_hum = cell2mat (Totalcell_hum);
        TotalSum_array_dew= cell2mat (Totalcell_dew);
        TotalSum_array_hdd= cell2mat(Totalcell_hdd);
        TotalSum_array_cdd=cell2mat(Totalcell_cdd);

        % Creates box plots for each feature in each bin
        %Each figure contains one box plot for each bin for a given feature
        
        tempC_figure = figure(2);
        subplot(1,number_bins,h);
        boxplot(TotalSum_array_tempC,'labels',sprintf('%.0f - %.0f', Ymin_interval.bin(h), Ymax_interval.bin(h)));
       
         
         
         sol_figure = figure(3);
         subplot(1,number_bins,h);
         boxplot(TotalSum_array_sol,'labels',sprintf('%.0f - %.0f', Ymin_interval.bin(h), Ymax_interval.bin(h)));
         
        
         winspeed_figure = figure(4);
        subplot(1,number_bins,h);
        boxplot(TotalSum_array_winspeed,'labels',sprintf('%.0f - %.0f', Ymin_interval.bin(h), Ymax_interval.bin(h)));
        
        
        windir_figure = figure(5);
        subplot(1,number_bins,h);
        boxplot(TotalSum_array_windir,'labels',sprintf('%.0f - %.0f', Ymin_interval.bin(h), Ymax_interval.bin(h)));
        
         
        gusts_figure = figure(6);
         subplot(1,number_bins,h);
         boxplot(TotalSum_array_gusts,'labels',sprintf('%.1f - %.1f', Ymin_interval.bin(h), Ymax_interval.bin(h)));
        
         
         hum_figure = figure(7);
         subplot(1,number_bins,h);
          boxplot(TotalSum_array_hum,'labels',sprintf('%.0f - %.0f', Ymin_interval.bin(h), Ymax_interval.bin(h)));
         
         
          dew_figure = figure(8);
           subplot(1,number_bins,h);
         boxplot(TotalSum_array_dew,'labels',sprintf('%.0f - %.0f', Ymin_interval.bin(h), Ymax_interval.bin(h)));
        
         
         hdd_figure = figure(9);
        subplot(1,number_bins,h);
         boxplot(TotalSum_array_hdd,'labels',sprintf('%.0f - %.0f', Ymin_interval.bin(h), Ymax_interval.bin(h)));
         
         cdd_figure = figure(10);
          subplot(1,number_bins,h);
         boxplot(TotalSum_array_cdd,'labels',sprintf('%.0f - %.0f', Ymin_interval.bin(h), Ymax_interval.bin(h)));
         


        for b=1:3;
            Most_dom.number(b) = mode(TotalSum_domarray);
            TotalSum_domarray = TotalSum_domarray(TotalSum_domarray ~= Most_dom.number(b));
            Most_tod.number(b) = mode(TotalSum_todarray);
            TotalSum_todarray = TotalSum_todarray(TotalSum_todarray ~= Most_tod.number(b));
            Most_occ.number(b) = mode(TotalSum_occarray);
            TotalSum_occarray = TotalSum_occarray(TotalSum_occarray ~= Most_occ.number(b));
            Most_mon.number(b) = mode(TotalSum_monarray);
            TotalSum_monarray = TotalSum_monarray(TotalSum_monarray ~= Most_mon.number(b));
        end
        % Calculates average by diving the sum off features divided by
        % total number of data points that lie within the Bin
             Bin(h).dom_mode = [Most_dom.number(1),Most_dom.number(2),Most_dom.number(3)];
            
             Bin(h).tod_mode= [Most_tod.number(1),Most_tod.number(2),Most_tod.number(3)];
            
             Bin(h).avg_tempC = (TotalSum_tempC ./ Total_Points);
             ts = ([-2 2]);
             Bin(h).tempC_CI = mean(TotalSum_array_tempC)+ ts;
            
             Bin(h).avg_sol = (TotalSum_sol ./ Total_Points);
             ts = ([-2 2]);
             Bin(h).sol_CI  = mean(TotalSum_array_sol)+ ts;
             
             Bin(h).occ_mode = Most_occ.number(1);
             
             Bin(h).mon_mode =  [Most_mon.number(1),Most_mon.number(2),Most_mon.number(3)];
             
             Bin(h).avg_winspeed = (TotalSum_winspeed ./ Total_Points);
             ts = ([-2 2]);
             Bin(h).winspeed_CI = mean(TotalSum_array_winspeed)+ ts;
             
             Bin(h).avg_windir = (TotalSum_windir ./ Total_Points);
             ts = ([-2 2]);
             Bin(h).windir_CI = mean(TotalSum_array_windir)+ ts;
             
             Bin(h).avg_gusts = (TotalSum_gusts ./ Total_Points);
             ts =([-2 2]);
             Bin(h).gusts_CI = mean(TotalSum_array_gusts)+ ts;
             
             Bin(h).avg_hum = (TotalSum_hum ./ Total_Points); 
             ts = ([-2 2]);
             Bin(h).hum_CI = mean(TotalSum_array_tempC)+ ts;
             
             Bin(h).avg_dew = (TotalSum_dew ./ Total_Points);
             ts = ([-2 2]);
             Bin(h).dew_CI = mean(TotalSum_array_dew)+ ts;
             
             Bin(h).avg_hdd = (TotalSum_hdd ./ Total_Points);
             ts = ([-2 2]);
             Bin(h).hdd_CI = mean(TotalSum_array_hdd)+ ts;
             
             Bin(h).avg_cdd = (TotalSum_cdd ./ Total_Points);
            
             ts = ([-2 2]);
             Bin(h).cdd_CI = mean(TotalSum_array_cdd)+ ts;
            
             
            % Calculates support by dividing total data points in specified range
            % by total number of points in all training data 
            Bin(h).support = Total_Points ./ length(TreeX);
            
      
        
end

figure(2)
            annotation('textbox', [0 0.9 1 0.1], ...
            'String', 'Temp-C', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center')
        annotation('textbox', [0 0 1 .05], ...
            'String', 'kW', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center','Fontsize',12)   
          annotation('textbox', [0 .5 1 0.1], ...
            'String', '°C', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'left','Fontsize',12)  
        
figure(3)
          annotation('textbox', [0 0.9 1 0.1], ...
            'String', 'SOLAR', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center')
        annotation('textbox', [0 0 1 .05], ...
            'String', 'kW', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center','Fontsize',12)   
          annotation('textbox', [0 .5 1 0.1], ...
            'String', 'W/M^2', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'left','Fontsize',12)  
         

figure(4)
         annotation('textbox', [0 0.9 1 0.1], ...
            'String', 'WINSPEED', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center')
        annotation('textbox', [0 0 1 0.05], ...
            'String', 'kW', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center','Fontsize',12)   
         annotation('textbox', [0 .5 1 0.1], ...
            'String', 'MPH', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'left','Fontsize',12)  
figure(5)
         annotation('textbox', [0 0.9 1 0.1], ...
            'String', 'WINDIR', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center')
        annotation('textbox', [0 0 1 0.05], ...
            'String', 'kW', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center','Fontsize',12)   
          annotation('textbox', [0 .5 1 0.1], ...
            'String', 'Direc', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'left','Fontsize',12)  
         
figure(6)
        annotation('textbox', [0 0.9 1 0.1], ...
            'String', 'Gusts', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center')
    annotation('textbox', [0 0 1 0.05], ...
            'String', 'kW', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center','Fontsize',12)   
         annotation('textbox', [0 .5 1 0.1], ...
            'String', '', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'left','Fontsize',12)  
figure(7)
         annotation('textbox', [0 0.9 1 0.1], ...
            'String', 'HUMIDITY', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center')
        annotation('textbox', [0 0 1 0.05], ...
            'String', 'kW', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center','Fontsize',12)   
         annotation('textbox', [0 .5 1 0.1], ...
            'String', '%', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'left','Fontsize',12)  
figure(8)
          annotation('textbox', [0 0.9 1 0.1], ...
            'String', 'DEW', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center')
        annotation('textbox', [0 0 1 0.05], ...
            'String', 'kW', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center','Fontsize',12)   
         annotation('textbox', [0 .5 1 0.1], ...
            'String', '%', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'left','Fontsize',12)  
figure(9)
         annotation('textbox', [0 0.9 1 0.1], ...
            'String', 'HDD', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center')
        annotation('textbox', [0 0 1 0.05], ...
            'String', 'kW', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center','Fontsize',12)   
          annotation('textbox', [0 .5 1 0.1], ...
            'String', 'Days', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'left','Fontsize',12)  
         
figure(10)
      annotation('textbox', [0 0.9 1 0.1], ...
            'String', 'CDD', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center')
      annotation('textbox', [0 0 1 0.05], ...
            'String', 'kW', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'center','Fontsize',12)   
      annotation('textbox', [0 .5 1 0.1], ...
            'String', 'Days', ...
            'EdgeColor', 'none', ...
            'HorizontalAlignment', 'left','Fontsize',12)  
