import { List, ListItem } from '@mui/material';
import { TodoItem } from './todoItem.jsx';

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function TodoList(props) {
  const { todosModel, setTodosModel, showState, addCompletionDate, searchQuery } = props;
  const filterRegex = new RegExp(`.*${escapeRegExp(searchQuery)}.*`);
  const filteredTodos = todosModel.show(showState).filter((todo) => filterRegex.test(todo.raw));

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
