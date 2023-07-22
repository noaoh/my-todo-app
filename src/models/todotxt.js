import { v4 as uuid } from 'uuid';
import { format, startOfToday } from 'date-fns';
import { MATCH_TYPES, VIEW_STATES, osLineEnding } from '../constants';
import { findMatch, parseTodoTxt } from './parser';

const isoTodayDate = () => format(startOfToday(), 'yyyy-MM-dd');

class TodoModel {
  constructor(todoObj) {
    const {
      completed, priority, completionDate, creationDate, text, contexts, projects, extras, raw, id,
    } = todoObj;
    this.completed = completed;
    this.text = text;
    this.priority = priority;
    this.completionDate = completionDate;
    this.creationDate = creationDate;
    this.contexts = contexts;
    this.projects = projects;
    this.extras = extras;
    this.raw = raw;
    this.id = id || uuid();
  }

  static parse(string, id) {
    const parsedString = parseTodoTxt(string);
    return new TodoModel({ ...parsedString, raw: string, id });
  }

  setCreationDate() {
    const creationDate = isoTodayDate();
    // eslint-disable-next-line max-len
    const states = [MATCH_TYPES.COMPLETED, MATCH_TYPES.PRIORITY, MATCH_TYPES.COMPLETION_DATE, MATCH_TYPES.CREATION_DATE];
    const tokens = this.raw.split(' ');
    let insertionPoint = 0;
    let dates = 0;

    while (findMatch(states, tokens[insertionPoint]) !== false) {
      const { matchType } = findMatch(states, tokens[insertionPoint]);
      if (matchType === MATCH_TYPES.COMPLETION_DATE || matchType === MATCH_TYPES.CREATION_DATE) {
        dates += 1;
      }
      insertionPoint += 1;
    }

    if (dates !== 2) {
      tokens.splice(insertionPoint, 0, creationDate);
      const newRaw = tokens.join(' ');
      return new TodoModel({ ...this, raw: newRaw, creationDate });
    }
    return this;
  }

  setCompleted(completeValue, addCompletionDate = true) {
    let completionDate;
    if (completeValue === true) {
      const tokens = ['x', ...this.raw.split(' ')];
      if (addCompletionDate) {
        completionDate = isoTodayDate();
        const states = [MATCH_TYPES.COMPLETED, MATCH_TYPES.PRIORITY];
        let insertionPoint = 0;
        while (findMatch(states, tokens[insertionPoint]) !== false) {
          insertionPoint += 1;
        }
        tokens.splice(insertionPoint, 0, completionDate);
        const newRaw = tokens.join(' ');
        return new TodoModel({
          ...this, completionDate, completed: completeValue, raw: newRaw,
        });
      } else {
        const newRaw = tokens.join(' ');
        return new TodoModel({
          ...this, completed: completeValue, raw: newRaw,
        });
      }
    } if (completeValue === false) {
      const states = [MATCH_TYPES.COMPLETED, MATCH_TYPES.COMPLETION_DATE];
      const tokens = this.raw.split(' ');
      let completionDateFound = false;
      const newTokens = tokens.filter((token) => {
        const { matchType } = findMatch(states, token);
        if (matchType === MATCH_TYPES.COMPLETION_DATE && !completionDateFound) {
          completionDateFound = true;
          return false;
        } if (matchType === MATCH_TYPES.COMPLETED) {
          return false;
        }
        return true;
      });
      const newRaw = newTokens.join(' ');
      return new TodoModel({ ...this, completed: completeValue, raw: newRaw });
    }
    throw new Error('completeValue must be a boolean');
  }

  toString() {
    return this.raw;
  }

  toJSON() {
    return {
      id: this.id,
      raw: this.raw,
      completed: this.completed,
      priority: this.priority,
      creationDate: this.creationDate,
      completionDate: this.completionDate,
      text: this.text,
      contexts: this.contexts,
      projects: this.projects,
      extras: this.extras,
    };
  }
}

class TodoListModel {
  constructor(todos, lineEnding) {
    this.todos = todos;
    this.lineEnding = lineEnding;
  }

  addTodo(todo, addCreationDate = true) {
    const parsedTodo = addCreationDate ? TodoModel.parse(todo).setCreationDate() : TodoModel.parse(todo);
    return new TodoListModel([...this.todos, parsedTodo], this.lineEnding);
  }

  addTodos(todos, addCreationDate = true) {
    // eslint-disable-next-line arrow-body-style
    const parsedTodos = todos.map((todo) => {
      return addCreationDate ? TodoModel.parse(todo).setCreationDate() : TodoModel.parse(todo);
    });
    return new TodoListModel([...this.todos, ...parsedTodos], this.lineEnding);
  }

  importTodos(todoFile, addCreationDate = true) {
    const todoStrings = todoFile.split(this.lineEnding).map((todo) => todo.trim()).filter((todo) => !!todo);
    return this.addTodos(todoStrings, addCreationDate);
  }

  show(showState) {
    if (showState === VIEW_STATES.ACTIVE) {
      const result = this.todos.filter((todo) => todo.completed === false);
      return result;
    } if (showState === VIEW_STATES.COMPLETED) {
      const result = this.todos.filter((todo) => todo.completed === true);
      return result;
    }
    return this.todos;
  }

  removeCompleted() {
    const newList = this.todos.filter((todo) => todo.completed === false);
    return new TodoListModel(newList, this.lineEnding);
  }

  clearTodos() {
    const newList = [];
    return new TodoListModel(newList, this.lineEnding);
  }

  removeTodo(id) {
    const newList = this.todos.filter((todo) => todo.id !== id);
    return new TodoListModel(newList, this.lineEnding);
  }

  editTodo(id, text) {
    const newList = this.todos.map((todo) => {
      if (id === todo.id) {
        return TodoModel.parse(text, id);
      }
      return todo;
    });
    return new TodoListModel(newList, this.lineEnding);
  }

  toggleTodo(id, addCompletionDate = true) {
    const todo = this.todos.find((todo) => todo.id === id);
    if (todo.completed === false) {
      return this.setTodoCompleted(todo, addCompletionDate);
    } else {
      return this.setTodoNotCompleted(todo);
    }
  }

  setTodoCompleted(todo, addCompletionDate) {
    const completedTodo = todo.setCompleted(true, addCompletionDate);
    const withoutCompletedTodo = this.todos.filter((t) => t.id !== todo.id); 
    const newList = [...withoutCompletedTodo, completedTodo];
    return new TodoListModel(newList, this.lineEnding);
  }

  setTodoNotCompleted(todo) {
    const notCompletedTodo = todo.setCompleted(false);
    const withoutNotCompletedTodo = this.todos.filter((t) => t.id !== todo.id);
    const lastNotCompletedTodoIndex = withoutNotCompletedTodo.findLastIndex((todo) => todo.completed === false);
    const todosBeforeLastNotCompletedTodo = withoutNotCompletedTodo.slice(0, lastNotCompletedTodoIndex + 1);
    const todosAfterLastNotCompletedTodo = withoutNotCompletedTodo.slice(lastNotCompletedTodoIndex + 1);
    const newList = [...todosBeforeLastNotCompletedTodo, notCompletedTodo, ...todosAfterLastNotCompletedTodo];
    return new TodoListModel(newList, this.lineEnding);
  }

  toString() {
    return this.todos.map((todo) => todo.toString()).join(this.lineEnding) + this.lineEnding;
  }

  toJSON() {
    return {
      todos: this.todos.map((todo) => todo.toJSON()),
    };
  }

  get isEmpty() {
    return this.todos.length === 0;
  }

  get length() {
    return this.todos.length;
  }
}

class TodoHistoryModel {
  constructor(history, pos) {
    this.history = history || [{ todos: [] }];
    this.pos = pos || 0;
  }

  get length() {
    return this.history.length;
  }

  addState(todos) {
    const state = todos.toJSON();
    const history = [...this.history, { ...state }];
    const pos = this.pos + 1;
    return new TodoHistoryModel(history, pos);
  }

  currentState() {
    return this.history[this.pos];
  }

  undo() {
    if (this.pos === 0) {
      return this;
    }
    const pos = this.pos - 1;
    return new TodoHistoryModel(this.history, pos);
  }

  redo() {
    if (this.pos === this.history.length - 1) {
      return this;
    }
    const pos = this.pos + 1;
    return new TodoHistoryModel(this.history, pos);
  }

  toTodoModelList() {
    const { todos } = this.currentState();
    const todoList = todos.map((todo) => new TodoModel(todo));
    return new TodoListModel(todoList, osLineEnding);
  }
}

export { isoTodayDate, TodoModel, TodoListModel, TodoHistoryModel };
