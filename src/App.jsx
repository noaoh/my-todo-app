import FileSaver from 'file-saver';
import { Box, TextField, Button, Select, MenuItem, Grid } from '@mui/material';
import { isUNIX, isMacOS, isLinux, isIOS, isAndroid } from 'get-os-name';
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
  const [searchQuery, setSearchQuery] = useLocalStorage(`${prefix}:searchQuery`, '');

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

  function onRemoveTodos() {
    const newTodos = todosModel.removeCompleted();
    setTodosModel(newTodos);
  }

  function onClearTodos() {
    const newTodos = todosModel.clearTodos();
    setTodosModel(newTodos);
  }

  function exportTodos() {
    const todoListString = todosModel.toString();
    const blob = new Blob([todoListString], {type: 'text/plain'}); 
    FileSaver.saveAs(blob, 'todo.txt');
  }

  return (
    <Box>
      <Grid spacing={2} container justifyContent="center" alignItems="center">
        <Grid item>
          <FileImport todosModel={todosModel} setTodosModel={setTodosModel} />
        </Grid>
        <Grid item>
            <Button variant="contained" onClick={exportTodos}>Export</Button>
        </Grid>
        <Grid item>
          <Settings addCreationDate={addCreationDate} setAddCreationDate={setAddCreationDate} addCompletionDate={addCompletionDate} setAddCompletionDate={setAddCompletionDate} />
        </Grid>
      </Grid>
      <Grid spacing={2} container justifyContent="center" alignItem="center">
        <Grid item>
          <TextField fullWidth type="text" label="Add your todo" value={currentTodo} onKeyUp={onEnterKey} onChange={(e) => setCurrentTodo(e.target.value)} inputProps={{ minLength: 1 }} />
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={onAddTodo}>Add</Button>
        </Grid>
      </Grid>
      <TodoList showState={showState} todosModel={todosModel} setTodosModel={setTodosModel} addCompletionDate={addCompletionDate} searchQuery={searchQuery} />
      <Grid spacing={2} container justifyContent="center" alignItem="center">
        <Grid item>
          <TextField fullWidth type="text" label="Search your todos" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </Grid>
        <Grid item>
          <Select value={showState} onChange={(e) => setShowState(e.target.value)}>
            <MenuItem value={VIEW_STATES.ALL}>Show all</MenuItem>
            <MenuItem value={VIEW_STATES.ACTIVE}>Show active</MenuItem>
            <MenuItem value={VIEW_STATES.COMPLETED}>Show completed</MenuItem>
          </Select>
        </Grid>
      </Grid>
      <Grid spacing={2} container justifyContent="center" alignItems="center">
        <Grid item>
          <Button variant="contained" onClick={onRemoveTodos}>Remove completed todos</Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={onClearTodos}>Clear all todos</Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default App
