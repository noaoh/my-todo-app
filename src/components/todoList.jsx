import { List, ListItem, Typography } from '@mui/material';
import { useAtomValue } from 'jotai';
import { TodoItem } from './todoItem.jsx';
import { filteredTodosAtom, todoListIsEmptyAtom, searchQueryAtom } from '../atoms';


function TodoList() {
  const filteredTodos = useAtomValue(filteredTodosAtom);
  const searchQuery = useAtomValue(searchQueryAtom);
  const todoListIsEmpty = useAtomValue(todoListIsEmptyAtom);

  if (todoListIsEmpty) {
    return <Typography sx={{ textAlign: 'center' }} variant="h4">Add some todos to your todo list!</Typography>;
  } else if (filteredTodos.length === 0) {
    return <Typography sx={{ textAlign: 'center' }} variant="h4">{`No todos found for the search '${searchQuery}'.`}</Typography>;
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
