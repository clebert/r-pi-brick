# r-pi-brick

> A Node.js API for the [BrickPi](http://www.dexterindustries.com/BrickPi/).

[![license](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/clebert/r-pi-brick/master/LICENSE)
[![npm](http://img.shields.io/npm/v/r-pi-brick.svg?style=flat)](https://www.npmjs.org/package/r-pi-brick)
[![downloads](http://img.shields.io/npm/dm/r-pi-brick.svg?style=flat)](https://www.npmjs.org/package/r-pi-brick)

[![build](http://img.shields.io/travis/clebert/r-pi-brick/master.svg?style=flat)](https://travis-ci.org/clebert/r-pi-brick)
[![coverage](http://img.shields.io/coveralls/clebert/r-pi-brick/master.svg?style=flat)](https://coveralls.io/r/clebert/r-pi-brick)
[![code climate](http://img.shields.io/codeclimate/github/clebert/r-pi-brick.svg?style=flat)](https://codeclimate.com/github/clebert/r-pi-brick)
[![dependencies](http://img.shields.io/david/clebert/r-pi-brick.svg?style=flat)](https://david-dm.org/clebert/r-pi-brick#info=dependencies&view=table)
[![devDependencies](http://img.shields.io/david/dev/clebert/r-pi-brick.svg?style=flat)](https://david-dm.org/clebert/r-pi-brick#info=devDependencies&view=table)

## Getting Started

### Installation

```sh
npm install r-pi-brick --save
```

### Integration

```javascript
var brick = require('r-pi-brick');
```

## API

### Overview

- [brick.init([timeout])](#brickinittimeout)
- [brick.update([maxRetries])](#brickupdatemaxretries)
- [brick.isMotorEnabled(port)](#brickismotorenabledport)
- [brick.setMotorEnabled(enabled, port)](#bricksetmotorenabledenabled-port)
- [brick.getMotorPosition(port)](#brickgetmotorpositionport)
- [brick.getMotorPower(port)](#brickgetmotorpowerport)
- [brick.setMotorPower(power, port)](#bricksetmotorpowerpower-port)
- [brick.getMotorSpeed(port)](#brickgetmotorspeedport)
- [brick.MOTOR_PORT_A](#brickmotor_port_a)
- [brick.MOTOR_PORT_B](#brickmotor_port_b)
- [brick.MOTOR_PORT_C](#brickmotor_port_c)
- [brick.MOTOR_PORT_D](#brickmotor_port_d)

### brick.init([timeout])

Initializes the serial connection to the [BrickPi](http://www.dexterindustries.com/BrickPi/) and returns a promise.
The serial communication timeout has a default value of 10 ms.

```javascript
brick.init(10).then(function () {
    // ...
}).catch(handleError);
```

### brick.update([maxRetries])

Updates all brick values via the serial connection and returns a promise.
Retries the update if a serial communication timeout occurs.
The number of maximum retries has a default value of 2.
Throws an error if the number of maximum retries is exceeded.

You should call this method periodically with a delay of 10 ms.

```javascript
brick.update(2).then(function () {
    // ...
}).catch(handleError);
```

### brick.isMotorEnabled(port)

Returns the enabled flag of the motor plugged into the specified port.

```javascript
var enabledA = brick.isMotorEnabled(brick.MOTOR_PORT_A);
var enabledB = brick.isMotorEnabled(brick.MOTOR_PORT_B);

var enabledC = brick.isMotorEnabled(brick.MOTOR_PORT_C);
var enabledD = brick.isMotorEnabled(brick.MOTOR_PORT_D);
```

### brick.setMotorEnabled(enabled, port)

Sets the enabled flag of the motor plugged into the specified port.

```javascript
brick.setMotorEnabled(true, brick.MOTOR_PORT_A);
brick.setMotorEnabled(true, brick.MOTOR_PORT_B);

brick.setMotorEnabled(false, brick.MOTOR_PORT_C);
brick.setMotorEnabled(false, brick.MOTOR_PORT_D);
```

### brick.getMotorPosition(port)

Returns the position of the motor, in 0.5-degree increments, plugged into the specified port.
The position is an integer in the range of -1073741823 to 1073741823.
Divide by 2 to get degrees.

```javascript
var positionA = brick.getMotorPosition(brick.MOTOR_PORT_A);
var positionB = brick.getMotorPosition(brick.MOTOR_PORT_B);

var positionC = brick.getMotorPosition(brick.MOTOR_PORT_C);
var positionD = brick.getMotorPosition(brick.MOTOR_PORT_D);
```

### brick.getMotorPower(port)

Returns the power of the motor plugged into the specified port.
The power is an integer in the range of -100 to 100.

```javascript
var powerA = brick.getMotorPower(brick.MOTOR_PORT_A);
var powerB = brick.getMotorPower(brick.MOTOR_PORT_B);

var powerC = brick.getMotorPower(brick.MOTOR_PORT_C);
var powerD = brick.getMotorPower(brick.MOTOR_PORT_D);
```

### brick.setMotorPower(power, port)

Sets the power of the motor plugged into the specified port.
The power must be an integer in the range of -100 to 100.

```javascript
brick.setMotorPower(100, brick.MOTOR_PORT_A);
brick.setMotorPower(100, brick.MOTOR_PORT_B);

brick.setMotorPower(-100, brick.MOTOR_PORT_C);
brick.setMotorPower(-100, brick.MOTOR_PORT_D);
```

### brick.getMotorSpeed(port)

Returns the speed of the motor, in degrees per second, plugged into the specified port.

```javascript
var speedA = brick.getMotorSpeed(brick.MOTOR_PORT_A);
var speedB = brick.getMotorSpeed(brick.MOTOR_PORT_B);

var speedC = brick.getMotorSpeed(brick.MOTOR_PORT_C);
var speedD = brick.getMotorSpeed(brick.MOTOR_PORT_D);
```

### brick.MOTOR_PORT_A

This port should be used together with port B.

### brick.MOTOR_PORT_B

This port should be used together with port A.

### brick.MOTOR_PORT_C

This port should be used together with port D.

### brick.MOTOR_PORT_D

This port should be used together with port C.

## Example

```sh
node node_modules/r-pi-brick/example/rotator.js
```

## Running Tests

To run the test suite first install the development dependencies:

```sh
npm install
```

then run the tests:

```sh
npm test
```
