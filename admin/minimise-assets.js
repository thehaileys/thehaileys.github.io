var compressor = require('node-minify');
 
var cssDirSubPath = "..\\styles";
var cssBasePath = __dirname + "\\" + cssDirSubPath;
var jsDirSubPath = "..\\scripts";
var jsBasePath = __dirname + "\\" + jsDirSubPath;

compressor.minify({
    compressor: 'sqwish',
    input: cssBasePath + "\\" + 'site.css',
    output: cssBasePath + "\\" + 'site.min.css',
    callback: function(err, min) {
        if(err) {
          console.log(err);
        }
    }
  });

  compressor.minify({
    compressor: 'gcc',
    input: jsBasePath + "\\" + 'site.js',
    output: jsBasePath + "\\" + 'site.min.js',
    callback: function(err, min) {
        if(err) {
          console.log(err);
        }
    }
  });