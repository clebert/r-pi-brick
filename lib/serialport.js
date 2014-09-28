/* global -Promise */

'use strict';

var denodeify  = require('promise-denodeify');
var Promise    = global.Promise || require('es6-promise').Promise;
var SerialPort = require('serialport').SerialPort;

exports.SerialPort = function (timeout) {
    var serialPort = new SerialPort('/dev/ttyAMA0', {
        baudrate: 500000
    }, false);

    this.open = denodeify(serialPort.open.bind(serialPort), Promise);

    this.read = function () {
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

    var drain = denodeify(serialPort.drain.bind(serialPort), Promise);
    var write = denodeify(serialPort.write.bind(serialPort), Promise);

    this.write = function (data) {
        return write(data).then(drain);
    };
};
