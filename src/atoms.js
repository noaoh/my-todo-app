import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import {
  isUNIX, isMacOS, isLinux, isIOS, isAndroid,
} from 'get-os-name';
import { VIEW_STATES } from './constants';
import { TodoListModel, TodoModel } from './models/todotxt';

function getOsLineEnding() {
  // UNIX operating systems use '\n' to end a line
  // Windows and other operating systems use '\r\n' to end a line
  // This matters for the output of our todo.txt file
  // eslint-disable-next-line no-bitwise
  if (isUNIX() || isMacOS() | isLinux() || isIOS() || isAndroid()) {
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
      throw new Error('no value stored');
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
  const filterRegex = new RegExp(`.*${escapeRegExp(searchQuery)}.*`);
  return todosModel.show(showState).filter((todo) => filterRegex.test(todo.raw));
});

/* eslint-disable max-len */
export {
  currentTodoAtom, searchQueryAtom, addCreationDateAtom, addCompletionDateAtom, showStateAtom, todosModelAtom, filteredTodosAtom,
};
