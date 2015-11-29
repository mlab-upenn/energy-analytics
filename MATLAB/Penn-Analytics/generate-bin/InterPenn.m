
function [iX, iY] = InterPenn(X,Y)

% Replace 0s with NANs
Y_0_index = find(Y == 0); 
Y(Y_0_index) = NaN;


Xaxis_Y = (1:length(Y)); % creates Xaxis_Y the same length as Y
Xnumberindex_Y = Xaxis_Y(~isnan(Y)); % returns X values where Y is not NAN
Ynumberindex_Y = Y(~isnan(Y)); % returns Y values where Y is not NAN

% interpolates Y 
iY = (interp1(Xnumberindex_Y,Ynumberindex_Y,Xaxis_Y).'); 

% Returns the number of rows and columns in X
[r,c] = size(X);
% Creates matrix iX with same dimensions as X
iX = zeros (r,c);

% Changes 1s in Humidity to NaN
Hum = X(:,10);
Hum_index = find(Hum == 1); 
Hum(Hum_index) = NaN;
X(:,10) = Hum;

%Creates temporary x value to interpolate
Tempx = X;
    
%for j= [3,4,7,8,9,10,11,14,15,16,17];
for j= [3,4,7,8,9,10,11];
    
    X_0_index = find(Tempx == 0); 
    Tempx(X_0_index) = NaN;
    
    Xaxis_X = (1:r);  % creates Xaxis_Y the same length as Y
    columnj = Tempx(:,j); 
    Xnumberindex_X = Xaxis_X(~isnan(columnj)); % returns X values where X is not NAN for column j
    Ynumberindex_X= columnj(~isnan(columnj)); % returns Y values where X is not NAN for column j
    
    Xc = (interp1(Xnumberindex_X,Ynumberindex_X,Xaxis_X).'); % interpolates column j
    iX(:,j) = Xc;   %Writes interpolated values to matrix iX
end

% Writes columns which where not interpolated to iX
for i = [1,2,5,6,12,13];
    iX(:,i)= X(:,i);
end
    

























