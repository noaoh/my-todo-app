import { v4 as uuid } from "uuid";
import { format, startOfToday } from "date-fns";
import { MATCH_TYPES, VIEW_STATES } from "../constants.js";
import { findMatch, parseTodoTxt } from "./parser.js";

const isoTodayDate = () => {
    return format(startOfToday(), "yyyy-MM-dd");
};

class TodoModel {
    constructor(todoObj) {
        const { completed, priority, completionDate, creationDate, text, contexts, projects, extras, raw, id } = todoObj;
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
        return new TodoModel({ ...parsedString, raw: string, id: id });
    }

    setCreationDate() {
        const creationDate = isoTodayDate();
        const states = [ MATCH_TYPES.COMPLETED, MATCH_TYPES.PRIORITY, MATCH_TYPES.COMPLETION_DATE, MATCH_TYPES.CREATION_DATE ];
        let tokens = this.raw.split(" ");
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
            const newRaw = tokens.join(" ");
            return new TodoModel({ ...this, raw: newRaw, creationDate });
        } else {
            return this;
        }
    }

    setCompleted(completeValue, addCompletionDate = true) {
        let completionDate = undefined;
        if (completeValue === true) {
            let tokens = ["x", ...this.raw.split(" ")];
            if (addCompletionDate) {
                completionDate = isoTodayDate();
                const states = [ MATCH_TYPES.COMPLETED, MATCH_TYPES.PRIORITY ];
                let insertionPoint = 0;
                while (findMatch(states, tokens[insertionPoint]) !== false) {
                    insertionPoint += 1;
                }
                tokens.splice(insertionPoint, 0, completionDate);
            }
            const newRaw = tokens.join(" ");
            return new TodoModel({ ...this, completionDate, completed: completeValue, raw: newRaw });
        } else if (completeValue === false) {
            const states = [ MATCH_TYPES.COMPLETED, MATCH_TYPES.COMPLETION_DATE ];
            const tokens = this.raw.split(" ");
            let completionDateFound = false;
            const newTokens = tokens.filter((token) => {
                const { matchType } = findMatch(states, token);
                if (matchType === MATCH_TYPES.COMPLETION_DATE && !completionDateFound) {
                    completionDateFound = true;
                    return false;
                } else if (matchType === MATCH_TYPES.COMPLETED) {
                    return false;
                } else {
                    return true;
                }
            });
            const newRaw = newTokens.join(" ");
            return new TodoModel({ ...this, completed: completeValue, raw: newRaw });
        } else {
            throw new Error("completeValue must be a boolean");
        }
    }

    toString() {
        return this.raw;
    };

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
        return new TodoListModel([...this.todos, parsedTodo ], this.lineEnding);
    }

    addTodos(todos, addCreationDate = true) {
        const parsedTodos = todos.map((todo) => {
            return addCreationDate ? TodoModel.parse(todo).setCreationDate() : TodoModel.parse(todo);
        });
        return new TodoListModel([...this.todos, ...parsedTodos ], this.lineEnding);
    }

    importTodos(todoFile, addCreationDate = true) {
        const todoStrings = todoFile.split(this.lineEnding).map((todo) => todo.trim()).filter((todo) => !!todo);
        return this.addTodos(todoStrings, addCreationDate);
    }

    show(showState) {
        if (showState === VIEW_STATES.ALL) {
            return this.todos;
        } else if (showState === VIEW_STATES.COMPLETED) {
            const result = this.todos.filter((todo) => {
                return todo.completed === true;
            });
            return result;
        } else if (showState === VIEW_STATES.ACTIVE) {
            const result = this.todos.filter((todo) => {
                return todo.completed === false;
            });
            return result;
        }
    }

    removeCompleted() {
        const newList = this.todos.filter((todo) => todo.completed === false);
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
            } else {
                return todo;
            }
        });
        return new TodoListModel(newList, this.lineEnding);
    }

    toggleTodo(id, addCompletionDate = true) {
        const newList = this.todos.map((todo) => {
            if (id === todo.id) {
                return todo.setCompleted(!todo.completed, addCompletionDate);
            } else {
                return todo;
            }
        });
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

    get notCompleted() {
        return this.show(VIEW_STATES.ACTIVE).length.toString();
    }
}

export { isoTodayDate, TodoModel, TodoListModel };
