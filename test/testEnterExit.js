var SM = require("../StateMachine.js");
var assert = require('assert');

// set up logging to console
SM.Logger.debug = console.log;

exports['testEnterAndExit'] = function testEnterAndExit() {
    var enteredOnCount = 0;
    var exitedOffCount = 0;

    var offState = new SM.State("OffState");
    offState.handler.switched_on = function(theEvent) {
        return "OnState";
    };
    offState._exit = function() {
        exitedOffCount++;
    }

    var onState = new SM.State("OnState");
    onState.handler.switched_off = function(theEvent) {
        return "OffState";
    };
    onState._enter = function() {
        enteredOnCount++;
    }

    var sm = new SM.StateMachine(offState, onState).setup();
    assert.equal("OffState", sm.stateObject);
    assert.equal(0,enteredOnCount);
    assert.equal(0,exitedOffCount);

    sm.handleEvent("switched_off");
    assert.equal(0,enteredOnCount);
    assert.equal(0,exitedOffCount);

    sm.handleEvent("switched_on");
    assert.equal(1,enteredOnCount);
    assert.equal(1,exitedOffCount);

    sm.handleEvent("switched_on");
    assert.equal(1,enteredOnCount);
    assert.equal(1,exitedOffCount);

    sm.handleEvent("switched_off");
    assert.equal(1,enteredOnCount);
    assert.equal(1,exitedOffCount);
};

