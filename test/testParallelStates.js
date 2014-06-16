var SM = require("../StateMachine.js");
var assert = require('assert');

// set up logging to console
SM.Logger.debug = console.log;

exports['testParallelStates'] = function testParallelStates() {

    // Numlock
    var numLockOn = new SM.State("NumLockOn");
    numLockOn.handler.numlock = function(theEvent) {
        return "NumLockOff";
    };

    var numLockOff = new SM.State("NumLockOff");
    numLockOff.handler.numlock = function(theEvent) {
        return "NumLockOn";
    };
    var numLockMachine = new SM.StateMachine(numLockOff, numLockOn);

    // CapsLock
    var capsLockOn = new SM.State("CapsLockOn");
    capsLockOn.handler.capslock = function(theEvent) {
        return "CapsLockOff";
    };

    var capsLockOff = new SM.State("CapsLockOff");
    capsLockOff.handler.capslock = function(theEvent) {
        return "CapsLockOn";
    };
    var capsLockMachine = new SM.StateMachine(capsLockOff, capsLockOn);

    // Keyboard
    var keyboardOff = new SM.State("KeyboardOff");
    keyboardOff.handler.plug = function(theEvent) {
        return "KeyboardOn";
    };
    var keyboardOn = new SM.Parallel("KeyboardOn", capsLockMachine, numLockMachine);
    keyboardOn.handler.unplug = function(theEvent) {
        return "KeyboardOff";
    };

    var keyboardMachine = new SM.StateMachine([keyboardOff, keyboardOn]).setup();

    assert.equal("KeyboardOff", keyboardMachine.toString());
    
    keyboardMachine.handleEvent("plug");
    assert.equal("KeyboardOn/(CapsLockOff|NumLockOff)", keyboardMachine.toString());
    
    keyboardMachine.handleEvent("capslock");
    assert.equal("KeyboardOn/(CapsLockOn|NumLockOff)", keyboardMachine.toString());
    
    keyboardMachine.handleEvent("capslock");
    assert.equal("KeyboardOn/(CapsLockOff|NumLockOff)", keyboardMachine.toString());
}

