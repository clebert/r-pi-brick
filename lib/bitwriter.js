/* jshint bitwise: false */

'use strict';

exports.BitWriter = function (data, bitOffset) {
    this.writeValue = function (value, bitLength) {
        for (var i = 0; i < bitLength; i += 1) {
            var bitMask    = (1 << ((bitOffset + i) % 8));
            var byteOffset = (bitOffset + i) >> 3;

            if (value & 1) {
                data[byteOffset] |= bitMask;
            } else {
                data[byteOffset] &= ~bitMask;
            }

            value = value >> 1;
        }

        bitOffset += bitLength;

        return this;
    };
};
