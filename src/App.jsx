import { useState } from 'react'
import './App.css'
import { VIEW_STATES } from './constants'
import { TodoListModel } from './models/todotxt';

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


function App() {
  const [todosModel, setTodosModel] = useState(new TodoListModel([], "\n"));
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
