/*globals module, require, console, exports */

if (typeof module === "object" && typeof require === "function") {
    var buster = require("buster");
    var HSM = require("../StateMachine.js");
    // set up logging to console
    HSM.Logger.debug = console.log;
}

var assert = buster.referee.assert;

buster.testCase("testSubStates", {
    setUp: function() {
        var _ = this;
        // Sub State Machine
        var quietState = new HSM.State("Quiet");
        var loudState = new HSM.State("Loud");
    
        quietState.handler.volume_up = { next: loudState };
        loudState.handler.volume_down = { next: quietState };
        var volumeStateMachine = new HSM.StateMachine([quietState, loudState]);

        // Main State Machine
        var offState = new HSM.State("OffState");
        var onState = new HSM.Sub("OnState", volumeStateMachine);
    
        offState.handler.switched_on = { next: onState };
        onState.handler.switched_off = { next: offState };

        _.sm = new HSM.StateMachine([offState, onState]).setup();
    },
    "testSubMachine": function() {
        var _ = this;
        assert.equals("OffState", _.sm.state.toString());

        _.sm.handleEvent("switched_on");
        assert.equals("OnState/(Quiet)", _.sm.toString());

        _.sm.handleEvent("volume_up");
        assert.equals("OnState/(Loud)", _.sm.toString());
    
        _.sm.handleEvent("switched_off");
        assert.equals("OffState", _.sm.toString());
    
        _.sm.handleEvent("switched_on");
        assert.equals("OnState", _.sm.state.id);
        assert.equals("Quiet", _.sm.state.subMachine.state.id);
        assert.equals("Quiet", _.sm.state.subState.id);
        assert.equals("OnState/(Quiet)", _.sm.toString());
    }
});
