#!/bin/sh

basedir=`dirname "$0"`
$basedir/bin/node --harmony $basedir/index.js & wait
