var SM = require("../StateMachine.js");
var assert = require('assert');

// set up logging to console
SM.Logger.debug = console.log;

exports['testSubStates'] = function testSubStates() {
    // Sub State Machine
    var quietState = new SM.State("Quiet");
    quietState.handler.volume_up = function(theEvent) {
        return "Loud";
    };

    var loudState = new SM.State("Loud");
    loudState.handler.volume_down = function(theEvent) {
        return "Quiet";
    };
    var volumeStateMachine = new SM.StateMachine(quietState, loudState);

    // Main State Machine
    var offState = new SM.State("OffState");
    offState.handler.switched_on = function(theEvent) {
        return "OnState";
    };
    var onState = new SM.Sub("OnState", volumeStateMachine);
    onState.handler.switched_off = function(theEvent) {
        return "OffState";
    };

    var sm = new SM.StateMachine(offState, onState);
    sm.setup();
    assert.equal("OffState", sm.stateObject);

    sm.handleEvent("switched_on");
    assert.equal("OnState/(Quiet)", sm.toString());

    sm.handleEvent("volume_up");
    assert.equal("OnState/(Loud)", sm.toString());
    
    sm.handleEvent("switched_off");
    assert.equal("OffState", sm.toString());
    
    sm.handleEvent("switched_on");
    assert.equal("OnState/(Quiet)", sm.toString());
};
