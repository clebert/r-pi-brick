/* global -Promise */

'use strict';

var Promise    = global.Promise || require('es6-promise').Promise;
var SerialPort = require('./serialport').SerialPort;
var ts         = require('typesystem');
var utils      = require('./utils');

var isPort = function (value) {
    return ts.isUInt(value) && value <= 3;
};

var isPower = function (value) {
    return ts.isInt(value) && value >= -100 && value <= 100;
};

var Motor = function () {
    this.enabled  = false;
    this.position = NaN;
    this.power    = 0;
    this.speed    = NaN;
};

var motors = [
    new Motor(),
    new Motor(),
    new Motor(),
    new Motor()
];

exports.MOTOR_PORT_A = 0;
exports.MOTOR_PORT_B = 1;
exports.MOTOR_PORT_C = 2;
exports.MOTOR_PORT_D = 3;

exports.isMotorEnabled = function (port) {
    return motors[ts.check(port, isPort)].enabled;
};

exports.setMotorEnabled = function (enabled, port) {
    motors[ts.check(port, isPort)].enabled = ts.check(enabled, ts.isBoolean);

    return exports;
};

exports.getMotorPosition = function (port) {
    return motors[ts.check(port, isPort)].position;
};

exports.getMotorPower = function (port) {
    return motors[ts.check(port, isPort)].power;
};

exports.setMotorPower = function (power, port) {
    motors[ts.check(port, isPort)].power = ts.check(power, isPower);

    return exports;
};

exports.getMotorSpeed = function (port) {
    return motors[ts.check(port, isPort)].speed;
};

var initialized;
var serialPort;

exports.init = function (timeout) {
    try {
        timeout = ts.check(timeout, ts.isUInt, 10);

        if (serialPort) {
            throw new Error('This method was already called.');
        }

        serialPort = new SerialPort(timeout);

        return serialPort.open().then(function () {
            initialized = true;
        });
    } catch (error) {
        return Promise.reject(error);
    }
};

var transmit = function (address, retries, maxRetries) {
    try {
        var motor1 = address === 1 ? motors[0] : motors[2];
        var motor2 = address === 1 ? motors[1] : motors[3];

        var data = utils.packData(utils.createData(motor1, motor2), address);

        return serialPort.write(data).then(serialPort.read).then(function (data) {
            if (data) {
                utils.updatePositions(motor1, motor2, data);

                var time = Date.now();

                utils.updateSpeed(motor1, time);
                utils.updateSpeed(motor2, time);
            } else if (retries === maxRetries) {
                throw new Error('Maximum number of retries exceeded.');
            } else {
                return transmit(address, retries + 1, maxRetries);
            }
        });
    } catch (error) {
        return Promise.reject(error);
    }
};

var inProgress;

exports.update = function (maxRetries) {
    try {
        maxRetries = ts.check(maxRetries, ts.isUInt, 2);

        if (!initialized) {
            throw new Error('Please initialize this module first.');
        }

        if (inProgress) {
            throw new Error('An update is already in progress.');
        }

        inProgress = true;

        return transmit(1, 0, maxRetries).then(function () {
            return transmit(2, 0, maxRetries);
        }).then(function () {
            inProgress = false;
        }).catch(function (error) {
            inProgress = false;

            return Promise.reject(error);
        });
    } catch (error) {
        return Promise.reject(error);
    }
};
