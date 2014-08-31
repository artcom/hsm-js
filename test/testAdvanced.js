/*globals module, require, console, exports */

if (typeof module === "object" && typeof require === "function") {
    var buster = require("buster");
    var HSM = require("../StateMachine.js");
    // set up logging to console
    HSM.Logger.debug = console.log;
}

var assert = buster.referee.assert;

buster.testCase("testAdvanced", {
    setUp: function() {
        var _ = this;
        // execution log
        _.log = [];
        
        // State Machine 'a'
        var a1 = new HSM.State("a1");
        a1.on_entry = function() { _.log.push("a1_entered"); };
        var a2 = new HSM.State("a2");
        a2.on_entry = function() { _.log.push("a2_entered"); };
        var a3 = new HSM.State("a3");
        a3.on_entry = function() { _.log.push("a3_entered"); };

        a1.handler.T1 = [
            {
                next: a2,
                guard: function (theData) {
                    return theData;
                }
            },
            {
                next: a3,
                guard: function (theData) {
                    return !theData;
                }
            }
        ];
        a2.handler.T2 = {
            next: a3,
            action: function (theData) {
                this.handleEvent("T3");
            }
        };
        a3.handler.T3 = {
            next: a1
        };

    
        var a = new HSM.Sub("a", new HSM.StateMachine([a1, a2, a3]));
        a.on_entry = function(thePreviousState, theData) { 
            _.log.push("a_entered"); 
        };

        // State Machine 'b'
        var b1 = new HSM.State("b1");
        var b2 = new HSM.State("b2");
    
        var b = new HSM.Sub("b", new HSM.StateMachine([b1, b2]));

        // State Machine c1
        var c11 = new HSM.State("c11");
        var c12 = new HSM.State("c12");
    
        var c21 = new HSM.State("c21");
        var c22 = new HSM.State("c22");
        
        var c = new HSM.Parallel("c", new HSM.StateMachine([c11, c12]), 
                                      new HSM.StateMachine([c21, c22]));
        
        // Top State Machine
        _.sm = new HSM.StateMachine([a, b, c]).init();

    },
    "testEnter": function() {
        var _ = this;
        assert.equals(["a_entered", "a1_entered"], _.log);
    },
    "testFirstGuard": function() {
        var _ = this;
        _.log= [];
        _.sm.handleEvent("T1", true);
        assert.equals(["a2_entered"], _.log);
    },
    "testSecondGuard": function() {
        var _ = this;
        _.log= [];
        _.sm.handleEvent("T1", false);
        assert.equals(["a3_entered"], _.log);
    },
    "testRunToCompletion": function() {
        var _ = this;
        _.log= [];
        _.sm.handleEvent("T1", true);
        _.sm.handleEvent("T2", true);
        assert.equals(["a2_entered", "a3_entered", "a1_entered"], _.log);
    }
});
