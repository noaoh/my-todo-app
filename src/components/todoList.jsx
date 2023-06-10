import { List, ListItem } from '@mui/material';
import { useAtomValue } from 'jotai';
import { TodoItem } from './todoItem.jsx';
import { filteredTodosAtom } from '../atoms';


function TodoList() {
  const filteredTodos = useAtomValue(filteredTodosAtom);

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

export { TodoList };
