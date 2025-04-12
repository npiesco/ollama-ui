import { act } from '@testing-library/react';
import * as zustand from 'zustand';

const { create: actualCreate, createStore } = jest.requireActual<typeof zustand>('zustand');

// A collection of all store reset functions
export const storeResetFns = new Set<() => void>();

// When creating a store, we get its initial state, create a reset function, and add it to the set
export const create = (<T>() => {
  return (stateCreator: zustand.StateCreator<T>) => {
    const store = createStore(stateCreator);
    const initialState = store.getState();
    storeResetFns.add(() => {
      store.setState(initialState, true);
    });
    return store;
  };
}) as typeof zustand.create;

// Reset all stores after each test
afterEach(() => {
  act(() => {
    storeResetFns.forEach((resetFn) => {
      resetFn();
    });
  });
});

export * from 'zustand'; 