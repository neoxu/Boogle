var util = require('util');
var url = require('url');
var cloudinary = require('cloudinary');
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;
var dbUrl = format('');
var userCollection = 'user';
var clubCollection = 'club';
var seasonCollection = 'season';
var courtCollection = 'court';

function dbUpdate(collectionName, query, doc, callback) {	
	
	function updateCallback(err) {
		if (!err) {
			console.log(collectionName + ' update success');
		} else {
			console.log(collectionName + ' update fail ' + err);
		}
	}

	MongoClient.connect(dbUrl, function(err, db) {
		if (!err) {			
			if (db != null) {
				var collection = db.collection(collectionName);
				if (collection != null) {		
					if (callback)
						collection.update(query, doc, {upsert : true}, callback);
					else
						collection.update(query, doc, {upsert : true}, updateCallback);
				} else
					console.log(collectionName + ' not found');
			} else
				console.log(dbUrl + ' not found');
		} else
			console.log(dbUrl + ' connect fail ' + err);
	});
}

function dbfind(collectionName, query, fields, sortParam, callback) {
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

function dbfindOne(collectionName, query, fields, callBack) {
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
	
function doRemove(collectionName, query, res) {	
	
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

function fblogin(req, res) {	
	var urlData = url.parse(req.url,true);
	//console.log('fblogin: ' + util.inspect(req.session, true));	
	var user = {uid: urlData.query.uid, name: urlData.query.name};
	req.session.controller = 'fblogin';
	req.session.user = user;	

	var query = {uid : urlData.query.uid};
	var fields = {_id : 0};
    
	dbfindOne(userCollection, query, fields, function(err, auser) {
		if (!err) {
			if (auser) {
				req.session.user = auser;
			} else {
				var newUser = {
					$set : {
						uid : urlData.query.uid,
						name : urlData.query.name,
						email : urlData.query.email,
						birthday : urlData.query.birthday,
						location : urlData.query.location
					}
				};
				dbUpdate(userCollection, query, newUser);
			}
		} else
			console.log(err);
			
		res.redirect('/');	
	});
}

function fblogout(req, res) {	
	req.session.user = {};
	req.session.user = undefined;
	res.redirect('/');
}
	
function basketballclub(req, res) {	  
	var query = {};
	var fields = {_id: 0};
	var sortParam = {clubName:1};
	dbfind(clubCollection, query, fields, sortParam, function(docs){
		res.render('index', {
			title : 'Basketball Club',
			layout : 'layout',
			docs : docs,
			req : req
		});	
	});	
}

function createClub(req, res) {	  	
	if (req.session.user.email && req.session.user.authority && req.session.user.authority > 1) {
		if (req.body.clubName) {
			var query = {clubName : req.body.clubName};
			var club = {
				owner : req.session.user.email,
				clubName : req.body.clubName,
				clubInfo : req.body.clubInfo
			};

			if (req.files.file) {
				cloudinary.uploader.upload(req.files.file.path, function(result) {
					club['backgroundimg'] = result;
					dbUpdate(clubCollection, query, club, updateCallback);
				});
			} else 
				dbUpdate(clubCollection, query, club, updateCallback);

			function updateCallback(err) {
				res.redirect('/');
			}
		} else 
			res.send('Please enter club name.');
	} else
		res.send('No authority.');
}

function club(req, res) {	
	var urlData = url.parse(req.url,true);
	if (urlData && urlData.query && urlData.query.clubname) {		
		var query = {clubName : urlData.query.clubname};
		var fields = {_id : 0};		
		
		dbfindOne(clubCollection, query, fields, function(err, club) {
			if (club) {
				var canedit = false;
				if (club.owner && req.session.user && req.session.user.email && 
					club.owner == req.session.user.email)
					canedit = true;
			
				res.render('club', {
					title : 'Club Information',
					layout : 'layout',
					club : club,
					req : req,
					canedit : canedit					
				});
			} else
				res.send(404);
		});		
	} else {
		res.redirect('/');
	} 	
}


function createSeason(req, res) {
	if (req.session.user.email && req.session.user.authority && req.session.user.authority > 1) {
		if (req.body.seasonName) {
			if (req.body.clubName) {
				var query = {
					clubName : req.body.clubName,
					owner : req.session.user.email
				};
				
				var fields = {
					clubInfo : 0,
					backgroundimg : 0
				};
				
				dbfindOne(clubCollection, query, fields, function(err, club) {

					if (club) {
						var query = {
							clubID : club._id,
							seasonName : req.body.seasonName
						};
						
						var season = {
							clubID : club._id,
							seasonName : req.body.clubName
						};

						dbUpdate(seasonCollection, query, season, updateCallback);

						function updateCallback(err) {
							res.redirect('/');
						}

					} else
						res.send('Club not found.');
				});

			} else
				res.send('No club name');
		} else
			res.send('Please enter season name.');
	} else
		res.send('No authority');
}
