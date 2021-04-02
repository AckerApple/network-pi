# network-pi
Acker testing platform for pi controlled over the network

### Reinstall

```
nvm install 10.13.0 && nvm use 10.13.0
rm -rf node_modules && rm -f package-lock.json && npm install node-wiring-pi && npm install && npm run start:server:pi
```

### PreInstall

```
npm install --global --production windows-build-tools
npm install node-wiring-pi
```

### Install

```
nvm install 8.10.0 && nvm use 8.10.0 && npm install wiringpi-node && npm install
```

You may need to install `node-wiring-pi` manually

> The original package, wiringpi-node, is outdated and no longer recommended