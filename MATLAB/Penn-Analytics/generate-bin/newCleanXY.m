 function [cX,cY,len,loss] = newCleanXY(X,Y,sigmah,sigmal)
% Clean the training data of missing data nd outliers.

Ybar = mean(Y);
Ydev = std(Y);
Ylimh = Ybar+(sigmah*Ydev);
Yliml = Ybar-(sigmal*Ydev);

Yidx = find((Y>=Ylimh & Y~=0)|(Y<=Yliml & Y~=0));

X(Yidx,:)=[];
Y(Yidx) = [];

cX = X;
cY = Y;

len = length(cY);
loss = length(Yidx)/length(Y);

end

