# network-pi
Acker testing platform for pi controlled over the network

### PreInstall

Do you need nvm as you need to use older versions of Node at this time
```
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash

source ~/.profile

nvm install 10.13.0 && nvm use 10.13.0
```

GPIO pin controller
```
sudo apt-get install wiringpi

npm install node-wiring-pi
```

Optional sometimes helpful install
```
npm install --global --production windows-build-tools
```

Ensure node is accessible to sudo via `sudo node`. If not use the following commands:
```
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/node" "/usr/local/bin/node"
sudo ln -s "$NVM_DIR/versions/node/$(nvm version)/bin/npm" "/usr/local/bin/npm"
```

### Install

```
npm install ws git+https://github.com/ackerapple/network-pi.git
```

You may need to install `node-wiring-pi` manually

> The original package, wiringpi-node, is outdated and no longer recommended

### Start

```
npm run start
```

Bluetooth features require the sudo command

```
sudo npm run start
```

### Restart

If you encounter error that ports are already in use:
```
killall -9 npm
killall -9 node
```

### Reinstall

```
nvm install 10.13.0 && nvm use 10.13.0
rm -rf node_modules && rm -f package-lock.json && npm install node-wiring-pi && npm install && npm run start:server:pi
```

### Wifi

```sh
sudo raspi-config
```

Edit wifi within `sudo nano /etc/wpa_supplicant/wpa_supplicant.conf`

Example wifi entry
```
network={
    ssid="wifi name"
    psk="wifi password"
}
```