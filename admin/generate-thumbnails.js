var fs = require('fs');
var gm = require('gm');

// var forceOverwrite = false;
var forceOverwrite = true;
var imagesDirSubPath = "..\\images\\posts";
var sourceBasePath = __dirname + "\\" + imagesDirSubPath;
var newSizes = [
  {name: "thumb", size: 150},
  {name: "small", size: 500}
]

var isSupportedImage = function(filename) {
  for(var s=0; s<newSizes.length; s++) {
    if(filename.indexOf("." + newSizes[s].name) != -1) {
      return false; // making thumbnails of thumbnails is not supported
    }
  }
	var extension = filename.substring(filename.length - 4, filename.length).toLowerCase();
	return extension == ".jpg" || extension == ".jpeg" || extension == ".png"; 
}

var findImageFiles = function(dir, done) {
  var results = [];
  console.log("Scanning for image files: ", dir)
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '\\' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          findImageFiles(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else if(isSupportedImage(file)) {
          results.push(file);
          next();
        } else {
          next();
        }
      });
    })();
  });
};

var buildTargetFilename = function(filename, sizeName) {
	var extensionIndex = filename.lastIndexOf(".");
	return filename.substring(0,extensionIndex+1) + sizeName + filename.substring(extensionIndex, filename.length);
}

var resizeIfNotAlreadyExists = function(source, dest, size) {
	fs.exists(dest, function(exists) {
		if(!exists || forceOverwrite) {
			console.log("Resizing (" + size + "px): " + source);
      console.log(" -> " + dest);
      var height = Math.round(size / 4) * 3;  // force aspect ratio 4x3
			gm(source).resize(size, height, "!").write(dest, function (err) { if (err) { console.log(err); } });
		} else {
      console.log("Skipping (thumbnail already exists): " + source);      
    }
	});
}

findImageFiles(sourceBasePath, function(err, imagesPaths) {
	if (err) throw err;
	for(var i=0; i<imagesPaths.length; i++) {
    var nextImage = imagesPaths[i];
    for(var s=0; s<newSizes.length; s++) {
      if(forceOverwrite || nextImage.indexOf("." + newSizes[s].name) == -1) {
        var newImage = buildTargetFilename(imagesPaths[i], newSizes[s].name);
        resizeIfNotAlreadyExists(nextImage, newImage, newSizes[s].size);
      }
    }
	}	
});

