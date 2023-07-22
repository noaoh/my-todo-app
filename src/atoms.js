import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { filter as filterFuzzy } from 'fuzzy-tools';
import { VIEW_STATES, osLineEnding } from './constants';
import { TodoListModel, TodoModel } from './models/todotxt';

const currentTodoAtom = atomWithStorage('currentTodo', '');

const searchQueryAtom = atomWithStorage('searchQuery', '');

const addCreationDateAtom = atomWithStorage('addCreationDate', false);

const addCompletionDateAtom = atomWithStorage('addCompletionDate', false);

const showStateAtom = atomWithStorage('showState', VIEW_STATES.ALL);

const todosModelAtom = atomWithStorage('todosModel', new TodoListModel([], osLineEnding), {
  getItem: (key) => {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      return new TodoListModel([], osLineEnding);
    } else {
      const parsedValue = JSON.parse(storedValue);
      const { todos } = parsedValue;
      const todoList = todos.map((todo) => new TodoModel(todo));
      return new TodoListModel(todoList, osLineEnding);
    }
  },
  setItem: (key, newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue));
  },
});

const filteredTodosAtom = atom((get) => {
  const todosModel = get(todosModelAtom);
  const searchQuery = get(searchQueryAtom);
  const showState = get(showStateAtom);
  if (searchQuery === '') {
    return todosModel.show(showState);
  } else {
    return filterFuzzy(searchQuery, todosModel.show(showState), {
      name: 'raw',
    });
  }
});

const todoListIsEmptyAtom = atom((get) => {
  const todosModel = get(todosModelAtom);
  return todosModel.isEmpty;
});

/* eslint-disable max-len */
export {
  currentTodoAtom, searchQueryAtom, addCreationDateAtom, addCompletionDateAtom, showStateAtom, todosModelAtom, filteredTodosAtom, todoListIsEmptyAtom,
};
