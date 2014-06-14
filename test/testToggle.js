var SM = require("../StateMachine.js");
SM.Logger.debug = console.log;
var assert = require('assert');


exports['testToggle'] = function testToggle() {
    var offState = new SM.State("OffState");
    offState.handler.switched_on = function(theEvent) {
        return "OnState";
    };

    var onState = new SM.State("OnState");
    onState.handler.switched_off = function(theEvent) {
        return "OffState";
    };

    var sm = new SM.StateMachine(offState, onState);
    sm.setup();
    assert.equal("OffState", sm.stateObject);

    sm.handleEvent("switched_off");
    assert.equal("OffState", sm.stateObject);

    sm.handleEvent("switched_on");
    assert.equal("OnState", sm.stateObject);

    sm.handleEvent("switched_on");
    assert.equal("OnState", sm.stateObject);
};
