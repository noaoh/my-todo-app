import { useState } from 'react'
import { isUNIX, isMacOS, isLinux, isIOS, isAndroid } from 'get-os-name';
import './App.css'
import { VIEW_STATES } from './constants'
import { TodoListModel } from './models/todotxt';

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

function App() {
  const [todosModel, setTodosModel] = useState(new TodoListModel([], osLineEnding));
  const [currentTodo, setCurrentTodo] = useState('');
  const [showState, setShowState] = useState(VIEW_STATES.ALL);

  function onAddTodo() {
    if (currentTodo.length !== 0) {
      const newTodos = todosModel.addTodo(currentTodo);
      setTodosModel(newTodos);
      setCurrentTodo('');
    }
  }

  function onTodoCheckboxChange(id) {
    const newTodos = todosModel.toggleTodo(id);
    setTodosModel(newTodos);
  }

  function onRemoveTodos() {
    const newTodos = todosModel.removeCompleted();
    setTodosModel(newTodos);
  }

  function onTodoTextInputChange(id, text) {
    const newTodos = todosModel.editTodo(id, text);
    setTodosModel(newTodos);
  }

  function exportTodos() {
    const todoListString = todosModel.toString();
    console.log(todoListString);
  }

  return (
    <div className="App">
      <h1>Todos</h1>
      <h2>You currently have {todosModel.notCompleted} todos to complete</h2>
      <div className="card">
        <input type="text" minLength="1" placeholder="Add your todo" value={currentTodo} onChange={(e) => setCurrentTodo(e.target.value)} />
        <button onClick={onAddTodo}>Add</button>
        <TodoList showState={showState} todos={todosModel} onTodoCheckboxChange={onTodoCheckboxChange} onTodoTextInputChange={onTodoTextInputChange} />
        <button onClick={onRemoveTodos}>Remove completed todos</button>
        <button onClick={() => setShowState(VIEW_STATES.ALL)}>Show all</button>
        <button onClick={() => setShowState(VIEW_STATES.ACTIVE)}>Show active</button>
        <button onClick={() => setShowState(VIEW_STATES.COMPLETED)}>Show completed</button>
        <button onClick={exportTodos}>Export</button>
      </div>
    </div>
  );
}

export default App
