import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import {
  isUNIX, isMacOS, isLinux, isIOS, isAndroid,
} from 'get-os-name';
import { filter as filterFuzzy } from 'fuzzy-tools';
import { VIEW_STATES } from './constants';
import { TodoListModel, TodoModel } from './models/todotxt';

function getOsLineEnding() {
  // UNIX operating systems use '\n' to end a line
  // Windows and other operating systems use '\r\n' to end a line
  // This matters for the output of our todo.txt file
  if (isUNIX() || isMacOS() || isLinux() || isIOS() || isAndroid()) {
    return '\n';
  }
  return '\r\n';
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const osLineEnding = getOsLineEnding();
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

/* eslint-disable max-len */
export {
  currentTodoAtom, searchQueryAtom, addCreationDateAtom, addCompletionDateAtom, showStateAtom, todosModelAtom, filteredTodosAtom,
};
