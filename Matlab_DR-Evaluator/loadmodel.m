function [model] = loadmodel(filename)
   %#function TreeBagger
    model = load (filename , '-mat');
end