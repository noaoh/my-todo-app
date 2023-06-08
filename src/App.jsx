import FileSaver from 'file-saver';
import { isUNIX, isMacOS, isLinux, isIOS, isAndroid } from 'get-os-name';
import { TextField, Button, Select, MenuItem, Typography } from '@mui/material';
import './App.css'
import { VIEW_STATES } from './constants'
import { TodoModel, TodoListModel } from './models/todotxt';
import { TodoList } from './components/todoList';
import { FileImport } from './components/fileInput';
import { Settings } from './components/settings';
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

  function exportTodos() {
    const todoListString = todosModel.toString();
    const blob = new Blob([todoListString], {type: 'text/plain'}); 
    FileSaver.saveAs(blob, 'todo.txt');
  }

  function onDeleteTodo(id) {
    const newTodos = todosModel.removeTodo(id);
    setTodosModel(newTodos);
  }

  function onDeleteKeyOrBackspace(e, text, id) {
    if (e.key === 'Delete' || (e.key === 'Backspace' && text.length === 0)) { 
      onDeleteTodo(id);
    }
  }

  return (
    <div className="App">
      <Settings addCreationDate={addCreationDate} setAddCreationDate={setAddCreationDate} addCompletionDate={addCompletionDate} setAddCompletionDate={setAddCompletionDate} />
      <Typography variant="h3">Todos</Typography>
      <Typography variant="h4">You currently have {todosModel.notCompleted} todos to complete</Typography>
      <div className="card">
        <TextField type="text" label="Add your todo" value={currentTodo} onKeyUp={onEnterKey} onChange={(e) => setCurrentTodo(e.target.value)} inputProps={{ minLength: 1 }} />
        <Button variant="contained" onClick={onAddTodo}>Add</Button>
        <TodoList showState={showState} todos={todosModel} onTodoCheckboxChange={onTodoCheckboxChange} onTodoTextInputChange={onTodoTextInputChange} onDeleteTodo={onDeleteTodo} onDeleteKeyOrBackspace={onDeleteKeyOrBackspace} />
        <Button variant="contained" onClick={onRemoveTodos}>Remove completed todos</Button>
        <Select value={showState} onChange={(e) => setShowState(e.target.value)}>
          <MenuItem value={VIEW_STATES.ALL}>Show all</MenuItem>
          <MenuItem value={VIEW_STATES.ACTIVE}>Show active</MenuItem>
          <MenuItem value={VIEW_STATES.COMPLETED}>Show completed</MenuItem>
        </Select>
        <FileImport todosModel={todosModel} setTodosModel={setTodosModel} />
        <Button variant="contained" onClick={exportTodos}>Export</Button>
      </div>
    </div>
  );
}

export default App
