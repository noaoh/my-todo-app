import { useState } from 'react';
import { Box, Checkbox, TextField, Button } from '@mui/material';
import { useAtom, useAtomValue } from 'jotai';
import { todosModelAtom, addCompletionDateAtom } from '../atoms';

function TodoItem(props) {
  const [todosModel, setTodosModel] = useAtom(todosModelAtom);
  const addCompletionDate = useAtomValue(addCompletionDateAtom);
  const [focus, setFocus] = useState(false);
  const { id, raw, completed } = props;

  function onTodoCheckboxChange(id) {
    const newTodos = todosModel.toggleTodo(id, addCompletionDate);
    setTodosModel(newTodos);
  }

  function onTodoTextInputChange(id, text) {
    const newTodos = todosModel.editTodo(id, text, addCompletionDate);
    setTodosModel(newTodos);
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

  function onFocus() {
    setFocus(true);
  }

  function onBlur() {
    setFocus(false);
  }

  return (
    <Box display='flex' alignItems='center' justifyContent='center' height={'100%'} width={'100%'} gap={1}>
        <Checkbox checked={completed} onChange={() => onTodoCheckboxChange(id)} />
        <TextField disabled={completed} id={id} onFocus={onFocus} onBlur={onBlur} InputProps={{style: { fontWeight: focus === true ? 425 : 400 }}} inputProps={{ style: { textDecoration: completed === true ? 'line-through' : null, color: '#1F2933' } }} value={raw} onChange={(e) => onTodoTextInputChange(id, e.target.value)} onKeyUp={(e) => onDeleteKeyOrBackspace(e, raw, id)} />
        <Button variant='contained' style={{ backgroundColor: '#F5F7FA', color: '#F9703E' }} onClick={() => onDeleteTodo(id)}>Delete</Button>
    </Box>
  );
}

export { TodoItem };
