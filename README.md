# Hierarchial State Machine for Javascript

[![Build Status][BS img]][Build Status]

## Description

Simple, yet powerful hierarchial state machine framework. Supports Sub-Statemachines (nested states) and Parallel-Statemachines (orthogal regions) and entry and exit handlers.  

## Actions and State Transitions

Each state has a map of event handlers. These handlers will be called when the state receives the respective event.
The handlers can return one of the following:

* true: the event will be considered processed and will not bubble up.
* false: the event will be considered not processed and will bubble up.

Event handlers are added to the handler[] array of each state:

    State.handler[event] = { next: newState, action: actionFunc };

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

