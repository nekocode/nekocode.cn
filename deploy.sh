#!/bin/sh -v

rm -rf dist
npm run build

// remove sounds
rm -rf dist/assets/sounds

pushd resume
rm -rf public
hugo
mv public ../dist/resume
popd

aliyun --profile default oss cp -f -r oss://web-nekocode-cn/ ./dist/
aliyun --profile default cdn RefreshObjectCaches --ObjectType Directory --ObjectPath https://nekocode.cn/ 