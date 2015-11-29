% clear the command line.
clc
% clear the workspace.
clear 
% close any prev figures.
close all


Data = csv2matPenn('New_15_DRL_2.csv','DRL'); 
Numdata = Data(2:end,1:end);
Tabledata = cell2mat(Numdata);

% indexes csv file for data and assigns it to variables 
dom = Tabledata(:,3);
tod = Tabledata(:,4);
tempC = Tabledata(:,5);
sol = Tabledata(:,9);
occ = Tabledata(:,15);
mon = Tabledata(:,2);
winspeed = Tabledata(:,10);
windir = Tabledata(:,12);
gusts = Tabledata(:,11);
hum = Tabledata(:,8);
dew = Tabledata(:,7);
hdd = Tabledata(:,13);
cdd = Tabledata(:,14);
kw = Tabledata (:,17);


% contruct the feature matrix: columns of this matrix are the different
% features and each row is one sample.
X = [dom,tod,tempC,sol,occ,mon,winspeed,windir,gusts,hum,dew,hdd,cdd];
% Y is our response variabel whihc we intend to predict. in this case its
% electricity consumption in kW.
Y = kw;

% Specify names for coluns to keep track of features in the tree instead of
% column numbers.
 colnames={'dom','tod','tempC','sol','occ','mon','wspeed','wdir','gusts','hum','dew','hdd','cdd'};
% catcol = indicies of those columns whihc are categorical. The tree takes this into consideration. 
 catcol = [1,2,6];

% Very primitive outlier detection and removal.
sigmah = 2.5;
sigmal = 2;
% removes any points from X and Y where the values is outside of signalh
% and sigmal standard deviation away from the mean.
[X,Y,len,loss] = newCleanXY(X,Y,sigmah,sigmal);

% interpolates over 0s
[iX,iY] = InterPenn (X,Y);


% training length = 80% of the dataset. We will train on 80% of the data dn
% use the remaining 20% for validation.
trlen = floor(0.8*len);

% construct the training inputs. The traiing feature matrix and the
% training response.
Xtrain = iX(1:trlen,:);
Ytrain = iY(1:trlen);

% store the remaining data as a test-set: test inputs and outputs.
Xtest = iX(trlen+1:end,:);
Ytest = iY(trlen+1:end);

% compute range and mean for the test set. this is used later to compute
% goodness of fit.
range = max(Ytest)-min(Ytest);
bar = mean(Ytest);

% plot the training data features.
figure(11);
for jj=1:length(colnames);
    
    subplot(ceil(length(colnames)/2),2,jj);
    plot(Xtrain(:,jj));
    str = colnames(jj);
    title(str);
    grid on;
end

 %% Start Tree Regression
disp('Learning Regression Tree...');

% minimium number of leaf node observations. This is a stopping cirtera for
% the recursive partitionioning algorithm used by the tree.
minleaf = 10;  

% In Matlab, you can use tic and toc to measure the time elapsed between
% different points in your code. Here we want to measure how much time does
% it take for the tree to build up.
tic
college_hall_tree14 = RegressionTree.fit(Xtrain,Ytrain,'PredictorNames',colnames,'ResponseName','Total Power','CategoricalPredictors',catcol,'MinLeaf',minleaf);
toc

% You can view the tree by uncommenting the line below.
%view(largetree12,'mode','graph');

% predict on training and testing data and plot the fits
Yfit = predict(college_hall_tree14,college_hall_tree14.X);

% compute NRMSE for the traingin period: also referred to as resubstitution
% error.
[a,b]=rsquare(college_hall_tree14.Y,Yfit);
fprintf('Training RMSE(W): %.2f, R2: %.3f, RMSE/peak: %.4f, NRMSD: %.2f \n\n'...
    ,b,a,(b/max(college_hall_tree14.Y)),(100*b/(max(college_hall_tree14.Y)-min(college_hall_tree14.Y))));


 [Bin,ST,Interval]= AnalyticsFunction (college_hall_tree14,5);


%% Improve the tree by using k-fold cross validation
disp('Learning a cross validated tree...');

% specify number of folds.
kf = 10;

% train cross-validated trees.
tic
b101treeCV = RegressionTree.fit(Xtrain,Ytrain,'PredictorNames',colnames,...
    'ResponseName','Total Power','CategoricalPredictors',catcol,...
    'MinLeaf',minleaf,'CrossVal','on','KFold',kf); % default is 10-fold
toc

% obtain predictions on the traiing set.
YfitCV = kfoldPredict(b101treeCV);

% compute resubstitution error for the CV trees
[a,b]=rsquare(college_hall_tree14.Y,YfitCV);
fprintf('Cross Validated Training RMSE(W): %.2f, R2: %.3f, RMSE/peak %.4f, NRMSD: %0.2f \n\n'...
    ,b,a,(b/max(college_hall_tree14.Y)),(100*b/(max(college_hall_tree14.Y)-min(college_hall_tree14.Y))));


%% Random Forests
 disp('Learning a Random Forest...');
% leaf = [5 10 50 100];
% col = 'rbcmyk';
% figure();
% for i=1:length(leaf)
%     brf = TreeBagger(200,Xtrain,Ytrain,'Method','regression','OOBPred','On','OOBVarImp','on',...
%         'CategoricalPredictors',catcol,'MinLeaf',leaf(i));
%     plot(sqrt(oobError(brf)),col(i));
%     hold on;
% end
% xlabel 'Number of Grown Trees';
% ylabel 'Root Mean Squared Error' ;
% legend({'5','10' '50' '100'},'Location','NorthEast');
% hold off;
% 
% figure();
% barh(brf.OOBPermutedVarDeltaError);
% xlabel 'Feature' ;
% ylabel 'Out-of-Bag Feature Importance';
% set(gca,'YTickLabel',colnames);

% train a random forest with 500 trees.
tic;
B = TreeBagger(500,Xtrain,Ytrain,'Method','regression','OOBPred','On','OOBVarImp','On',...
      'MinLeaf',minleaf);
toc;

% plot feature importance.
figure();
barh(B.OOBPermutedVarDeltaError);
xlabel 'Feature' ;
ylabel 'Out-of-Bag Feature Importance';
set(gca,'YTickLabel',colnames);

% figure();
% plot(sqrt(oobError(B)));

% obtian predictions on training data
Ybag = predict(B,college_hall_tree14.X);

% resub error
[a,b]=rsquare(college_hall_tree14.Y,Ybag);
fprintf('Random Forests Training RMSE(W): %.2f, R2: %.3f, RMSE/peak %0.4f, NRMSD: %0.2f \n\n'...
    ,b,a,(b/max(college_hall_tree14.Y)),(100*b/(max(college_hall_tree14.Y)-min(college_hall_tree14.Y))));



%%

% plot the prediction performance on the training data for all the methods.
figure;
plot(college_hall_tree14.Y), hold on
plot(Yfit,'y');
plot(YfitCV,'r');
plot(Ybag,'c');
grid on;
legend('Ground Truth','Single Tree','CV Tree','Forest');
title('Training');
hold off;

% now obtian prediction ont he test set. This is really the value we care
% about since we are evaluationg thwe prediction performance on data that
% the algorithm has never seen before.
Ypredict = predict(college_hall_tree14,Xtest);

% RMSE on the test set
[a,b]=rsquare(Ytest,Ypredict);
fprintf('Testing RMSE(W): %.2f, R2: %.3f, RMSE/peak: %.4f, NRMSD: %.2f \n'...
    ,b,a,(b/max(Ytest)),(100*b/bar));

% prediction on test data for cross validated (CV) trees.
YpredictCVk=zeros(length(Xtest),kf);
for ii=1:kf
    YpredictCVk(:,ii)=predict(b101treeCV.Trained{ii,1},Xtest);
end
YpredictCV = sum(YpredictCVk,2)/kf;

% RMSE on the test set
[a,b]=rsquare(Ytest,YpredictCV);
fprintf('Cross Validated Testing RMSE(W): %.2f, R2: %.3f, RMSE/peak %.4f, NRMSD: %0.2f \n'...
    ,b,a,(b/max(Ytest)),(100*b/bar));

% Do the same for random forests
Ybagt = predict(B,Xtest);
% RMSE
[a,b]=rsquare(Ytest,Ybagt);
fprintf('RF (Testing) RMSE(W): %.2f, R2: %.3f, RMSE/peak %.4f, NRMSD: %0.2f \n\n'...
    ,b,a,(b/max(Ytest)),(100*b/bar));

% plot the prediciton vs ground truth comparison for each method on the
% test set.
figure;
plot(Ytest), hold on
axis([0 length(Ytest) 0 max(Ytest)+20]);
plot(Ypredict,'y');
plot(YpredictCV,'r');
plot(Ybagt,'c');
legend('Ground Truth','Single','CV','Forest');
title('2015');
grid on;
hold off;



