import { VIEW_STATES } from "../constants.js";
import { parseTodoTxt } from "./parser.js";


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
        this.id = id || crypto.randomUUID();
    }

    static parse(string, id) {
        const parsedString = parseTodoTxt(string);
        return new TodoModel({ ...parsedString, raw: string, id: id });
    }

    setCompleted(completeValue) {
        if (completeValue === true) {
            return new TodoModel({ ...this, completed: completeValue, raw: "x " + this.raw });
        } else if (completeValue === false) {
            return new TodoModel({ ...this, completed: completeValue, raw: this.raw.slice(2) });
        } else {
            throw new Error("completeValue must be a boolean");
        }
    }

    toString() {
        return this.raw;
    };
}

class TodoListModel {
    constructor(todos, lineEnding) {
        this.todos = todos;
        this.lineEnding = lineEnding;
    }

    addTodo(todo) {
        const parsedTodo = TodoModel.parse(todo);
        return new TodoListModel([...this.todos, parsedTodo ], this.lineEnding);
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

    toggleTodo(id) {
        const newList = this.todos.map((todo) => {
            if (id === todo.id) {
                return todo.setCompleted(!todo.completed);
            } else {
                return todo;
            }
        });
        return new TodoListModel(newList, this.lineEnding);
    }
    
    toString() {
        return this.todos.map((todo) => todo.toString()).join(this.lineEnding) + this.lineEnding;
    }

    get notCompleted() {
        return this.show(VIEW_STATES.ACTIVE).length.toString();
    }
}

export { TodoModel, TodoListModel };
