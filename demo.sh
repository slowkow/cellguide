#!/bin/bash
set -eoxu pipefail

# Download a small example dataset.
curl http://cells.ucsc.edu/downloads/samples/mini.tgz | tar xvz

# Build the Cell Browser HTML files.
cd mini
cbBuild -o public_html

# # Downlod the Cell Guide files.
# cd $dir
# curl -s https://codeload.github.com/slowkow/cellguide/tar.gz/1.0.0 | tar xvz
# 
# # Overwrite the Cell Browser files: index.html js/ css/ ext/ img/
# cp -r cellguide-1.0.0/html/* .

# Start the web server
cbBuild -o public_html -p 8888

