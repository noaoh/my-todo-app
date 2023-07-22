import FileSaver from 'file-saver';
import { Grid, TextField, Button, Select, MenuItem } from '@mui/material';
import { useWindowWidth } from './hooks/useWindowWidth';
import { useAtom, useAtomValue } from 'jotai';
import { VIEW_STATES } from './constants'
import { TodoList } from './components/todoList';
import { FileImport } from './components/fileInput';
import { Settings } from './components/settings';
import { addCreationDateAtom, currentTodoAtom, searchQueryAtom, showStateAtom, todosModelAtom, todoListIsEmptyAtom } from './atoms';
import { Header } from './components/header';

function App() {
  const [todosModel, setTodosModel] = useAtom(todosModelAtom);
  const [currentTodo, setCurrentTodo] = useAtom(currentTodoAtom);
  const [showState, setShowState] = useAtom(showStateAtom);
  const addCreationDate = useAtomValue(addCreationDateAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const todoListIsEmpty = useAtomValue(todoListIsEmptyAtom);
  const windowWidth = useWindowWidth();

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
    <>
      <Header />
      <Grid sx={{marginTop: '5px' }} spacing={2} container justifyContent="center" alignItems="center">
        <Grid item>
          <FileImport />
        </Grid>
        {todoListIsEmpty ? null : (
          <Grid item>
              <Button style={{ backgroundColor: '#F5F7FA', color: '#F9703E' }} variant="contained" onClick={exportTodos}>Export</Button>
          </Grid>
        )}
        <Grid item>
          <Settings />
        </Grid>
      </Grid>
      <Grid sx={{marginLeft: '4px', marginTop: '2px' }} spacing={2} container justifyContent="center" alignItem="center">
        <Grid item>
          <TextField sx={{ width: windowWidth * .40 }} type="text" label="Add your todo" value={currentTodo} onKeyUp={onEnterKey} onChange={(e) => setCurrentTodo(e.target.value)} inputProps={{ minLength: 1, color: '#9AA5B1' }} />
        </Grid>
        <Grid item>
          <Button style={{ backgroundColor: '#F9703E', color: 'white' }} variant="contained" onClick={onAddTodo}>Add</Button>
        </Grid>
      </Grid>
      <TodoList />
      {todoListIsEmpty ? null : (
        <Grid sx={{ marginLeft: '23px' }} spacing={2} container justifyContent="center" alignItem="center">
          <Grid item>
            <TextField sx={{ width: windowWidth * .40 }} inputProps={{ color: '#9AA5B1' }} type="text" label="Search your todos" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </Grid>
          <Grid item>
            <Select value={showState} onChange={(e) => setShowState(e.target.value)}>
              <MenuItem value={VIEW_STATES.ALL}>Show all</MenuItem>
              <MenuItem value={VIEW_STATES.ACTIVE}>Show active</MenuItem>
              <MenuItem value={VIEW_STATES.COMPLETED}>Show completed</MenuItem>
            </Select>
          </Grid>
        </Grid>
      )}
      {todoListIsEmpty ? null : (
        <Grid style={{paddingTop: '16px'}} spacing={2} container justifyContent="center" alignItems="center">
          <Grid item>
            <Button style={{ backgroundColor: '#F5F7FA', color: '#F9703E' }} variant="contained" onClick={onRemoveTodos}>Remove completed todos</Button>
          </Grid>
          <Grid item>
            <Button style={{ backgroundColor: '#F5F7FA', color: '#7B8794' }} variant="contained" onClick={onClearTodos}>Clear all todos</Button>
          </Grid>
        </Grid>
      )}
    </>
  );
}

export default App
