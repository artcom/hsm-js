# Hierarchial State Machine for Javascript

[![Build Status][BS img]][Build Status]

## Description

Simple, yet powerful hierarchial state machine framework. Supports Sub-Statemachines (nested states) and Parallel-Statemachines (orthogal regions) and entry and exit handlers.  

The following state machine is used [in the tests](test/testAdvanced.js) and this documentation to illustrate the features.

![advanced state machine example](doc/advanced.png "advanced state machine example")

## States and State Machines

States are specified by creating HSM.State instances. They are then composed to a state machine by passing them to the HSM.StateMachine constructor.

        var onState = new HSM.State("OnState");
        var offState = new HSM.State("OffState");
        var sm = new HSM.StateMachine([offState, onState]);

By convention, the first state passed is the initial state. The state machine is then initialized by HSM.StateMachine.init():

        sm.init();

This starts the state machine and activates the initial state, calling its entry handler (see below). The state machine is now ready to 
handle events.


## Actions and State Transitions

Each state has a map of event handlers. These handlers will be called when the state receives the respective event.
Event handlers are added to the handler[] array of each state:

    State.handler[event] = { next: newState };

This specifies a transition from State to newState for event. Additionally, an action can be added to the transition:

    State.handler[event] = { next: newState, action: actionFunc };

Events are triggered by calling the StateMachine.handleEvent() method. This can even be done inside an event handler's actionFunc.  If an event is 
triggered while an event is being handled it will be queued until the current event completes. This is known as the run-to-completion (RTC) execution model.  

## Guards 

Guards (or guard conditions) affect the behaviour of a state machine by enabling actions or transitions only when they evaluate to TRUE and disabling them when they evaluate to FALSE. 
When using guards, multiple event handlers can be bound to a single trigger with a guard. Each guard is evaluated until one returns true. The respective handler is then invoked (after calling
the usual exit handler).

    State.handler[event] = { guard: guardFunc, next: newState, action: actionFunc };

## Sub-StateMachines (nested)

## Parallel State-Machines (orthoganal regions)

## Entry and Exit Actions

Each state has an overridable \_enter() and \_exit() function - you can add your enter and exit code here. Be sure to call the base classes implementation if your state is composite (i.e. 
a Sub or Parallel.)

## Internal, External and Local Transitions (TODO)

[Build Status]: https://travis-ci.org/Mask/hsm-js
[BS img]: https://travis-ci.org/Mask/hsm-js.png

