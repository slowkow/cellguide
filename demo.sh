#!/bin/bash
set -eoxu pipefail

# Download a small example dataset.
curl https://immunogenomics.io/downloads/Smillie2019-mini.tar.gz | tar xvz

# Build the Cell Browser HTML files.
cd Smillie2019-mini
cbBuild -o public_html

# Downlod the Cell Guide files.
curl -s https://codeload.github.com/slowkow/cellguide/tar.gz/master | tar xvz
 
# Overwrite the Cell Browser files: index.html js/ css/ ext/ img/
command cp -rf cellguide-master/www/* public_html/

# Start the web server
cbBuild -o public_html -p 8888

# Point your internet browser to:
echo -e "Point your web browser to:\n"
echo "http://localhost:8888/?ds=Smillie2019&gene=HMGB2"

