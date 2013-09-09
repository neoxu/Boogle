var ACS = require('acs').ACS,
    logger = require('acs').logger,
    fs = require('fs');

function _create(req, res) {
  req.session.controller = "photos";
  var data = {
    photo: req.files.photo
  };
  data['photo_sizes[medium_500]'] = '500x333';
  data['photo_sync_sizes[]'] = 'medium_500';
  ACS.Photos.create(data, function(e) {
    if(e.success && e.success === true){
      logger.info('photos#create: ' + JSON.stringify(e));
      req.session.flash = {msg:"Successfully create a photo #"+e.photos[0].id, r:0};
      res.redirect('/');
    }else{
      logger.debug('Error: ' + JSON.stringify(e));
      req.session.flash = {msg:e.message, r:0};
      res.redirect('/');
    }
  }, req, res);
}

function _create_json(req, res) {
  req.session.controller = "photos";
  var data = {};
  var tmp_base64 = Math.random().toString(36).substring(7);
  fs.readFile(req.files.photo.path, 'utf8', function (err, data) {
    require("fs").writeFile(tmp_base64, data, function(err) {
    });
    var base64Data = data.replace(/^data:image\/png;base64,/,"").replace(/^data:image\/jpeg;base64,/,"").replace(/^data:image\/jpg;base64,/,"").replace(/^data:image\/gif;base64,/,"");
    var dataBuffer = new Buffer(base64Data, 'base64');
    require("fs").writeFile(req.files.photo.path, dataBuffer, function(err) {
      data = {
        photo: req.files.photo,
        collection_id: req.body.collection_id,
        tags: req.body.tags
      };
      data['photo_sizes[medium_500]'] = '500x333';
      data['photo_sync_sizes[]'] = 'medium_500';
      ACS.Photos.create(data, function(e) {
        fs.unlink(tmp_base64, function (err) {
          if (err) throw err;
        });
        if(e.success && e.success === true){
          logger.info('photos#create.json: ' + JSON.stringify(e));
          res.send(e);
        }else{
          logger.debug('photos#create.json#Error: ' + JSON.stringify(e));
          req.session.flash = {msg:e.message, r:0};
          res.send(e);
        }
      }, req, res);
    });
  });
}

function _destroy(req, res) {
  req.session.controller = "photos";
  var data = {
    photo_id: req.params.id
  };
  ACS.Photos.remove(data, function(e) {
    if(e.success && e.success === true){
      logger.info('photos#destroy: ' + JSON.stringify(e));
      res.send(e);
    }else{
      logger.debug('Error: ' + JSON.stringify(e));
      res.send(e);
    }
  }, req, res);
}