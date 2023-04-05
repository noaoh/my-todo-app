import { useState } from 'react'
import './App.css'
import { VIEW_STATES } from './constants'

function TodoItem(props) {
  const { id, name, completed, toggleTodo, editTodo } = props;
  return (
    <li key={id}>
      <input type="checkbox" defaultChecked={completed} id={id} onChange={() => toggleTodo(id)}/>
      <input htmlFor={id} type="text" value={name} onChange={(e) => editTodo(id, e.target.value)}/>
    </li>
  );
}

function TodoList(props) {
  const { todos, toggleTodo, showState, editTodo } = props;
  const filteredTodos = todos.filter((todo) => {
    if (showState === 'all') {
      return true;
    } else if (showState === 'active') {
      return !todo.completed;
    } else if (showState === 'completed') {
      return todo.completed;
    }
  });

  return (
    <ul>
      {filteredTodos.map((todo) => {
        return (
          <TodoItem key={todo.id} id={todo.id} name={todo.name} completed={todo.completed} toggleTodo={toggleTodo} editTodo={editTodo}/>
        );
      })}
    </ul>
  );
}


function App() {
  const [todos, setTodos] = useState([]);
  const [currentTodo, setCurrentTodo] = useState('');
  const [showState, setShowState] = useState(VIEW_STATES.ALL);


  function onAddTodo() {
    if (currentTodo.length !== 0) {
      setTodos([...todos, { id: crypto.randomUUID(), name: currentTodo, completed: false }]);
      setCurrentTodo('');
    }
  }

  function toggleTodo(id) {
    const newTodos = todos.map((todo) => {
      if (todo.id === id) {
        return {
          ...todo,
          completed: !todo.completed,
        };
      }
      return todo;
    });
    setTodos(newTodos);
  }

  function removeTodos() {
    const newTodos = todos.filter((todo) => !todo.completed);
    setTodos(newTodos);
  }

  function editTodo(id, name) {
    const newTodos = todos.map((todo) => {
      if (todo.id === id) {
        return {
          ...todo,
          name: name,
        };
      }
      return todo;
    });
    setTodos(newTodos);
  }

  function exportTodos() {
    const taskList = TaskList.parse(todos.join('\n'));
    console.log(JSON.stringify(taskList, null, 2));
  }

  return (
    <div className="App">
      <h1>Todos</h1>
      <h2>You currently have {todos.filter((todo) => !todo.completed).length.toString()} todos to complete</h2>
      <div className="card">
        <input type="text" minLength="1" placeholder="Add your todo" value={currentTodo} onChange={(e) => setCurrentTodo(e.target.value)} />
        <button onClick={onAddTodo}>Add</button>
        <TodoList todos={todos} editTodo={editTodo} toggleTodo={toggleTodo} showState={showState} />
        <button onClick={removeTodos}>Remove completed todos</button>
        <button onClick={() => setShowState(VIEW_STATES.ALL)}>Show all</button>
        <button onClick={() => setShowState(VIEW_STATES.ACTIVE)}>Show active</button>
        <button onClick={() => setShowState(VIEW_STATES.COMPLETED)}>Show completed</button>
        <button onClick={exportTodos}>Export</button>
      </div>
    </div>
  );
}

export default App
