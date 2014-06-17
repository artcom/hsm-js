/*globals require, console, exports */

var SM = require("../StateMachine.js");
var assert = require('assert');

// set up logging to console
SM.Logger.debug = console.log;

exports.testParallelStates = function testParallelStates() {

    // Numlock - this is a simple toggle
    var numLockOff = new SM.State("NumLockOff");
    var numLockOn = new SM.State("NumLockOn");
    
    numLockOn.handler.numlock = { next: numLockOff };
    numLockOff.handler.numlock = { next: numLockOn };
    var numLockMachine = new SM.StateMachine([numLockOff, numLockOn]);

    // CapsLock - also a simple toggle
    var capsLockOn = new SM.State("CapsLockOn");
    var capsLockOff = new SM.State("CapsLockOff");
    
    capsLockOn.handler.capslock = { next: capsLockOff };
    capsLockOff.handler.capslock = { next: capsLockOn };
    var capsLockMachine = new SM.StateMachine([capsLockOff, capsLockOn]);

    // Keyboard - can be plugged and unplugged. When plugged, it conatins two toggles: NumLock and CapsLock
    var keyboardOff = new SM.State("KeyboardOff");
    var keyboardOn = new SM.Parallel("KeyboardOn", [capsLockMachine, numLockMachine]);
    
    keyboardOff.handler.plug = { next: keyboardOn };
    keyboardOn.handler.unplug = { next: keyboardOff };
    var keyboardMachine = new SM.StateMachine([keyboardOff, keyboardOn]).setup();

    // starts unplugged
    assert.equal("KeyboardOff", keyboardMachine.state.id);
    
    // when plugged, initialize capslock and numlock to off
    keyboardMachine.handleEvent("plug");
    assert.equal("CapsLockOff", capsLockMachine.state.id);
    assert.equal("NumLockOff", numLockMachine.state.id);
    assert.equal("CapsLockOff", keyboardMachine.state.parallelStates[0].id);

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
};

