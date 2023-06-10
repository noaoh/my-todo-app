import FileSaver from 'file-saver';
import { Box, TextField, Button, Select, MenuItem, Grid } from '@mui/material';
import { useAtom, useAtomValue } from 'jotai';
import './App.css'
import { VIEW_STATES } from './constants'
import { TodoList } from './components/todoList';
import { FileImport } from './components/fileInput';
import { Settings } from './components/settings';
import { addCreationDateAtom, currentTodoAtom, searchQueryAtom, showStateAtom, todosModelAtom } from './atoms';

function App() {
  const [todosModel, setTodosModel] = useAtom(todosModelAtom);
  const [currentTodo, setCurrentTodo] = useAtom(currentTodoAtom);
  const [showState, setShowState] = useAtom(showStateAtom);
  const addCreationDate = useAtomValue(addCreationDateAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);

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
          <Settings />
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
      <TodoList />
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
