/* __ ___ ____ _____ ______ _______ ________ _______ ______ _____ ____ ___ __
//
// Copyright (C) 1993-2011, ART+COM AG Berlin, Germany <www.artcom.de>
//
// These coded instructions, statements, and computer programs contain
// proprietary information of ART+COM AG Berlin, and are copy protected
// by law. They may be used, modified and redistributed under the terms
// of GNU General Public License referenced below.
//
// Alternative licensing without the obligations of the GPL is
// available upon request.
//
// GPL v3 Licensing:
//
// This file is part of the ART+COM Y60 Platform.
//
// ART+COM Y60 is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// ART+COM Y60 is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with ART+COM Y60.  If not, see <http://www.gnu.org/licenses/>.

*/
/*globals Logger*/

var HSM = (function () {

    ////////////
    // Public //
    ////////////
    var Logger = { debug: function(){}, trace: function(){} };

    var State = function (theStateID) {
        this._id = theStateID;
        this.handler = {};
        //this.Constructor(this, theStateID);
    };

    State.prototype._enter = function (thePreviousState, theData) {
    };
    State.prototype._exit = function (theNextState, theData) {
    };
    State.prototype.toString = function () {
        return this._id;
    };
    State.prototype.__defineGetter__('id', function() {
        return this._id;
    });

    var Sub = function (theStateID, theSubMachine) {
        this._subMachine = theSubMachine;
        State.call(this, theStateID);
    };

    Sub.prototype.__proto__ = State.prototype;

    Sub.prototype._enter = function (thePreviousState, theData) {
        return this._subMachine.setup(theData);
    };
    Sub.prototype._exit = function (theNextState, theData) {
        this._subMachine.teardown(theData);
    };
    Sub.prototype.handleEvent = function () {
        return this._subMachine.handleEvent.apply(this._subMachine, arguments);
    };
    Sub.prototype.toString = function toString() {
        return this.id + "/(" + this._subMachine + ")";
    };
    Sub.prototype.__defineGetter__("subMachine", function () {
        return this._subMachine;
    });
    Sub.prototype.__defineGetter__("subState", function () {
        return this._subMachine.state;
    });

    var Parallel = function (theStateID, theSubMachines) {
        this._subMachines = theSubMachines || [];
        State.call(this, theStateID);
    };
    Parallel.prototype.__proto__ = State.prototype;

    Parallel.prototype.toString = function toString() {
        return this.id + "/(" + this._subMachines.join('|') + ")";
    };

    Parallel.prototype._enter = function (thePreviousState, theData) {
        for (var i = 0; i < this._subMachines.length; ++i) {
            this._subMachines[i].setup(theData);
        }
    };
    Parallel.prototype._exit = function (theNextState, theData) {
        for (var i = 0; i < this._subMachines.length; ++i) {
            this._subMachines[i].teardown(theData);
        }
    };
    Parallel.prototype.handleEvent = function () {
        var handled = false;
        for (var i = 0; i < this._subMachines.length; ++i) {
            if (this._subMachines[i].handleEvent.apply(this._subMachines[i], arguments)) {
                handled = true;
            }
        }
        return handled;
    };
    Parallel.prototype.__defineGetter__("subMachines", function () {
        return this._subMachines;
    });
    Parallel.prototype.__defineGetter__("parallelStates", function () {
        return this._subMachines.map(function(s) { return s.state; });
    });


    var StateMachine = function (theStates) {
        this.states = {};
        for (var i = 0; i  < theStates.length; ++i) {
            if (!(theStates[i] instanceof State)) {
                throw ("Invalid Argument - not a state");
            }
            this.states[theStates[i].id] = theStates[i];
        }

        this.initialState = theStates.length ? theStates[0] : null;
        this._curState = null;
    };

    StateMachine.prototype.toString = function toString() {
        if (this._curState !== null) {
            return this._curState.toString();
        } else {
            return "_uninitializedStatemachine_";
        }
    };

    StateMachine.prototype.__defineGetter__('state', function () {
        return this._curState;
    });

    StateMachine.prototype.switchState = function (newState, theData) {
        Logger.debug("State transition '" + this._curState+ "' => '" + newState + "'");
        // call old state's exit handler
        if (this._curState !== null && '_exit' in this.state) {
            Logger.debug("<StateMachine::switchState> exiting state '" + this._curState + "'");
            this.state._exit(newState, theData);
        }
        var oldState  = this._curState;
        this._curState = newState;
        // call new state's enter handler
        if (this._curState !== null && '_enter' in this.state) {
            Logger.debug("<StateMachine::switchState> entering state '" + this._curState + "'");
            this.state._enter(oldState, theData);
        }
    };

    StateMachine.prototype.setup = function (theData) {
        Logger.debug("<StateMachine::setup> setting initial state: " + this.initialState);
        this._curState = null;
        this.switchState(this.initialState, theData);
        return this;
    };
    StateMachine.prototype.teardown = function () {
        this.switchState(null, {});
    };


    StateMachine.prototype.handleEvent = function () {
        Logger.debug("<StateMachine::handleEvent> got event " + arguments[0]);
        var handled = false;
        var handlerResult = null;
        var nextState = undefined;
        var data = undefined;
        // check if the current state is a (nested) statemachine, if so, give it the event. 
        // if it handles the event, stop processing it here.
        if ('handleEvent' in this.state && 
                this.state.handleEvent.apply(this.state, arguments)) {
            return true;
        }

        if (arguments[0] in this.state.handler) {
            handlerResult = this.state.handler[arguments[0]].apply(this.state, arguments);
        }
        if (handlerResult instanceof Array) {
            nextState = handlerResult.shift();
            data = handlerResult.shift();
        } else if (handlerResult instanceof State) {
            nextState = handlerResult;
        }
        if (nextState) {
            this.switchState(nextState, data);
        }
        return nextState !== undefined;
    };

    //////////////
    // Interface
    //////////////
    return {
        State        : State,
        Sub          : Sub,
        Parallel     : Parallel,
        StateMachine : StateMachine,
        Logger       : Logger
    };
}()); // execute outer function to produce our closure

// nodejs export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HSM;
};
