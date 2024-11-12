#!/bin/sh -v

rm -rf dist
npm run build

pushd resume
rm -rf public
hugo
mv public ../dist/resume
popd

aliyun --profile default oss cp ./dist/ oss://web-nekocode-cn/ -f -r
aliyun --profile default cdn RefreshObjectCaches --ObjectType Directory --ObjectPath https://nekocode.cn/ 