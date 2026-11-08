FROM oven/bun:debian

# Config Bun
ENV PATH="~/.bun/bin:${PATH}"
RUN ln -s /usr/local/bin/bun /usr/local/bin/node

# Update packages
RUN if [ "debian" == "alpine" ] ; then apk update ; else apt-get update ; fi

# Install Git
RUN if [ "debian" == "alpine" ] ; then apk add git ; else apt-get install -y git ; fi

# Build tools for native modules (better-sqlite3 via node-gyp needs full Python)
RUN apt-get install -y --no-install-recommends python3 python3-setuptools make g++ \
    && rm -rf /var/lib/apt/lists/*

