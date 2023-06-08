import { List, ListItem } from '@mui/material';
import { TodoItem } from './todoItem.jsx';

function TodoList(props) {
  const { todos, showState, onTodoCheckboxChange, onTodoTextInputChange, onDeleteTodo, onDeleteKeyOrBackspace } = props;
  const filteredTodos = todos.show(showState);

  return (
    <List>
        {filteredTodos.map((todo) => {
            return (
                <ListItem key={todo.id}>
                    <TodoItem key={todo.id} id={todo.id} raw={todo.raw} completed={todo.completed} onTodoCheckboxChange={onTodoCheckboxChange} onTodoTextInputChange={onTodoTextInputChange} onDeleteTodo={onDeleteTodo} onDeleteKeyOrBackspace={onDeleteKeyOrBackspace} />
                </ListItem>
            );
        })}
    </List>
  );
}

export { TodoList };
