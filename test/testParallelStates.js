var SM = require("../StateMachine.js");
var assert = require('assert');

// set up logging to console
SM.Logger.debug = console.log;

exports['testParallelStates'] = function testParallelStates() {

    // Numlock - this is a simple toggle
    var numLockOn = new SM.State("NumLockOn");
    numLockOn.handler.numlock = function(theEvent) {
        return "NumLockOff";
    };

    var numLockOff = new SM.State("NumLockOff");
    numLockOff.handler.numlock = function(theEvent) {
        return "NumLockOn";
    };
    var numLockMachine = new SM.StateMachine(numLockOff, numLockOn);

    // CapsLock - also a simple toggle
    var capsLockOn = new SM.State("CapsLockOn");
    capsLockOn.handler.capslock = function(theEvent) {
        return "CapsLockOff";
    };

    var capsLockOff = new SM.State("CapsLockOff");
    capsLockOff.handler.capslock = function(theEvent) {
        return "CapsLockOn";
    };
    var capsLockMachine = new SM.StateMachine(capsLockOff, capsLockOn);

    // Keyboard - can be plugged and unplugged. When plugged, it conatins two toggles: NumLock and CapsLock
    var keyboardOff = new SM.State("KeyboardOff");
    keyboardOff.handler.plug = function(theEvent) {
        return "KeyboardOn";
    };
    var keyboardOn = new SM.Parallel("KeyboardOn", capsLockMachine, numLockMachine);
    keyboardOn.handler.unplug = function(theEvent) {
        return "KeyboardOff";
    };

    var keyboardMachine = new SM.StateMachine([keyboardOff, keyboardOn]).setup();

    // starts unplugged
    assert.equal("KeyboardOff", keyboardMachine.toString());
    
    // when plugged, initialize capslock and numlock to off
    keyboardMachine.handleEvent("plug");
    assert.equal("KeyboardOn/(CapsLockOff|NumLockOff)", keyboardMachine.toString());
    
    // check capslock toggle
    keyboardMachine.handleEvent("capslock");
    assert.equal("KeyboardOn/(CapsLockOn|NumLockOff)", keyboardMachine.toString());
    
    keyboardMachine.handleEvent("capslock");
    assert.equal("KeyboardOn/(CapsLockOff|NumLockOff)", keyboardMachine.toString());

    // check numlock toggle
    keyboardMachine.handleEvent("numlock");
    assert.equal("KeyboardOn/(CapsLockOff|NumLockOn)", keyboardMachine.toString());
    
    // now unplug keyboard 
    keyboardMachine.handleEvent("unplug");
    assert.equal("KeyboardOff", keyboardMachine.toString());
    
    // pressing capslock while unplugged does nothing
    keyboardMachine.handleEvent("capslock");
    assert.equal("KeyboardOff", keyboardMachine.toString());

    // plug the keyboard back in and check whether the toggles are back at their initial states 
    keyboardMachine.handleEvent("plug");
    assert.equal("KeyboardOn/(CapsLockOff|NumLockOff)", keyboardMachine.toString());
}

