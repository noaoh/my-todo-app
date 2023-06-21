import { List, ListItem, Typography } from '@mui/material';
import { useAtomValue } from 'jotai';
import { TodoItem } from './todoItem.jsx';
import { filteredTodosAtom, todoListIsEmptyAtom } from '../atoms';


function TodoList() {
  const filteredTodos = useAtomValue(filteredTodosAtom);
  const todoListIsEmpty = useAtomValue(todoListIsEmptyAtom);

  if (todoListIsEmpty) {
    return <Typography color="#1F2933" sx={{ textAlign: 'center' }} variant="h4">Add some todos to your todo list!</Typography>;
  } else if (filteredTodos.length === 0) {
    return <Typography color="#1F2933" sx={{ textAlign: 'center' }} variant="h4">No todos match the filters you have set.</Typography>;
  } else {
    return (
      <List>
          {filteredTodos.map((todo) => {
              return (
                  <ListItem key={todo.id}>
                      <TodoItem key={todo.id} id={todo.id} raw={todo.raw} completed={todo.completed} />
                  </ListItem>
              );
          })}
      </List>
    );
  }
}

export { TodoList };
