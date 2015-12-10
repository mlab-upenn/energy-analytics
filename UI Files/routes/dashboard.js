var express    = require("express");
var mysql      = require('mysql');
var app = express();

    var speechwindow,id,intent_id,Intent_response;

function getResults(output,url_id,intent_num,callback) {
	// The result for speech window
	        var speech = output;
	        console.log(output);
	
	// The result for the plotly embed urls
	        
	        var id_url = url_id;
	        console.log(id_url);
	        //var url = 'https://plot.ly/~ssamarth/'+url_id+'/'; 
	        //console.log(url);
			//var img = 'https://plot.ly/~ssamarth/'+url_id+'.png';
			//console.log(img);
			//var data = 'ssamarth:'+url_id;
			//console.log(data);
	
	// The result for sample utterances
			var choose = intent_num;
		    var Intent= ['RepeatIntent','CustomOptionIntent','HelpIntent','FinishIntent','OpenEndedOptionTwoIntent','OpenEndedOptionOneIntent','ChangeSetpointIntent','ChoiceIntent'];
			if (Intent[choose] === 'RepeatIntent'){
				Intent_response = ['1. Repeat the options','2. Can you repeat the options','3. Tell me the options','4. State the options'];
			}
			else if (Intent[choose] === 'CustomOptionIntent') {
				 Intent_response = ['1. Set the {setpointType}','2. Set point to {setPointValue} degree celsius','3. Set the {setpointType} at {setPointValue} degree celsius','4. {setpointType} is {setPointValue} degrees'];	
			}
			else if (Intent[choose] === 'HelpIntent'){
				 Intent_response = ['1. What questions can I ask',' 2. What are various options which I can know about from you','3.Help me','4. What commands can I say'];
			}
			else if (Intent[choose] === 'FinishIntent'){
				Intent_response = ['1. Exit','2. Quit','3. Bye','4. Leave'];
			}
			else if (Intent[choose]=== 'OpenEndedOptionTwoIntent'){
				Intent_response = ['1. I want to select my own strategy','2. I want to choose my own strategy','3. I want to form my custom strategy','4. I want to form my own strategy'];
			}
			else if (Intent[choose] === 'OpenEndedOptionOneIntent'){
				Intent_response = ['1. Which is the best strategy to go with ?','2. Suggest me the best strategy.','3. Provide best solution for power consumption.','4. Suggest me most efficient power solution.','5. Which is the best strategy ?','6. Tell me which would be the best strategy.'];
			}
			else if(Intent[choose] === 'ChangeSetpointIntent'){
				Intent_response = ['1.What happens if I change {setpointType} to {setPointValue} percent','2. What happens if I change {setpointType} to {setPointValue} degrees','3.What will happen if I change the {setpointType} to {setPointValue} degree celsius','4. I want to change {setpointType} to {setPointValue} degree celsius'];
			}
			else if (Intent[choose] === 'ChoiceIntent'){
				Intent_response = ['1. Select option {optionNumber}','2. Select option number {optionNumber}',' 3. Choose option {optionNumber}'];
			}
			console.log(Intent_response);
			var results = {'speech':speech,'id_url':url_id,'intent':Intent_response};
			callback(results);
}
function generateResponse(req, res) {
	var connection = mysql.createConnection({
		  host     : 'cis550-movie-junkies-mysql-instance.cuzkvenhnm4n.us-east-1.rds.amazonaws.com',
		  user     : 'cis550',
		  password : 'iamamoviejunkie',
		  database : 'Movie_Database'
		});
	   connection.connect(function(err){
		if(!err) {
		    console.log("Database is connected ... \n\n");
		} else {
		    console.log("Error connecting database ... \n\n");
		}
		});
	   connection.query('SELECT * FROM `RTES` ORDER BY ID DESC LIMIT 1', function(err, rows, fields) {
	        if(!err){
			var speechwindow = rows[0].ALEXA;
			//console.log(speechwindow);
			var id = rows[0].URL_ID;
			//console.log(id);
			var intent_id = rows[0].INTENT_NUM;
			//console.log(intent_id);
			getResults(speechwindow,id,intent_id,function(results) {
				connection.end();
				console.log("Hi");
				res.render('dashboard.ejs', {results: results});
			});
	        }
	        else{
	            console.log('Error');}
	});
			
}

exports.displayResponse = function(req, res){
	generateResponse(req, res);
};