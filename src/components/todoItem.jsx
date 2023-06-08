import { Checkbox, TextField, Button } from "@mui/material";

function TodoItem(props) {
  const { id, raw, completed, onTodoCheckboxChange, onTodoTextInputChange, onDeleteTodo, onDeleteKeyOrBackspace } = props;
  return (
    <>
      <Checkbox checked={completed} onChange={() => onTodoCheckboxChange(id)} />
      <TextField value={raw} onChange={(e) => onTodoTextInputChange(id, e.target.value)} onKeyUp={(e) => onDeleteKeyOrBackspace(e, raw, id)} />
      <Button variant="contained" onClick={() => onDeleteTodo}>Delete</Button>
    </>
  );
}

export { TodoItem };
