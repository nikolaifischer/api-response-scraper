/*
	Scrapes the DB BahnPark API and saves the responses to a database.
	API Responses older that 3 Months get deleted.
	This is QUICK AND DIRTY. Deal with it.
*/

var http = require('http');
var mongoose = require('mongoose');
var config = require('../config');

var parking = require('./models/parking');

// Models

var parking = require('./models/parking');

var options = {
	user: config.user,
	pass: config.password
}




mongoose.connect(config.db, options);



mongoose.connection.on('connected', function () {  



	stealThatData = function() {

		console.log("Stealing Data. Don't tell anyone.");

		http.get({
		  hostname: 'opendata.dbbahnpark.info',
		  port: 80,
		  path: '/api/beta/occupancy',
		  agent: false  // create a new agent just for this one request
		}, function(res) {

			var body = "";
			res.on("data", function(chunk) {
		    body += chunk;
		  	});

		    res.on("end", function() {

		    	var data= JSON.parse(body);
		    	console.log(data.allocations.length);

		    	for(var i=0; i<data.allocations.length; i++) {
			    	nextEntry = new parking();
			    	nextEntry.entry = data.allocations[i];
			    	nextEntry.save();
			    	

		    	}

		    	console.log("added entries to the db");

		    });
		}
		);


		
	}

	deleteThatData = function() {
		console.log("Deleting old Data!");
		parking.find({}, function(err, documents) {

			if (err) {
				console.log(err);
				return;
			}
			if(documents.length>0) {
				for(var i=0; i<documents.length; i++) {

					var timeS= documents[i].entry.allocation.timestamp;
					var data_time = new Date(timeS);
					var now_time = new Date();
					

					if(now_time - data_time > 6.048e+8) { 
						  //14 DAYS: 1.21e+9 3 DAYS: 2.592e+8, 3 MONTHS: 7.884e+9
						parking.findOne({"_id": documents[i]._id}, function (err, removeThis) {
							removeThis.remove(function (err){

							if(err) {
								console.log(err);
							}
							
							});
						});

						
					}

				}

			}
		});
	}

	setInterval(stealThatData, 60000*60); //every 60 mins
	setInterval(deleteThatData, 60000*60*24); //every Day

});



