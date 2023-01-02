npx webpack --config webpack.production.js

[ -d "../build" ] && rm -rf ../build

cp -r dist/ ../build