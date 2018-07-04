var fs = require('fs');
var gm = require('gm');

var forceOverwrite = false;  // If changing logic and want to regenerate all then set to true
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

var resizeIfNotAlreadyExists = function(source, dest, newWidth) {
	fs.exists(dest, function(exists) {
		if(!exists || forceOverwrite) {
			checkOrientationAndResizeImage(source, dest, newWidth);
		} else {
      console.log("Skipping (thumbnail already exists): " + source);      
    }
	});
}

var checkOrientationAndResizeImage = function(source, dest, newWidth) {
  gm(source)
    .size(function (err, size) {
      if (err) { console.log(err); }
      resizeImage(source, dest, newWidth, size);      
    });
}

var resizeImage = function(source, dest, newWidth, size) {
  var newHeight = Math.round(newWidth / 4) * 3;  // force aspect ratio 4x3
  if(size.width < size.height) {
    var cropHeight = size.width * 0.75;
    var cropY = (size.height - cropHeight) / 2
    gm(source)
      .crop(size.width, cropHeight, 0, cropY)   // Crop portrain images to reduce squashing
      .resize(newWidth, newHeight, "!")
      .write(dest, function (err) { if (err) { console.log(err); } });
  } else {
    gm(source)
      .resize(newWidth, newHeight, "!")
      .write(dest, function (err) { if (err) { console.log(err); } });
  }
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

