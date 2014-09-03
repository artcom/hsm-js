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
        _.enteredOnCount = 0;
        _.exitedOffCount = 0;
        
        var onState = new HSM.State("OnState");
        var offState = new HSM.State("OffState");

        offState.handler.switched_on = { target: onState };
        offState.on_exit = function() {
            _.exitedOffCount++;
        };

        onState.handler.switched_off = { target: offState }; 
        onState.on_entry = function() {
            _.enteredOnCount++;
        };

        _.sm = new HSM.StateMachine([offState, onState]).init();
    },
    "testToggle" : function() {
        assert.equals("OffState", this.sm.state.id);

        this.sm.handleEvent("switched_off");
        assert.equals("OffState", this.sm.state.id);

        this.sm.handleEvent("switched_on");
        assert.equals("OnState", this.sm.state.id);

        this.sm.handleEvent("switched_on");
        assert.equals("OnState", this.sm.state.id);
    },
    "testEnterExit" : function () {
        var _ = this;
        assert.equals("OffState", _.sm.state.id);
        assert.equals(0,_.enteredOnCount);
        assert.equals(0,_.exitedOffCount);

        _.sm.handleEvent("switched_off");
        assert.equals(0,_.enteredOnCount);
        assert.equals(0,_.exitedOffCount);

        _.sm.handleEvent("switched_on");
        assert.equals(1,_.enteredOnCount);
        assert.equals(1,_.exitedOffCount);

        _.sm.handleEvent("switched_on");
        assert.equals(1,_.enteredOnCount);
        assert.equals(1,_.exitedOffCount);

        _.sm.handleEvent("switched_off");
        assert.equals(1,_.enteredOnCount);
        assert.equals(1,_.exitedOffCount);
    }
});
