var SM = require("../StateMachine.js");
var assert = require('assert');

// set up logging to console
SM.Logger.debug = console.log;

exports['testToggle'] = function testToggle() {
    var offState = new SM.State("OffState");
    offState.handler.switched_on = function(theEvent) {
        return [onState];
    };

    var onState = new SM.State("OnState");
    onState.handler.switched_off = function(theEvent) {
        return offState;
    };

    var sm = new SM.StateMachine([offState, onState]).setup();
    
    assert.equal("OffState", sm.state.id);

    sm.handleEvent("switched_off");
    assert.equal("OffState", sm.state.id);

    sm.handleEvent("switched_on");
    assert.equal("OnState", sm.state.id);

    sm.handleEvent("switched_on");
    assert.equal("OnState", sm.state.id);
};
