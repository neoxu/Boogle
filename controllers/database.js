var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var urlNiceMarket = format("mongodb://%s:%s@%s:%s/%s", 'neo', '1234', 'dharma.mongohq.com', 10042, 'NiceMarket');
var url = format("mongodb://%s:%s@%s:%s/%s", 'neo', '1234', 'paulo.mongohq.com', 10003, 'BasketballClub');
var clubCollection = 'club';
var usersCollection = 'users';
var cloudinary = require('cloudinary');

function getValue(url, varname) {		
	var qparts = url.split("?");
	if (qparts.length == 0) {
		return "";
	}
	var query = qparts[1];
	if (query.split) {
		var vars = query.split("&amp;");
		var value = "";
		for ( i = 0; i < vars.length; i++) {
			var parts = vars[i].split("=");
			if (parts[0] == varname) {
				value = parts[1];
				break;
			}
		}
		value = unescape(value);
		value.replace(/\+/g, " ");
		return value;
	} else
		return '';
}

function dbUpdate(dbUrl, collectionName, query, doc, res) {	
	
	function updateCallback(err) {
		if (!err) {
			console.log(collectionName + ' update success');
			if (res)
				res.send({});
		} else {
			console.log(collectionName + ' update fail ' + err);
			if (res)
				res.send({err: 'se2'});
		}
	}

	MongoClient.connect(dbUrl, function(err, db) {
		if (!err) {			
			if (db != null) {
				var collection = db.collection(collectionName);
				if (collection != null) {		
					collection.update(query, doc, {upsert : true}, updateCallback);
				} else
					console.log(collectionName + ' not found');
			} else
				console.log(dbUrl + ' not found');
		} else
			console.log(dbUrl + ' connect fail ' + err);
	});
}

function dbfind(dbUrl, collectionName, query, fields, sortParam, callback) {
	MongoClient.connect(dbUrl, function(err, db) {
		if (!err) {			
			if (db != null) {
				var collection = db.collection(collectionName);
				if (collection != null) {					
					var myCursor = collection.find(query, fields).sort(sortParam); 
					
					myCursor.toArray(function(err, docs) {
						if (!err) 				
							callback(docs);
						else
						    console.log(collectionName + ' find error ' + err);
					});    
				} else
					console.log(collectionName + ' not found');
			} else
				console.log(dbUrl + ' not found');
		} else
			console.log(dbUrl + ' connect fail ' + err);		
	});
}

function dbfindOne(dbUrl, collectionName, query, fields, callBack) {
	MongoClient.connect(dbUrl, function(err, db) {
		if (!err) {			
			if (db != null) {
				var collection = db.collection(collectionName);
				if (collection != null) {					
					collection.findOne(query, fields, callBack); 
				} else
					console.log(collectionName + ' not found');
			} else
				console.log(dbUrl + ' not found');
		} else
			console.log(dbUrl + ' connect fail ' + err);		
	});
}
			
function doRemove(dbUrl, collectionName, query, res) {	
	
	function removeCallback(err) {
		if (!err) {
			res.send({});
			console.log(collectionName + ' remove success ');
		} else {
			console.log(collectionName + ' remove fail ' + err);
		}
	}	

	MongoClient.connect(dbUrl, function(err, db) {
		if (!err) {			
			if (db != null) {
				var collection = db.collection(collectionName);
				if (collection != null) {			
					collection.remove(query, true, removeCallback);						
				} else
					console.log(collectionName + ' not found');
			} else
				console.log(dbUrl + ' not found');
		} else
			console.log(dbUrl + ' connect fail ' + err);	
	});
}

function basketballclub(req, res) {	  
	var query = {};
	var fields = {_id: 0};
	var sortParam = {clubName:1};
	dbfind(url, clubCollection, query, fields, sortParam, function(docs){
		res.render('basketballclub', {
			title : 'Basketball Club',
			layout : 'layout',
			docs : docs,
			req : req
		});	
	});	
}

function createclub(req, res) {	  
	if (req.body.clubName) {		
		var query = {clubName : req.body.clubName};
		var club = {clubName: req.body.clubName, clubInfo: req.body.clubInfo};		
		dbUpdate(url, clubCollection, query, club);	
		
		console.log(req.body.image);
		if (req.body.image) {
			console.log(req.body.image);
			cloudinary.uploader.upload(req.body.image, function(result) {
				console.log(result);
			});
		}
		
		res.render('index', {
			title : 'Basketball Club',
			layout : 'layout',
			req : req
		}); 
	} else {
		res.render('createclub', {
			title : 'Basketball Club',
			layout : 'layout',
			err : 'Infomation error.',
			req : req
		}); 
	}
}

function club(req, res) {	 
	var clubName = getValue(req.url, 'clubname');
	if (clubName !== '') {		
		var query = {clubName : clubName};
		var fields = {_id : 0};
		dbfindOne(url, clubCollection, query, fields, function(err, club) {
			console.log(club);				
			if (club) {
				res.render('club1', {
					title : 'Club Information',
					layout : 'layout',
					club : club,
					req : req
				});
			} else
				res.send(404);
		});		
	} else {
		res.render('createclub', {
			title : 'Basketball Club',
			layout : 'layout',
			err : 'Infomation error.',
			req : req
		}); 
	} 	
}