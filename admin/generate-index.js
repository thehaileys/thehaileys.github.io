var fs = require('fs');

var createBackup = false;
var postsDirSubPath = "..\\posts\\v1";
var postsFullDir =  __dirname + "\\" + postsDirSubPath + "\\"; 
var indexFileName = "index.json"
var prettyPrint = true;

var indexFilePath = postsFullDir + indexFileName;

function getBackupTimestamp() {
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	if(month < 10) {
		month = "0" + month;
	} 
	var day = date.getDate();
	if(day < 10) {
		day = "0" + day;
	} 
	var hour = date.getHours();
	if(hour < 10) {
		hour = "0" + hour;
	} 
	var min = date.getMinutes();
	if(min < 10) {
		min = "0" + min;
	} 
	var sec = date.getSeconds();
	if(sec < 10) {
		sec = "0" + sec;
	} 
	var ms = date.getMilliseconds();

    return year + month + day + "." + hour + min + sec + "." + ms;
}

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

var isValidPostJson = function(filename) {
	if(filename.indexOf(indexFileName) > 0)
		return false;

	var extension = filename.substring(filename.length - 5, filename.length).toLowerCase();
	return extension == ".json"; 
}

var findPostFiles = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '\\' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          findPostFiles(file, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else if(isValidPostJson(file)) {
          results.push(file);
          next();
        } else {
          next();
        }
      });
    })();
  });
};

function bucketSort(a, key) {
    key = key || function(x) { return x };
    var len = a.length,
        buckets = [],
        i, j, b, d = 0;
    for (; d < 32; d += 4) {
        for (i = 16; i--;)
            buckets[i] = [];
        for (i = len; i--;)
            buckets[(key(a[i]) >> d) & 15].push(a[i]);
        for (b = 0; b < 16; b++)
            for (j = buckets[b].length; j--;)
                a[++i] = buckets[b][j];
    }
    return a;
};

function calculateTagStats(postIndex) {
	var tagsCounts = []
	for(var p=0;p<postIndex.length;p++){
		var nextPost = postIndex[p];
		if(nextPost.tags) {
			for(var t=0; t<nextPost.tags.length; t++) {
				if(tagsCounts[nextPost.tags[t]]){
					tagsCounts[nextPost.tags[t]]++;
				} else {
					tagsCounts[nextPost.tags[t]] = 1;
				}
			}
		}
	}
	var tagStats = [];
	var index = 0;
	for(var tag in tagsCounts){
		tagStats.push({"name":tag,
			"index":index++,
			"count":tagsCounts[tag]
		});
	}				
	bucketSort(tagStats, function(x) { return x.count; });
	var buckets = 10;
	var itemsPerBucket = tagStats.length / buckets;
	for(var b = 0; b < tagStats.length; b++){
		var bucket = Math.ceil((b+1)/itemsPerBucket);
		tagStats[b].bucket = bucket;
	}
	bucketSort(tagStats, function(x) { return x.index; });

	return tagStats;
};

function parseIsoDate(dateString) {
	return new Date(Date.parse(dateString));
};

function compareByIsoDateString(a,b){
  return parseIsoDate(b) - parseIsoDate(a);
}

function onIndexWritten(err) {
	if(err) {
		console.log(err);
	} else {
		console.log("Completed successfully.")
	}
}

function processPostFiles(err, imagesPaths) {
	if (err)
		throw err;

	console.log("Generating posts index...");	
	var indexData = {};
	indexData.posts = [];
	for(var i=0; i<imagesPaths.length; i++) {
		console.log("Found:" + imagesPaths[i]);
		var postDataContent = fs.readFileSync(imagesPaths[i]);
		var postData = JSON.parse(postDataContent);
		var postImages = postData.images;
		var post = {};
		post.id = postData.id;
		post.date = postData.date;
		if(postImages && postImages.fileNames && postImages.fileNames.length > 0) {
			post.coverImage = postImages.fileNames[0];
		} else {
			if(postData.title) {
				post.coverImageAlt = postData.title;
			} else if(postData.intro) {
				post.coverImageAlt = postData.intro.substring(0, 100);
			}
		}
		post.tags = postData.tags;
		indexData.posts.push(post);
	}

	indexData.posts.sort(function(a,b){ return compareByIsoDateString(a.date, b.date); });
	console.log("Total posts: ", indexData.posts.length);	

	console.log("Calculating tag stats...");	
	var tagStats = calculateTagStats(indexData.posts);
	indexData.tags = [];
	for(i =0; i<tagStats.length; i++) {
		indexData.tags.push({"name":tagStats[i].name,
			"bucket":tagStats[i].bucket
		});
	}
	console.log("Unique tags: ", indexData.tags.length);	

	console.log("Saving index to: " + indexFilePath);
	fs.writeFile(indexFilePath, JSON.stringify(indexData, null, prettyPrint ? 2 : null), onIndexWritten); 
}

function onReadyToGenerateIndex(err) {
	if(err)
		throw err;

	findPostFiles(postsFullDir, processPostFiles);
}

if(createBackup) {
	fs.exists(indexFilePath, function(exists) {
		if(!exists) {
			console.log("Skipping backup - existing index not found: " + indexFilePath);
			onReadyToGenerateIndex();
		} else {
			var timestamp = getBackupTimestamp();
			var backupIndexFilePath = postsFullDir + indexFileName + "." + timestamp + ".bak.json";
			console.log("Backing up existing index: " + indexFilePath);
			console.log("Creating back-up index: " + backupIndexFilePath);
			copyFile(indexFilePath, backupIndexFilePath, onReadyToGenerateIndex);
		}
	});
} else {
	console.log("Skipping backup." + indexFilePath);
	onReadyToGenerateIndex();
}