/* global describe, it */

'use strict';

var assert    = require('extended-assert');
var BitReader = require('../lib/bitreader').BitReader;

describe('bitReader', function () {
    describe('.readValue()', function () {
        it('returns a 10-bit value readed from the beginning of a 32-bit buffer', function () {
            var data = new Buffer([
                0xff,
                0x03,
                0x00,
                0x00
            ]);

            assert.strictEqual(new BitReader(data, 0).readValue(10), 0x3ff);
            assert.strictEqual(new BitReader(data, 10).readValue(10), 0);
            assert.strictEqual(new BitReader(data, 20).readValue(10), 0);

            var bitReader = new BitReader(data, 0);

            assert.strictEqual(bitReader.readValue(10), 0x3ff);
            assert.strictEqual(bitReader.readValue(10), 0);
            assert.strictEqual(bitReader.readValue(10), 0);
        });

        it('returns a 10-bit value readed from the middle of a 32-bit buffer', function () {
            var data = new Buffer([
                0x00,
                0xfc,
                0x0f,
                0x00
            ]);

            assert.strictEqual(new BitReader(data, 0).readValue(10), 0);
            assert.strictEqual(new BitReader(data, 10).readValue(10), 0x3ff);
            assert.strictEqual(new BitReader(data, 20).readValue(10), 0);

            var bitReader = new BitReader(data, 0);

            assert.strictEqual(bitReader.readValue(10), 0);
            assert.strictEqual(bitReader.readValue(10), 0x3ff);
            assert.strictEqual(bitReader.readValue(10), 0);
        });

        it('returns a 10-bit value readed from the end of a 32-bit buffer', function () {
            var data = new Buffer([
                0x00,
                0x00,
                0xf0,
                0x3f
            ]);

            assert.strictEqual(new BitReader(data, 0).readValue(10), 0);
            assert.strictEqual(new BitReader(data, 10).readValue(10), 0);
            assert.strictEqual(new BitReader(data, 20).readValue(10), 0x3ff);

            var bitReader = new BitReader(data, 0);

            assert.strictEqual(bitReader.readValue(10), 0);
            assert.strictEqual(bitReader.readValue(10), 0);
            assert.strictEqual(bitReader.readValue(10), 0x3ff);
        });

        it('returns a 31-bit value readed from the beginning of a 64-bit buffer', function () {
            var data = new Buffer([
                0xff,
                0xff,
                0xff,
                0x7f,
                0x00,
                0x00,
                0x00,
                0x00
            ]);

            assert.strictEqual(new BitReader(data, 0).readValue(31), 0x7fffffff);
        });

        it('returns a 31-bit value readed from the end of a 64-bit buffer', function () {
            var data = new Buffer([
                0x00,
                0x00,
                0x00,
                0x00,
                0xff,
                0xff,
                0xff,
                0x7f
            ]);

            assert.strictEqual(new BitReader(data, 32).readValue(31), 0x7fffffff);
        });
    });
});
