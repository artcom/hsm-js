/*globals require, console, exports */

var SM = require("../StateMachine.js");
var assert = require('assert');

// set up logging to console
SM.Logger.debug = console.log;

exports.testSubStates = function testSubStates() {
    // Sub State Machine
    var quietState = new SM.State("Quiet");
    var loudState = new SM.State("Loud");
    
    quietState.handler.volume_up = function(theEvent) {
        return loudState;
    };

    loudState.handler.volume_down = function(theEvent) {
        return quietState;
    };
    var volumeStateMachine = new SM.StateMachine([quietState, loudState]);

    // Main State Machine
    var offState = new SM.State("OffState");
    var onState = new SM.Sub("OnState", volumeStateMachine);
    
    offState.handler.switched_on = function(theEvent) {
        return onState;
    };
    onState.handler.switched_off = function(theEvent) {
        return offState;
    };

    var sm = new SM.StateMachine([offState, onState]);
    sm.setup();
    assert.equal("OffState", sm.state);

    sm.handleEvent("switched_on");
    assert.equal("OnState/(Quiet)", sm.toString());

    sm.handleEvent("volume_up");
    assert.equal("OnState/(Loud)", sm.toString());
    
    sm.handleEvent("switched_off");
    assert.equal("OffState", sm.toString());
    
    sm.handleEvent("switched_on");
    assert.equal("OnState", sm.state.id);
    assert.equal("Quiet", sm.state.subMachine.state.id);
    assert.equal("Quiet", sm.state.subState.id);
    assert.equal("OnState/(Quiet)", sm.toString());
};
