#!/bin/bash

test -d public || mkdir -p public
test -d public/bootstrap || cp -r node_modules/bootstrap/dist public/bootstrap
test -d public/highlight.js || cp -r node_modules/highlight.js public
