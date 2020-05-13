#!/bin/sh -v

rm -rf dist
npm run build

docker build -t nekocode/nekocode.cn:latest .