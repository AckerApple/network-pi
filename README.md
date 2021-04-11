# network-pi
Acker testing platform for pi controlled over the network

### PreInstall

```
npm install --global --production windows-build-tools
npm install node-wiring-pi
```

Ensure node is accessible to sudo via `sudo node`. If not use the following commands:
```
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/node" "/usr/local/bin/node"
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/npm" "/usr/local/bin/npm"
```

### Install

```
nvm install 10.13.0 && nvm use 10.13.0
```

```
npm install node-wiring-pi && npm install
```

You may need to install `node-wiring-pi` manually

> The original package, wiringpi-node, is outdated and no longer recommended


### Reinstall

```
nvm install 10.13.0 && nvm use 10.13.0
rm -rf node_modules && rm -f package-lock.json && npm install node-wiring-pi && npm install && npm run start:server:pi
```
