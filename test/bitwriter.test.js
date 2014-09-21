/* global describe, it */

'use strict';

var assert    = require('extended-assert');
var BitWriter = require('../lib/bitwriter').BitWriter;

describe('bitWriter', function () {
    describe('.writeValue()', function () {
        it('writes a 10-bit value to a 32-bit buffer', function () {
            var data = new Buffer([
                0xff,
                0x03,
                0x00,
                0x00
            ]);

            assert.strictEqual(data.readUInt32LE(0), 0x3ff);

            new BitWriter(data, 0).writeValue(0, 10);
            new BitWriter(data, 10).writeValue(0x3fffff, 22);

            assert.strictEqual(data.readUInt32LE(0), 0xfffffc00);

            new BitWriter(data, 0)
                .writeValue(0x3ff, 10)
                .writeValue(0, 22);

            assert.strictEqual(data.readUInt32LE(0), 0x3ff);
        });

        it('returns the bit writer instance', function () {
            var bitWriter = new BitWriter(new Buffer(0), 0);

            assert.strictEqual(bitWriter.writeValue(0, 0), bitWriter);
        });
    });
});
