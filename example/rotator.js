'use strict';

var brick = require('../lib/brick');

brick.on('error', function (error) {
    throw error;
});

brick.on('init', function () {
    brick.setMotorEnabled(true, brick.MOTOR_PORT_A);
    brick.setMotorEnabled(true, brick.MOTOR_PORT_B);

    brick.setMotorPower(100, brick.MOTOR_PORT_A);
    brick.setMotorPower(-100, brick.MOTOR_PORT_B);

    setInterval(function () {
        brick.setMotorPower(-brick.getMotorPower(brick.MOTOR_PORT_A), brick.MOTOR_PORT_A);
        brick.setMotorPower(-brick.getMotorPower(brick.MOTOR_PORT_B), brick.MOTOR_PORT_B);
    }, 5000);
});

var lastTime;

brick.on('update', function () {
    var time = Date.now();

    if (!lastTime || (time - lastTime) >= 100) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);

        var powerA = brick.getMotorPower(brick.MOTOR_PORT_A);
        var powerB = brick.getMotorPower(brick.MOTOR_PORT_B);

        var positionA = brick.getMotorPosition(brick.MOTOR_PORT_A);
        var positionB = brick.getMotorPosition(brick.MOTOR_PORT_B);

        var speedA = brick.getMotorSpeed(brick.MOTOR_PORT_A).toFixed(2);
        var speedB = brick.getMotorSpeed(brick.MOTOR_PORT_B).toFixed(2);

        process.stdout.write(
            'a: ' + speedA + ' deg/sec (' + powerA + '%) (' + positionA + '), ' +
            'b: ' + speedB + ' deg/sec (' + powerB + '%) (' + positionB + ')'
        );

        lastTime = time;
    }
});

brick.init(3);
