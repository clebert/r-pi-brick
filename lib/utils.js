'use strict';

var BitReader = require('./bitreader').BitReader;
var BitWriter = require('./bitwriter').BitWriter;
var ts        = require('typesystem');

var bit = function (value) {
    return value ? 1 : 0;
};

exports.createData = function (motor1, motor2) {
    var result = new Buffer(4);

    new BitWriter(result, 0)
        .writeValue(1, 1)
        .writeValue(1, 1)
        .writeValue(0, 8)
        .writeValue(bit(motor1.enabled), 1)
        .writeValue(bit(motor1.power < 0), 1)
        .writeValue(Math.abs(Math.floor((motor1.power / 100) * 255)), 8)
        .writeValue(bit(motor2.enabled), 1)
        .writeValue(bit(motor2.power < 0), 1)
        .writeValue(Math.abs(Math.floor((motor2.power / 100) * 255)), 8)
        .writeValue(0, 2);

    return result;
};

var createChecksum = function (data, address) {
    var sum = 0;

    for (var i = 0; i < data.length; i += 1) {
        sum += data[i];
    }

    return (address + data.length + sum) % 256;
};

exports.packData = function (data, address) {
    var result = new Buffer(data.length + 3);

    result[0] = address;
    result[1] = createChecksum(data, address);
    result[2] = data.length;

    data.copy(result, 3);

    return result;
};

var updatePosition = function (motor, bitReader, bitLength) {
    if (bitLength) {
        var negative = bitReader.readValue(1);
        var power    = bitReader.readValue(bitLength - 1);

        motor.position = negative ? -power : power;
    } else {
        motor.position = 0;
    }
};

exports.updatePositions = function (motor1, motor2, data) {
    var bitReader = new BitReader(data, 24);

    var bitLength1 = bitReader.readValue(5);
    var bitLength2 = bitReader.readValue(5);

    updatePosition(motor1, bitReader, bitLength1);
    updatePosition(motor2, bitReader, bitLength2);
};

exports.updateSpeed = function (motor, time) {
    if (ts.isInt(motor.lastPosition)) {
        var deltaPosition = motor.position - motor.lastPosition;
        var deltaTime     = time - motor.lastTime;

        motor.speed = (deltaPosition * (1000 / deltaTime)) / 2;
    }

    if (ts.isInt(motor.position)) {
        motor.lastPosition = motor.position;
        motor.lastTime     = time;
    }
};
