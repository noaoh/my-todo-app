import { useState } from 'react'
import FileSaver from 'file-saver';
import { isUNIX, isMacOS, isLinux, isIOS, isAndroid } from 'get-os-name';
import './App.css'
import { VIEW_STATES } from './constants'
import { TodoModel, TodoListModel } from './models/todotxt';
import { useLocalStorage } from './hooks/useLocalStorage';

function getOsLineEndings() {
  // UNIX operating systems use '\n' to end a line
  // Windows and other operating systems use '\r\n' to end a line
  // This matters for the output of our todo.txt file
  if (isUNIX() || isMacOS() | isLinux() || isIOS() || isAndroid()) {
    return "\n";
  } else {
    return "\r\n";
  }
}

function TodoItem(props) {
  const { id, raw, completed, onTodoCheckboxChange, onTodoTextInputChange } = props;
  return (
    <li key={id}>
      <input type="checkbox" checked={completed} id={id} onChange={() => onTodoCheckboxChange(id)}/>
      <input htmlFor={id} type="text" value={raw} onChange={(e) => onTodoTextInputChange(id, e.target.value)}/>
    </li>
  );
}

function TodoList(props) {
  const { todos, showState, onTodoCheckboxChange, onTodoTextInputChange } = props;
  const filteredTodos = todos.show(showState);

  return (
    <ul>
      {filteredTodos.map((todo) => {
        return (
          <TodoItem key={todo.id} id={todo.id} raw={todo.raw} completed={todo.completed} onTodoCheckboxChange={onTodoCheckboxChange} onTodoTextInputChange={onTodoTextInputChange} />
        );
      })}
    </ul>
  );
}

const osLineEnding = getOsLineEndings();

const todoListInitializer = (value) => {
  const { todos } = value;
  const todoList = todos.map((todo) => {
    return new TodoModel(todo);
  });

  return new TodoListModel(todoList, osLineEnding);
}

function App() {
  const prefix = 'todotxtapp';
  const [todosModel, setTodosModel] = useLocalStorage(`${prefix}:todosModel`, { todos: []}, todoListInitializer);
  const [currentTodo, setCurrentTodo] = useLocalStorage(`${prefix}:currentTodo`, '');
  const [showState, setShowState] = useLocalStorage(`${prefix}:showState`, VIEW_STATES.ALL);
  const [addCreationDate, setAddCreationDate] = useLocalStorage(`${prefix}:addCreationDate`, true);
  const [addCompletionDate, setAddCompletionDate] = useLocalStorage(`${prefix}:addCompletionDate`, true);

  function onAddTodo() {
    if (currentTodo.length !== 0) {
      const newTodos = todosModel.addTodo(currentTodo, addCreationDate);
      setTodosModel(newTodos);
      setCurrentTodo('');
    }
  }

  function onEnterKey(e) {
    if (e.key === 'Enter') {
      onAddTodo();
    }
  }

  function onTodoCheckboxChange(id) {
    const newTodos = todosModel.toggleTodo(id, addCompletionDate);
    setTodosModel(newTodos);
  }

  function onRemoveTodos() {
    const newTodos = todosModel.removeCompleted();
    setTodosModel(newTodos);
  }

  function onTodoTextInputChange(id, text) {
    const newTodos = todosModel.editTodo(id, text, addCompletionDate);
    setTodosModel(newTodos);
  }

  function onImportTodos(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target.result;
      const newTodos = todosModel.importTodos(contents);
      setTodosModel(newTodos);
    };
    reader.readAsText(file);
  }

  function exportTodos() {
    const todoListString = todosModel.toString();
    const blob = new Blob([todoListString], {type: 'text/plain'}); 
    FileSaver.saveAs(blob, 'todo.txt');
  }

  return (
    <div className="App">
      <h1>Todos</h1>
      <h2>You currently have {todosModel.notCompleted} todos to complete</h2>
      <div className="card">
        <input type="text" minLength="1" placeholder="Add your todo" value={currentTodo} onKeyUp={onEnterKey} onChange={(e) => setCurrentTodo(e.target.value)} />
        <button onClick={onAddTodo}>Add</button>
        <TodoList showState={showState} todos={todosModel} onTodoCheckboxChange={onTodoCheckboxChange} onTodoTextInputChange={onTodoTextInputChange} />
        <button onClick={onRemoveTodos}>Remove completed todos</button>
        <label htmlFor="selectShowState">Show todos:</label>
        <select id="selectShowState" value={showState} onChange={(e) => setShowState(e.target.value)}>
          <option value={VIEW_STATES.ALL}>Show all</option>
          <option value={VIEW_STATES.ACTIVE}>Show active</option>
          <option value={VIEW_STATES.COMPLETED}>Show completed</option>
        </select>
        <label htmlFor="addCreationDate">Add creation date upon todo creation </label>
        <input id="addCreationDate" type="checkbox" checked={addCreationDate} onChange={() => setAddCreationDate(!addCreationDate)} />
        <label htmlFor="addCompletionDate">Add completion date upon todo completion </label>
        <input id="addCompletionDate" type="checkbox" checked={addCompletionDate} onChange={() => setAddCompletionDate(!addCompletionDate)} />
        <br />
        <label htmlFor="importTodos">Import file: </label>
        <input id="importTodos" accept="text/plain" type="file" onChange={onImportTodos} />
        <button onClick={exportTodos}>Export</button>
      </div>
    </div>
  );
}

export default App
