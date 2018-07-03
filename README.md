# thehaileys.github.io

Root Github pages site https://thehaileys.github.io

## Local testing

Use node http server to browse the site locally (and avoid cross-origin issues loading JSON via file protocol).

* Install (global package): `npm install -g http-server`
* Start http server (command line from from site route): `http-server`
* Browse (based on output from starting server): `http://127.0.0.1:8080/`

## File Structure

### Directories

admin/
  admin-script-1.js

images/
  YYYY/
    MM/
      post-image-1.jpg
      post-image-n.jpg
  website-styling-imageX.png

posts/
   vX/
     index.json
     YYYY/
       MM/
         post-id-1.json
	     post-id-n.json

scripts/
  site-script-1.js

styles/
  style1.css

### Details

File `index.json` is generated via script (see below) based on discovered posts.
Thumbnail versions of images are generated via script (see below) based on discovered image files. 

## CDN Details

Lightbox (including images and stlying) https://cdnjs.com/libraries/lightbox2

## Admin Scripts

### General

To run a script:
* Ensure node_modules dir is in place based on `package.json` (run from `\admin` dir): `npm install` 
* node my-script.js

### generate-index.js

Variable "_postsDirSubPath_" specifies a relative path (from this script) to the _posts_ directory to be processed. **This also defines where _index.json_ will be placed. Sub-folders containing individual post JSON files should be under two subfolders, first year and then month and be named based on their ID. For example:
* For a post with ID "my-great-post" from Janurary 2010 we'd epxtect "[postsDir]/2010/01/my-great-post.json"

A summary post index and tag summary are produced in the JSON file. Posts are ordered by date. Tags are ordered by occurrence in the posts and assigned a relative weighting bucket based on number of occurrences.

### generate-thumbnails.js

Variable `imagesDirSubPath` specifies a relative path (from this script) to the _image_ directories to be processed.

Ensure pre-reqs installed:
* GraphicsMagic program: http://www.graphicsmagick.org/download.html

Depends on Modules:
* gm - GraphicsMagic to perform the resizing and write out the resultant image

### YouTube Thumbnails

For posts with no images the thumbnail is used for the Archive page.
You can download the thumbnail for a YouTube video from: https://img.youtube.com/vi/VIDEO_ID_HERE/hqdefault.jpg
Save as VIDEO_ID_HERE.jpg and generate the thumbnails based on that.