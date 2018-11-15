node admin\generate-index.js --path "..\\posts\\v1"
node admin\minimise-assets.js
node admin\generate-thumbnails.js --path "..\\images\\posts"

node admin\generate-index.js --path "..\\theweans\\posts\\v1"
node admin\generate-thumbnails.js --path "..\\theweans\\images\\posts"
