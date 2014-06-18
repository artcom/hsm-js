/*globals module, require, console, exports */

if (typeof module === "object" && typeof require === "function") {
    var buster = require("buster");
    var HSM = require("../StateMachine.js");
    // set up logging to console
    HSM.Logger.debug = console.log;
}
var assert = buster.referee.assert;


buster.testCase("testEnterAndExit", {
    setUp: function () {
        var _ = this;
        _.enteredOnCount = 0;
        _.exitedOffCount = 0;

        var offState = new HSM.State("OffState");
        var onState = new HSM.State("OnState");
    
        offState.handler.switched_on = { next:onState };
    
        offState._exit = function() {
            _.exitedOffCount++;
        };

        onState.handler.switched_off = { next: offState }; 
    
        onState._enter = function() {
            _.enteredOnCount++;
        };

        _.sm = new HSM.StateMachine([offState, onState]).setup();
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

