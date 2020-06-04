#!/bin/bash
set -u

# Make a temporary directory.
dir=$(mktemp -d -t cellguide-XXXXX)

# Download a small example dataset.
curl -s https://cells.ucsc.edu/downloads/samples/mini.tgz | tar xvz

# Build the Cell Browser HTML files.
cd mini
cbBuild -o $dir

# # Downlod the Cell Guide files.
# cd $dir
# curl -s https://codeload.github.com/slowkow/cellguide/tar.gz/1.0.0 | tar xvz
# 
# # Overwrite the Cell Browser files: index.html js/ css/ ext/ img/
# cp -r cellguide-1.0.0/html/* .

# Start the web server
cbBuild -o $dir -p 8888

