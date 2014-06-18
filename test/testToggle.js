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
        var onState = new HSM.State("OnState");
        var offState = new HSM.State("OffState");

        offState.handler.switched_on = { next: onState };
        onState.handler.switched_off = { next: offState }; 

        this.sm = new HSM.StateMachine([offState, onState]).setup();
    },
    "testToggle" : function() {
        assert.equals("OffState", this.sm.state.id);

        this.sm.handleEvent("switched_off");
        assert.equals("OffState", this.sm.state.id);

        this.sm.handleEvent("switched_on");
        assert.equals("OnState", this.sm.state.id);

        this.sm.handleEvent("switched_on");
        assert.equals("OnState", this.sm.state.id);
    }
});
