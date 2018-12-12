"use strict";

import loudness = require('loudness');
let Service, Characteristic;

module.exports = function(homebridge) {
    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-pc-volume", "ComputerSpeakers", ComputerSpeakers);
}

class ComputerSpeakers {

    private speakerService: any;
    private fanService: any;
    private lightService: any;

    constructor(log, config, api) {
        const name = config["name"];
        const services = config["services"] || ["lightbulb"];

        if (services.indexOf("speaker") > -1) {
            this.speakerService = new Service.Speaker(name);

            this.speakerService
                .getCharacteristic(Characteristic.Mute)
                .on('set', this.setMuted.bind(this))
                .on('get', this.getMuted.bind(this));

            this.speakerService
                .addCharacteristic(new Characteristic.Volume())
                .on('set', this.setVolume.bind(this))
                .on('get', this.getVolume.bind(this));
        }

        if (services.indexOf("fan") > -1) {
            this.fanService = new Service.Fan(name);

            this.fanService
                .getCharacteristic(Characteristic.On)
                .on('set', this.setPowerState.bind(this))
                .on('get', this.getPowerState.bind(this));

            this.fanService
                .addCharacteristic(new Characteristic.RotationSpeed())
                .on('set', this.setRotationSpeed.bind(this))
                .on('get', this.getRotationSpeed.bind(this));
        }

        if (services.indexOf("lightbulb") > -1) {
            this.lightService = new Service.Lightbulb(name);

            this.lightService
                .getCharacteristic(Characteristic.On)
                .on('set', this.setPowerState.bind(this))
                .on('get', this.getPowerState.bind(this));

            this.lightService
                .addCharacteristic(new Characteristic.Brightness())
                .on('set', this.setBrightness.bind(this))
                .on('get', this.getBrightness.bind(this));
        }
    }

    public getServices() {
        return [this.speakerService, this.lightService, this.fanService].filter((service) => !!service);
    }

    // Speaker

    private setMuted(muted, callback) {
        loudness.setMuted(muted).then(callback);
    }

    private getMuted(callback) {
        loudness.getMuted().then((muted) => {
            callback(null, muted);
        }).catch((error) => {
            callback(error, null);
        });
    }

    private setVolume(volume, callback) {
        loudness.setVolume(volume).then(callback);
    }

    private getVolume(callback) {
        loudness.getVolume().then((volume) => {
            callback(null, volume);
        }).catch((error) =>  {
            callback(error, null);
        });
    }

    // Shared

    private setPowerState(powerState, callback) {
        const muted = !powerState;
        this.setMuted(muted, callback);
    }

    private getPowerState(callback) {
        this.getMuted((error, muted) => {
            if (error !== null) {
                callback(error, null);
            } else {
                callback(null, !muted);
            }
        });
    }

    // Fan

    private setRotationSpeed(volume, callback) {
        this.setVolume(volume, callback);
    }

    private getRotationSpeed(callback) {
        this.getVolume(callback);
    }

    // Lightbulb

    private setBrightness(volume, callback) {
        this.setVolume(volume, callback);
    }

    private getBrightness(callback) {
        this.getVolume(callback);
    }
}
