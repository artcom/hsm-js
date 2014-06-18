/*globals module, require, console, exports */

if (typeof module === "object" && typeof require === "function") {
    var buster = require("buster");
    var HSM = require("../StateMachine.js");
    // set up logging to console
    HSM.Logger.debug = console.log;
}

var assert = buster.referee.assert;

buster.testCase("testToggle", {
    setUp: function() {
        var _ = this;

        // Numlock - this is a simple toggle
        var numLockOff = new HSM.State("NumLockOff");
        var numLockOn = new HSM.State("NumLockOn");
    
        numLockOn.handler.numlock = { next: numLockOff };
        numLockOff.handler.numlock = { next: numLockOn };
        _.numLockMachine = new HSM.StateMachine([numLockOff, numLockOn]);

        // CapsLock - also a simple toggle
        var capsLockOn = new HSM.State("CapsLockOn");
        var capsLockOff = new HSM.State("CapsLockOff");
    
        capsLockOn.handler.capslock = { next: capsLockOff };
        capsLockOff.handler.capslock = { next: capsLockOn };
        _.capsLockMachine = new HSM.StateMachine([capsLockOff, capsLockOn]);

        // Keyboard - can be plugged and unplugged. When plugged, it conatins two toggles: NumLock and CapsLock
        var keyboardOff = new HSM.State("KeyboardOff");
        var keyboardOn = new HSM.Parallel("KeyboardOn", [_.capsLockMachine, _.numLockMachine]);
    
        keyboardOff.handler.plug = { next: keyboardOn };
        keyboardOn.handler.unplug = { next: keyboardOff };
        _.keyboardMachine = new HSM.StateMachine([keyboardOff, keyboardOn]).setup();
    },
    "Parallel Test": function() {
        var _ = this;
        // starts unplugged
        assert.equals("KeyboardOff", _.keyboardMachine.state.id);
    
        // when plugged, initialize capslock and numlock to off
        _.keyboardMachine.handleEvent("plug");
        assert.equals("CapsLockOff", _.capsLockMachine.state.id);
        assert.equals("NumLockOff", _.numLockMachine.state.id);
        assert.equals("CapsLockOff", _.keyboardMachine.state.parallelStates[0].id);

        assert.equals("KeyboardOn/(CapsLockOff|NumLockOff)", _.keyboardMachine.toString());
    
        // check capslock toggle
        _.keyboardMachine.handleEvent("capslock");
        assert.equals("KeyboardOn/(CapsLockOn|NumLockOff)", _.keyboardMachine.toString());
    
        _.keyboardMachine.handleEvent("capslock");
        assert.equals("KeyboardOn/(CapsLockOff|NumLockOff)", _.keyboardMachine.toString());

        // check numlock toggle
        _.keyboardMachine.handleEvent("numlock");
        assert.equals("KeyboardOn/(CapsLockOff|NumLockOn)", _.keyboardMachine.toString());

        // now unplug keyboard 
        _.keyboardMachine.handleEvent("unplug");
        assert.equals("KeyboardOff", _.keyboardMachine.toString());

        // pressing capslock while unplugged does nothing
        _.keyboardMachine.handleEvent("capslock");
        assert.equals("KeyboardOff", _.keyboardMachine.toString());

        // plug the keyboard back in and check whether the toggles are back at their initial states 
        _.keyboardMachine.handleEvent("plug");
        assert.equals("KeyboardOn/(CapsLockOff|NumLockOff)", _.keyboardMachine.toString());
    }
});

