import { Grid, Checkbox, TextField, Button } from "@mui/material";

function TodoItem(props) {
  const { id, raw, completed, onTodoCheckboxChange, onTodoTextInputChange, onDeleteTodo, onDeleteKeyOrBackspace } = props;
  return (
    <Grid spacing={1} container justifyContent="center" alignItems="center">
      <Grid item>
        <Checkbox checked={completed} onChange={() => onTodoCheckboxChange(id)} />
      </Grid>
      <Grid item>
        <TextField value={raw} onChange={(e) => onTodoTextInputChange(id, e.target.value)} onKeyUp={(e) => onDeleteKeyOrBackspace(e, raw, id)} />
      </Grid>
      <Grid item>
        <Button variant="contained" onClick={() => onDeleteTodo(id)}>Delete</Button>
      </Grid>
    </Grid>
  );
}

export { TodoItem };
