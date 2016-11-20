# ProPresenter stage display #

[![Build Status](https://travis-ci.org/jswetzen/ppstagedisplay.svg?branch=master)](https://travis-ci.org/jswetzen/ppstagedisplay)

The iPhone stage display client didn't work well for us; it disconnects and cannot be managed remotely.
This is a node.js implementation based on reverse engineering of the protocol. It uses Bonjour to discover an active ProPresenter instance (where remote stage display is enabled) and connects to the first one found.

Installed on a Raspberry Pi, this should be a drop-in replacement for the iPhone app. Plug in HDMI and USB, it boots up, finds ProPresenter, connects and you have a stage display!

## Installing and running (Mac) ##
Make sure you have the latest node.js version installed, then `cd` to ppstagedisplay and install the dependencies:

    npm install

Start the server with:

    node index.js

Now you can open the stage display in a browser on `http://localhost:9000`.

## Raspberry Pi installation ##
Installing on a Raspberry Pi is a bit tricky, but it works well once it's done. Instructions will be added later on.
