/* __ ___ ____ _____ ______ _______ ________ _______ ______ _____ ____ ___ __


The MIT License (MIT)

Copyright (c) 2013 Martin Skinner ART+COM

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
/*globals module*/

/**
 * @namespace HSM
 */

var HSM = (function () {

    ////////////
    // Public //
    ////////////
    var Logger = { debug: function(){}, trace: function(){} };

/**
 * @callback HSM.State~EntryFunc
 * @param {HSM.State} source state
 * @param {HSM.State} target state
 * @param data - event parameters
 */
/**
 * @callback HSM.State~ExitFunc
 * @param {HSM.State} source state
 * @param {HSM.State} target state
 * @param data - event parameters
 */
/**
 * A guard function may be attached to any transition. It will be called before the transition is fired. If it doesn't return true,
 * the transition will be disabled for the current event.
 * @callback HSM.State~GuardFunc
 * @param {HSM.State} source - current state
 * @param {HSM.State} target - potential next state
 * @param data - event parameters
 */
/**
 * An action function may be attached to any transition. It will be called after all exit handlers and before all entry handlers are called.
 * @callback HSM.State~ActionFunc
 * @param {HSM.State} source - current state
 * @param {HSM.State} target - next state
 * @param data - event parameters
 * @see {@link HSM.State~Handler} action
 */
/**
  @typedef {Object} HSM.State~Handler
  @property {HSM.State} target - target state
  @property {HSM.State~GuardFunc=} guard - disables the transition unless returns true. 
  @property {HSM.State~ActionFunc=} action - called after all state exit handlers and before any state entry handlers are called.
*/


/**
 * Represents a State.
 * @class HSM.State
 * @param {String} theStateID - Identifies the state. Must be unique in the containing state machine. 
 */  
    var State = function (theStateID) {
        this._id = theStateID;
        this._owner = null;
        /** Map of events to handlers. 
         * Either a single handler or an array of handlers can be given. The guard of each handler will be called
         * until a guard returns true (or a handler doesn't have a guard). This handler will then be triggered.
         * @memberof! HSM.State# 
         * @var {(HSM.State~Handler|HSM.State~Handler[])} handler[event] 
         */
        this.handler = {};
    };
    /** @memberof! HSM.State# 
     *  @var {HSM.State~EntryFunc}
     */
    State.prototype.on_entry = undefined;
    /** @memberof! HSM.State# 
     *  @var {HSM.State~ExitFunc}
     */
    State.prototype.on_exit = undefined;

    State.prototype._enter = function (sourceState, targetState, theData) {
        if (this.on_entry !== undefined) {
            this.on_entry.apply(this, arguments);
        }
    };
    State.prototype._exit = function (theNextState, theData) {
        if (this.on_exit !== undefined) {
            this.on_exit.apply(this, arguments);
        }
    };
    State.prototype.toString = function () {
        return this._id;
    };
    State.prototype.__defineGetter__('id', function() {
        return this._id;
    });
    State.prototype.__defineGetter__('owner', function() {
        return this._owner;
    });

    State.prototype.__defineSetter__('owner', function(theOwnerMachine) {
        if (this._owner) {
            throw ("Invalid Argument - state '"+this._id+"'already owned");
        }
        this._owner = theOwnerMachine;
    });


    /** Adapter class for nested states 
     * @class HSM.Sub
     * @extends HSM.State
     * @param {String} theStateID - Identifies the state. Must be unique in the containing state machine. 
     * @param {HSM.StateMachine} theSubMachine - the nested state machine. 
     */
    var Sub = function (theStateID, theSubMachine) {
        State.call(this, theStateID);
        this._subMachine = theSubMachine;
        this._subMachine._owner = this;
    };

    Sub.prototype = Object.create(State.prototype);
    Sub.prototype.constructor = Sub;
    // old-style inheritance - causes performance warnings in newer JS engines
    // Sub.prototype.__proto__ = State.prototype;

    Sub.prototype._enter = function (sourceState, targetState, theData) {
        State.prototype._enter.apply(this, arguments);
        return this._subMachine._enterState(sourceState, targetState, theData);
    };
    Sub.prototype._exit = function (theNextState, theData) {
        this._subMachine.teardown(theNextState, theData);
        State.prototype._exit.apply(this, arguments);
    };
    Sub.prototype._handle = function () {
        return this._subMachine._handle.apply(this._subMachine, arguments);
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

    /** Adapter class for parallel states 
     * @class HSM.Parallel
     * @extends HSM.State
     * @param {String} theStateID - Identifies the state. Must be unique in the containing state machine. 
     * @param {HSM.StateMachine[]} theSubMachines - an array of parallel state machines. 
     */
    var Parallel = function (theStateID, theSubMachines) {
        var i;
        State.call(this, theStateID);
        this._subMachines = theSubMachines || [];
        for (i = 0; i < this._subMachines.length; ++i) {
            this._subMachines[i]._owner = this; 
        }
    };
    
    // inheritance
    Parallel.prototype = Object.create(State.prototype);
    Parallel.prototype.constructor = Parallel;
    // old-style inheritance - causes performance warnings in newer JS engines
    // Parallel.prototype.__proto__ = State.prototype;

    Parallel.prototype.toString = function toString() {
        return this.id + "/(" + this._subMachines.join('|') + ")";
    };

    Parallel.prototype._enter = function (sourceState, targetState, theData) {
        var i;
        State.prototype._enter.apply(this, arguments);
        for (i = 0; i < this._subMachines.length; ++i) {
            this._subMachines[i]._enterState(sourceState, targetState, theData);
        }
    };
    Parallel.prototype._exit = function (theNextState, theData) {
        var i;
        for (i = 0; i < this._subMachines.length; ++i) {
            this._subMachines[i].teardown(theData);
        }
        State.prototype._exit.apply(this, arguments);
    };
    Parallel.prototype._handle = function () {
        var handled = false;
        var i;
        for (i = 0; i < this._subMachines.length; ++i) {
            if (this._subMachines[i]._handle.apply(this._subMachines[i], arguments)) {
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

/**
 * Represents a State Machine.
 * @class HSM.StateMachine
 * @param {HSM.State[]} theStates - the states that compose the state machine. The first state is the initial state. 
 */  
    var StateMachine = function(theStates) {
        this.states = {};
        this._owner = null;
        this._curState = null;
        this._eventInProgress = false;
        this._eventQueue = [];
        var i;
        for (i = 0; i  < theStates.length; ++i) {
            if (!(theStates[i] instanceof State)) {
                throw ("Invalid Argument - not a state");
            }
            this.states[theStates[i].id] = theStates[i];
            theStates[i].owner = this;
        }

        this.initialState = theStates.length ? theStates[0] : null;
    };

    StateMachine.prototype.toString = function toString() {
        if (this._curState !== null) {
            return this._curState.toString();
        }
        return "_uninitializedStatemachine_";
    };

    StateMachine.prototype.__defineGetter__('path', function () {
        var p = [this];
        while (p[0]._owner) {
            p.unshift(p[0]._owner._owner);
        }
        return p;
    });
    StateMachine.prototype.__defineGetter__('id', function () {
        return this._owner ? this._owner._id : '_top_';
    });

    StateMachine.prototype.__defineGetter__('state', function () {
        return this._curState;
    });

    /** get the lowest common ancestor of states of this
     * state machine and an arbitrary other state
     */
    StateMachine.prototype.lca = function(state) {
        var i;
        var thisPath = this.path;
        for (i = 1; i < thisPath.length; ++i) {
            if (state._owner.path[i] !== thisPath[i]) {
                return thisPath[i-1];
            }
        }
        return this;
    };

    /** 
     *  initializes this state machine and set the current state to the initial state. 
     *  Any nested state machines will also be initialized and set to their initial state.
     *  @memberof! HSM.StateMachine#
     *  @param [data] event parameters 
     */
    StateMachine.prototype.init = function (theData) {
        Logger.debug("<StateMachine "+this.id+"::init> setting initial state: " + this.initialState.id);
        this._enterState(null, this.initialState, theData);
        return this;
    };
   
    /** Performs a transition between sourceState and targetState. Must only be called
     * on the lowest common ancestor of sourceState and targetState 
     */
    StateMachine.prototype._switchState = function (sourceState, targetState, theAction, theData) {
        Logger.debug("<StateMachine "+this.id+"::_switchState> "+sourceState.id + " => "+targetState.id);
        this._exitState(sourceState, targetState, theData);
        if (theAction) { 
            theAction.apply(this, [sourceState, targetState].concat(theData));
        }
        this._enterState(sourceState, targetState, theData);
    };

    /** enters targetState. For all nested state machines up to the depth of targetState,
     * the state machines are set directly to this state instead of the inital state. For all
     * nested state machines beyond the depth of targetState, set to the initial state.
     */
    StateMachine.prototype._enterState = function (sourceState, targetState, theData) {
        var targetLevel = targetState.owner.path.length;
        var thisLevel = this.path.length;
        if (targetLevel < thisLevel) {
            this._curState = this.initialState;
        } else if (targetLevel === thisLevel) {
            this._curState = targetState;
        } else {
            this._curState = targetState._owner.path[thisLevel]._owner; 
        }
        Logger.trace("<StateMachine "+this.id+"::_enterState> entering state: " + this._curState.id+", targetState: "+targetState.id);
        // call new state's enter handler
        this.state._enter(sourceState, targetState, theData);
    };
   
    StateMachine.prototype._exitState = function (sourceState, targetState, theData) {
        Logger.trace("<StateMachine "+this.id+"::_exitState> exiting state: " + this._curState.id);
        this.state._exit(targetState, theData);
    };
   
    StateMachine.prototype.teardown = function (targetState, theData) {
        this._exitState(this.state, targetState, theData);
    };

    /** check if this transition's guard passes (if one exists) and 
     * execute the transition
     */
    StateMachine.prototype._tryTransition = function(handler, data) {
        if ( !('guard' in handler) || handler.guard(this._curState, handler.target, data)) {
            var lca = this.lca(handler.target);
            Logger.trace("<StateMachine "+this.id+"::_tryTransition> guard passed, passing event to lca: " + lca.id);
            lca._switchState(this._curState, handler.target, handler.action, data);
            return true;
        }
        return false;
    };

    /** 
     *  Creates a new event an passes it to the top-level state machine for handling. Aliased as handleEvent
     *  for backwards compatibility.
     *  @memberof! HSM.StateMachine#
     *  @param {string} event - event to be handled
     *  @param [data] event parameters 
     */
    StateMachine.prototype.emit = function (ev) {
        if (this.path.length > 1) {
            // if we are not at the top-level state machine,
            // call again at the top-level state machine
            this.path[0].emit.apply(this.path[0], arguments);
        } else {
            this._eventQueue.push(arguments);
            // we are at the top-level state machine
            if (this._eventInProgress === true) {
                Logger.trace("<StateMachine "+this.id+">::emit: queuing event "+ev);
            } else {
                this._eventInProgress = true;
                while (this._eventQueue.length > 0) {
                    this._handle.apply(this, this._eventQueue.shift());
                }
                this._eventInProgress = false;
            }
        }
    };
    StateMachine.prototype.handleEvent = StateMachine.prototype.emit; 

    StateMachine.prototype._handle = function (ev, data) {
        // check if the current state is a (nested) statemachine, if so, give it the event. 
        // if it handles the event, stop processing it here.
        if ('_handle' in this.state) {
            Logger.trace("<StateMachine "+this.id+"::_handle> handing down " + ev);
            if (this.state._handle.apply(this.state, arguments)) {
                return true;
            }
        }

        Logger.trace("<StateMachine "+this.id+"::_handle> handling event " + ev);
        if (ev in this.state.handler) {
            if (this.state.handler[ev] instanceof Array) {
                // we have multiple handlers for this event
                // try them all in turn
                var handlers = this.state.handler[ev];
                var i;
                for (i = 0; i < handlers.length; ++i) {
                    if (this._tryTransition(handlers[i], data)) {
                        return true;
                    }
                }
                return false;
            }
            // only on handler - try it.
            return this._tryTransition(this.state.handler[ev], data);
        }
        // no handler for this event.
        return false;
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
if (typeof module === 'object' && module.exports) {
    module.exports = HSM;
}
