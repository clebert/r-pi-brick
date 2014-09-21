/* global describe, it */

'use strict';

var assert    = require('extended-assert');
var BitReader = require('../lib/bitreader').BitReader;
var BitWriter = require('../lib/bitwriter').BitWriter;
var ts        = require('typesystem');
var utils     = require('../lib/utils');

var bit = function (value) {
    return value ? 1 : 0;
};

var convert = function (power) {
    if (Math.abs(power) === 50) {
        return 127;
    }

    if (Math.abs(power) === 100) {
        return 255;
    }

    return 0;
};

var testData = function (enabled1, power1, enabled2, power2) {
    var motor1 = {
        enabled: enabled1,
        power: power1
    };

    var motor2 = {
        enabled: enabled2,
        power: power2
    };

    var data = [
        utils.createData(motor1, motor2),
        utils.createData(motor1, motor2)
    ];

    assert.notStrictEqual(data[0], data[1]);

    data.forEach(function (data) {
        assert.strictEqual(data.length, 4);

        var bitReader = new BitReader(data, 0);

        assert.strictEqual(bitReader.readValue(1), 1);
        assert.strictEqual(bitReader.readValue(1), 1);
        assert.strictEqual(bitReader.readValue(8), 0);

        assert.strictEqual(bitReader.readValue(1), bit(enabled1));
        assert.strictEqual(bitReader.readValue(1), bit(power1 < 0));
        assert.strictEqual(bitReader.readValue(8), convert(power1));

        assert.strictEqual(bitReader.readValue(1), bit(enabled2));
        assert.strictEqual(bitReader.readValue(1), bit(power2 < 0));
        assert.strictEqual(bitReader.readValue(8), convert(power2));

        assert.strictEqual(bitReader.readValue(2), 0);
    });
};

var testPositions = function (bitLength1, position1, bitLength2, position2) {
    var data = new Buffer(12);

    data.fill(0xff);

    new BitWriter(data, 24)
        .writeValue(bitLength1, 5)
        .writeValue(bitLength2, 5);

    if (bitLength1) {
        new BitWriter(data, 34)
            .writeValue(bit(position1 < 0), 1)
            .writeValue(Math.abs(position1), bitLength1 - 1);
    }

    if (bitLength2) {
        new BitWriter(data, 34 + bitLength1)
            .writeValue(bit(position2 < 0), 1)
            .writeValue(Math.abs(position2), bitLength2 - 1);
    }

    var motor1 = {};
    var motor2 = {};

    utils.updatePositions(motor1, motor2, data);

    assert.strictEqual(motor1.position, position1);
    assert.strictEqual(motor2.position, position2);
};

var testSpeed = function (speed, lastPosition, position, lastTime, time) {
    var motor = {
        lastPosition: lastPosition,
        position: position,
        lastTime: lastTime,
        time: time,
        speed: NaN
    };

    utils.updateSpeed(motor, time);

    if (ts.isNaN(speed)) {
        assert.strictEqual(ts.isNaN(motor.speed), true);
    } else {
        assert.strictEqual(motor.speed, speed);
    }

    if (ts.isNaN(position)) {
        assert.strictEqual(motor.lastTime, lastTime);
        assert.strictEqual(motor.lastPosition, lastPosition);
    } else {
        assert.strictEqual(motor.lastTime, time);
        assert.strictEqual(motor.lastPosition, position);
    }
};

describe('utils', function () {
    describe('.createData()', function () {
        it('returns a new buffer of 4-byte data', function () {
            testData(false, 0, false, 0);
            testData(false, 50, false, 50);
            testData(false, 100, false, 100);
            testData(false, -100, false, -100);

            testData(true, 0, true, 0);
            testData(true, 50, true, 50);
            testData(true, 100, true, 100);
            testData(true, -100, true, -100);

            testData(true, 50, false, 0);
            testData(true, 100, false, 0);
            testData(true, -100, false, 0);

            testData(false, 50, false, 0);
            testData(false, 100, false, 0);
            testData(false, -100, false, 0);

            testData(false, 0, true, 50);
            testData(false, 0, true, 100);
            testData(false, 0, true, -100);

            testData(false, 0, false, 50);
            testData(false, 0, false, 100);
            testData(false, 0, false, -100);
        });
    });

    describe('.packData()', function () {
        it('returns a new buffer of packed data', function () {
            var data = new Buffer([
                100,
                150,
                200
            ]);

            var packedData = [
                utils.packData(data, 2),
                utils.packData(data, 2)
            ];

            assert.notStrictEqual(packedData[0], packedData[1]);

            packedData.forEach(function (packedData) {
                assert.strictEqual(packedData[0], 2);
                assert.strictEqual(packedData[1], 199);
                assert.strictEqual(packedData[2], 3);
                assert.strictEqual(packedData[3], 100);
                assert.strictEqual(packedData[4], 150);
                assert.strictEqual(packedData[5], 200);
            });
        });
    });

    describe('.updatePositions()', function () {
        it('updates the position of two motors', function () {
            testPositions(0, 0, 0, 0);
            testPositions(0, 0, 5, 0xf);
            testPositions(0, 0, 31, 0x3fffffff);
            testPositions(0, 0, 31, -0x3fffffff);

            testPositions(5, 0xf, 0, 0);
            testPositions(5, 0xf, 5, 0xf);
            testPositions(5, 0xf, 31, 0x3fffffff);
            testPositions(5, 0xf, 31, -0x3fffffff);

            testPositions(31, 0x3fffffff, 0, 0);
            testPositions(31, 0x3fffffff, 5, 0xf);
            testPositions(31, 0x3fffffff, 31, 0x3fffffff);
            testPositions(31, 0x3fffffff, 31, -0x3fffffff);

            testPositions(31, -0x3fffffff, 0, 0);
            testPositions(31, -0x3fffffff, 5, 0xf);
            testPositions(31, -0x3fffffff, 31, 0x3fffffff);
            testPositions(31, -0x3fffffff, 31, -0x3fffffff);
        });
    });

    describe('.updateSpeed()', function () {
        it('updates the speed of one motor', function () {
            testSpeed(NaN, 0, NaN, 1, 2);
            testSpeed(NaN, NaN, 0, 1, 2);

            [
                500,
                1000,
                2000
            ].forEach(function (time) {
                var factor = 1000 / time;

                testSpeed(-125 * factor, -500, -750, 0, time);
                testSpeed(0 * factor, -500, -500, 0, time);
                testSpeed(125 * factor, -500, -250, 0, time);
                testSpeed(250 * factor, -500, 0, 0, time);
                testSpeed(500 * factor, -500, 500, 0, time);

                testSpeed(-250 * factor, 0, -500, 0, time);
                testSpeed(0 * factor, 0, 0, 0, time);
                testSpeed(250 * factor, 0, 500, 0, time);

                testSpeed(-500 * factor, 500, -500, 0, time);
                testSpeed(-250 * factor, 500, 0, 0, time);
                testSpeed(-125 * factor, 500, 250, 0, time);
                testSpeed(0 * factor, 500, 500, 0, time);
                testSpeed(125 * factor, 500, 750, 0, time);
            });
        });
    });
});
