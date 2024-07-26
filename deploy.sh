#!/bin/sh -v

rm -rf public
hugo

aliyun --profile default oss cp -f -r oss://web-www-nekocode-cn/ ./public/
