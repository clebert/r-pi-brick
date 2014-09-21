/* globals Promise: true */

'use strict';

var Promise    = global.Promise || require('es6-promise').Promise;
var SerialPort = require('serialport').SerialPort;

exports.SerialPort = function (timeout) {
    var serialPort = new SerialPort('/dev/ttyAMA0', {
        baudrate: 500000
    }, false);

    this.openAsync = function () {
        return new Promise(function (fulfill, reject) {
            serialPort.open(function (error) {
                if (error) {
                    reject(error);
                } else {
                    fulfill();
                }
            });
        });
    };

    this.readAsync = function () {
        return new Promise(function (fulfill, reject) {
            var dataListener;
            var errorListener;
            var timeoutId;

            dataListener = function (data) {
                serialPort.removeListener('error', errorListener);

                clearTimeout(timeoutId);

                fulfill(data);
            };

            errorListener = function (error) {
                serialPort.removeListener('data', dataListener);

                clearTimeout(timeoutId);

                reject(error);
            };

            timeoutId = setTimeout(function () {
                serialPort.removeListener('data', dataListener);
                serialPort.removeListener('error', errorListener);

                fulfill(null);
            }, timeout);

            serialPort.once('data', dataListener);
            serialPort.once('error', errorListener);
        });
    };

    this.writeAsync = function (data) {
        return new Promise(function (fulfill, reject) {
            serialPort.write(data, function (error) {
                if (error) {
                    reject(error);
                } else {
                    fulfill();
                }
            });
        }).then(function () {
            return new Promise(function (fulfill, reject) {
                serialPort.drain(function (error) {
                    if (error) {
                        reject(error);
                    } else {
                        fulfill();
                    }
                });
            });
        });
    };
};
