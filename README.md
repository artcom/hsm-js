# Hierarchial State Machine for Javascript

[![Build Status][BS img]][Build Status]

## Description

Simple, yet powerful hierarchial state machine framework. Supports Sub-Statemachines (nested states) and Parallel-Statemachines (orthogal regions) and entry and exit handlers.  

## Simple State Machine

## Actions and State Transitions

Each state has a map of event handlers. These handlers will be called when the state receives the respective event.
The handlers can return one of the following:

State.handler[event] = [newState, actionFunc, kind];
State.handler[event] = [[guardFunc, newState, actionFunc, kind],
                        [guardFunc, newState, actionFunc, kind],
                        [guardFunc, newState, actionFunc, kind],
                        [guardFunc, newState, actionFunc, kind],
                        ];

* a state object: this will be the new state.
* this: the current state will exit and re-enter (self-transition)
* null: the event will be considered processed and will not bubble up. The state will remain the same and no exit / entry handlers involed (internal transition)
* undefined: the event will be considered not processed and will bubble up.

## Guards

Guards (or guard conditions) affect the behaviour of a state machine by enabling actions or transitions only when they evaluate to TRUE and disabling them when they evaluate to FALSE. 
When using guards, multiple event handlers can be bound to a single trigger with a guard. Each guard is evaluated until one returns true. The respective handler is then invoked (after calling
the usual exit handler).

## Entry and Exit Actions

## Internal, External and Local Transitions

## Sub-StateMachines (nested)

## Parallel State-Machines (orthoganal regions)




[Build Status]: https://travis-ci.org/Mask/hsm-js
[BS img]: https://travis-ci.org/Mask/hsm-js.png

