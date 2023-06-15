import {
  beforeEach, afterEach, describe, it, vi,
} from 'vitest';
import * as todotxt from '../todotxt';
import { VIEW_STATES } from '../../constants';

describe('todotxt', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const date = new Date(2023, 3, 13);
    vi.setSystemTime(date);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('TodoModel', () => {
    it('should parse a todo string', ({ expect }) => {
      const input = 'x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      expect(todo.completed).toBe(true);
      expect(todo.priority).toBe('A');
      expect(todo.creationDate).toBe('2021-01-02');
      expect(todo.completionDate).toBe('2021-01-01');
      expect(todo.text).toBe('meow asdf sdf');
      expect(todo.contexts).toEqual(['test3', 'test5']);
      expect(todo.projects).toEqual(['test1', 'test4', 'test6']);
      expect(todo.extras).toEqual({ test1: '123', test2: '456' });
      expect(todo.raw).toBe(input);
      expect(typeof todo.id).toBe('string');
    });

    it('should be able to set completed to false with priority and creation date present', ({ expect }) => {
      const input = 'x (A) 2021-01-03 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCompleted(false);
      expect(newTodo.completed).toBe(false);
      expect(newTodo.raw).toBe('(A) 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456');
      expect(newTodo.id).toBe(todo.id);
    });

    it('should be able to set completed to false with priority present', ({ expect }) => {
      const input = 'x (A) 2021-01-03 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCompleted(false);
      expect(newTodo.completed).toBe(false);
      expect(newTodo.raw).toBe('(A) meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456');
      expect(newTodo.id).toBe(todo.id);
    });

    it('should be able to set completed to false with neither priority nor creation date present', ({ expect }) => {
      const input = 'x meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCompleted(false);
      expect(newTodo.completed).toBe(false);
      expect(newTodo.raw).toBe('meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456');
      expect(newTodo.id).toBe(todo.id);
    });

    it('should be able to set completed to true with priority and creation date present', ({ expect }) => {
      const input = '(A) 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCompleted(true);
      expect(newTodo.completed).toBe(true);
      expect(newTodo.completionDate).toBe('2023-04-13');
      const raw = 'x (A) 2023-04-13 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      expect(newTodo.raw).toBe(raw);
      expect(newTodo.id).toBe(todo.id);
    });

    it('should be able to set completed to true with priority present', ({ expect }) => {
      const input = '(A) meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCompleted(true, true);
      expect(newTodo.completed).toBe(true);
      expect(newTodo.completionDate).toBe('2023-04-13');
      expect(newTodo.raw).toBe('x (A) 2023-04-13 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456');
      expect(newTodo.id).toBe(todo.id);
    });

    it('should be able to set completed to true with creation date present', ({ expect }) => {
      const input = '2023-01-01 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCompleted(true);
      expect(newTodo.completed).toBe(true);
      expect(newTodo.completionDate).toBe('2023-04-13');
      const raw = 'x 2023-04-13 2023-01-01 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      expect(newTodo.raw).toBe(raw);
      expect(newTodo.id).toBe(todo.id);
    });

    it('should be able to set completed to true with neither priority nor creation date present', ({ expect }) => {
      const input = 'meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCompleted(true);
      expect(newTodo.completed).toBe(true);
      expect(newTodo.completionDate).toBe('2023-04-13');
      expect(newTodo.raw).toBe('x 2023-04-13 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456');
      expect(newTodo.id).toBe(todo.id);
    });

    it('should not set a creation date if one is already present', ({ expect }) => {
      const input = 'x 2023-04-16 2023-04-13 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCreationDate();
      expect(newTodo.creationDate).toBe('2023-04-13');
      const raw = 'x 2023-04-16 2023-04-13 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      expect(newTodo.raw).toBe(raw);
    });

    // eslint-disable-next-line max-len
    it('should be able to set completed to true and not add a completion date with priority and creation date present', ({ expect }) => {
      const input = '(A) 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCompleted(true, false);
      expect(newTodo.completed).toBe(true);
      expect(newTodo.raw).toBe('x (A) 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456');
      expect(newTodo.id).toBe(todo.id);
    });

    it('should be able to set completed to true and not add a completion date with priority present', ({ expect }) => {
      const input = '(A) meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCompleted(true, false);
      expect(newTodo.completed).toBe(true);
      expect(newTodo.raw).toBe('x (A) meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456');
      expect(newTodo.id).toBe(todo.id);
    });

    it('should be able to set completed to true and not add a completion date with creation date', ({ expect }) => {
      const input = '2023-01-01 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCompleted(true, false);
      expect(newTodo.completed).toBe(true);
      expect(newTodo.raw).toBe('x 2023-01-01 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456');
      expect(newTodo.id).toBe(todo.id);
    });

    // eslint-disable-next-line max-len
    it('should be able to set completed to true and not add a completion date without priority or creation date', ({ expect }) => {
      const input = 'meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCompleted(true, false);
      expect(newTodo.completed).toBe(true);
      expect(newTodo.raw).toBe('x meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456');
      expect(newTodo.id).toBe(todo.id);
    });

    // eslint-disable-next-line max-len
    it('should be able to set a creation date if completion, priority and completion date are present', ({ expect }) => {
      const input = 'x (A) 2023-04-16 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCreationDate();
      expect(newTodo.creationDate).toBe('2023-04-13');
      const raw = 'x (A) 2023-04-16 2023-04-13 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      expect(newTodo.raw).toBe(raw);
    });

    it('should be able to set a creation date if completion and completion date are present', ({ expect }) => {
      const input = 'x 2023-04-16 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCreationDate();
      expect(newTodo.creationDate).toBe('2023-04-13');
      const raw = 'x 2023-04-16 2023-04-13 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      expect(newTodo.raw).toBe(raw);
    });

    it('should be able to set a creation date if priority is present', ({ expect }) => {
      const input = '(A) meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const newTodo = todo.setCreationDate();
      expect(newTodo.creationDate).toBe('2023-04-13');
      expect(newTodo.raw).toBe('(A) 2023-04-13 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456');
    });

    it('should be able to return as string', ({ expect }) => {
      const input = 'x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const todoString = todo.toString();
      expect(todoString).toBe(input);
    });

    it('should be able to return todo as JSON', ({ expect }) => {
      const input = 'x (A) 2021-01-02 2021-01-01 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const todo = todotxt.TodoModel.parse(input);
      const todoJSON = JSON.stringify(todo);
      // eslint-disable-next-line max-len
      const expectedJSON = `{"id":"${todo.id}","raw":"${input}","completed":true,"priority":"A","creationDate":"2021-01-01","completionDate":"2021-01-02","text":"meow asdf sdf","contexts":["test3","test5"],"projects":["test1","test4","test6"],"extras":{"test1":"123","test2":"456"}}`;
      expect(JSON.parse(todoJSON)).toStrictEqual(JSON.parse(expectedJSON));
    });
  });

  describe('TodoListModel', () => {
    it('should be able to add todos', ({ expect }) => {
      const inputA = 'x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const inputB = 'meow';
      const list = new todotxt.TodoListModel([], '\n');
      const listA = list.addTodo(inputA);
      const listB = listA.addTodo(inputB);
      expect(listB.todos.length).toBe(2);
      expect(listB.todos[0].raw).toBe(inputA);
      expect(listB.todos[1].raw).toBe(`2023-04-13 ${inputB}`);
    });

    it('should be able to add todos without a creation date', ({ expect }) => {
      const inputA = 'x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const inputB = 'meow';
      const list = new todotxt.TodoListModel([], '\n');
      const listA = list.addTodo(inputA);
      const listB = listA.addTodo(inputB, false);
      expect(listB.todos.length).toBe(2);
      expect(listB.todos[0].raw).toBe(inputA);
      expect(listB.todos[1].raw).toBe(inputB);
    });

    it('should be able to show state', ({ expect }) => {
      const inputA = 'x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const inputB = 'meow';
      const list = new todotxt.TodoListModel([], '\n');
      const listA = list.addTodo(inputA);
      const listB = listA.addTodo(inputB);
      expect(listB.show(VIEW_STATES.ALL).length).toBe(2);
      expect(listB.show(VIEW_STATES.COMPLETED).length).toBe(1);
      expect(listB.show(VIEW_STATES.ACTIVE).length).toBe(1);
    });

    it('should be able to remove todos', ({ expect }) => {
      const inputA = 'x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      // eslint-disable-next-line max-len
      const inputB = 'x (A) 2021-01-01 2021-01-02 yinkel @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const inputC = 'meow';
      const list = new todotxt.TodoListModel([], '\n');
      const listA = list.addTodo(inputA);
      const listB = listA.addTodo(inputB);
      const listC = listB.addTodo(inputC);
      const listD = listC.removeCompleted();
      expect(listD.todos.length).toBe(1);
      expect(listD.todos[0].raw).toBe(`2023-04-13 ${inputC}`);
    });

    it('should be able to edit todos', ({ expect }) => {
      const inputA = 'x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      // eslint-disable-next-line max-len
      const inputB = 'x (A) 2021-01-01 2021-01-02 yinkel @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const inputC = 'x (B) 2021-01-01 2021-01-02 meow';
      const list = new todotxt.TodoListModel([], '\n');
      const listA = list.addTodo(inputA);
      const listB = listA.addTodo(inputB);
      const listC = listB.addTodo(inputC);
      const listD = listC.editTodo(listC.todos[0].id, 'meow');
      expect(listD.todos.length).toBe(3);
      expect(listD.todos[0].raw).toBe('meow');
      expect(listD.todos[1].raw).toBe(inputB);
      expect(listD.todos[2].raw).toBe(inputC);
    });

    it('should be able to set a todo to completed', ({ expect }) => {
      const todoA = '(A) Thank Mom for the meatballs @phone';
      const todoB = '(B) Schedule Goodwill pickup +GarageSale @phone';
      const todoC = 'Post signs around the neighborhood +GarageSale';
      const listA = new todotxt.TodoListModel([], '\n');
      const listB = listA.addTodos([todoA, todoB, todoC], false);
      const listC = listB.toggleTodo(listB.todos[0].id, false);
      expect(listC.todos.length).toBe(3);
      expect(listC.todos[2].raw).toBe('x (A) Thank Mom for the meatballs @phone');
    });

    it('should be able set a todo to not completed', ({ expect }) => {
      const todoA = '(A) Thank Mom for the meatballs @phone';
      const todoB = '(B) Schedule Goodwill pickup +GarageSale @phone';
      const todoC = 'x Post signs around the neighborhood +GarageSale';
      const todoD = 'x (A) Eat da spaghetti @phone'
      const listA = new todotxt.TodoListModel([], '\n');
      const listB = listA.addTodos([todoA, todoB, todoC, todoD]);
      const listC = listB.toggleTodo(listB.todos[3].id, false);
      expect(listC.todos.length).toBe(4);
      expect(listC.todos[2].raw).toBe('(A) Eat da spaghetti @phone');
    });

    it('should be able to convert to string', ({ expect }) => {
      const inputA = 'x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      // eslint-disable-next-line max-len
      const inputB = 'x (A) 2021-01-01 2021-01-02 yinkel @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const inputC = 'x (A) 2023-04-16 2023-04-13 meow';
      const list = new todotxt.TodoListModel([], '\n');
      const listA = list.addTodo(inputA);
      const listB = listA.addTodo(inputB);
      const listC = listB.addTodo(inputC);
      const listString = listC.toString();
      expect(listString).toBe(`${inputA}\n${inputB}\n${inputC}\n`);
    });

    it('should be able to add multiple todos at once, adding a creation date', ({ expect }) => {
      const inputA = 'meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const inputB = 'yinkel @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const inputC = 'x meow';
      const list = new todotxt.TodoListModel([], '\n');
      const listA = list.addTodos([inputA, inputB, inputC]);
      expect(listA.todos.length).toBe(3);
      expect(listA.todos[0].raw).toBe(`2023-04-13 ${inputA}`);
      expect(listA.todos[1].raw).toBe(`2023-04-13 ${inputB}`);
      expect(listA.todos[2].raw).toBe('x 2023-04-13 meow');
    });

    it('should be able to add multiple todos at once, without adding a creation date', ({ expect }) => {
      const inputA = 'meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const inputB = 'yinkel @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const inputC = 'x meow';
      const list = new todotxt.TodoListModel([], '\n');
      const listA = list.addTodos([inputA, inputB, inputC], false);
      expect(listA.todos.length).toBe(3);
      expect(listA.todos[0].raw).toBe(inputA);
      expect(listA.todos[1].raw).toBe(inputB);
      expect(listA.todos[2].raw).toBe(inputC);
    });

    it('should be able to add multiple todos in a list that already has them', ({ expect }) => {
      const inputA = 'meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const inputB = 'yinkel @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
      const inputC = 'x meow';
      const inputD = 'x (A) 2023-04-13 2023-04-13 meow';
      const list = new todotxt.TodoListModel([], '\n');
      const listA = list.addTodo(inputA);
      const listB = listA.addTodos([inputB, inputC, inputD]);
      expect(listB.todos.length).toBe(4);
      expect(listB.todos[0].raw).toBe(`2023-04-13 ${inputA}`);
      expect(listB.todos[1].raw).toBe(`2023-04-13 ${inputB}`);
      expect(listB.todos[2].raw).toBe('x 2023-04-13 meow');
      expect(listB.todos[3].raw).toBe(inputD);
    });

    it('should be able to import todos from a file with \'\n\' line endings', ({ expect }) => {
      // eslint-disable-next-line max-len
      const input = '(A) Thank Mom for the meatballs @phone\n(B) Schedule Goodwill pickup +GarageSale @phone\nPost signs around the neighborhood +GarageSale @GroceryStore Eskimo pies';
      const list = new todotxt.TodoListModel([], '\n');
      const listA = list.importTodos(input, false);
      expect(listA.todos.length).toBe(3);
      expect(listA.todos[0].raw).toBe('(A) Thank Mom for the meatballs @phone');
      expect(listA.todos[1].raw).toBe('(B) Schedule Goodwill pickup +GarageSale @phone');
      expect(listA.todos[2].raw).toBe('Post signs around the neighborhood +GarageSale @GroceryStore Eskimo pies');
    });

    it('should to able import todos from a file with \'\n\' line endings and a trailing newline', ({ expect }) => {
      // eslint-disable-next-line max-len
      const input = '(A) Thank Mom for the meatballs @phone\n(B) Schedule Goodwill pickup +GarageSale @phone\nPost signs around the neighborhood +GarageSale @GroceryStore Eskimo pies\n';
      const list = new todotxt.TodoListModel([], '\n');
      const listA = list.importTodos(input, false);
      expect(listA.todos.length).toBe(3);
      expect(listA.todos[0].raw).toBe('(A) Thank Mom for the meatballs @phone');
      expect(listA.todos[1].raw).toBe('(B) Schedule Goodwill pickup +GarageSale @phone');
      expect(listA.todos[2].raw).toBe('Post signs around the neighborhood +GarageSale @GroceryStore Eskimo pies');
    });

    it('should be able to import todos from a file with \'\r\n\' line endings', ({ expect }) => {
      // eslint-disable-next-line max-len
      const input = '(A) Thank Mom for the meatballs @phone\r\n(B) Schedule Goodwill pickup +GarageSale @phone\r\nPost signs around the neighborhood +GarageSale @GroceryStore Eskimo pies';
      const list = new todotxt.TodoListModel([], '\r\n');
      const listA = list.importTodos(input, false);
      expect(listA.todos.length).toBe(3);
      expect(listA.todos[0].raw).toBe('(A) Thank Mom for the meatballs @phone');
      expect(listA.todos[1].raw).toBe('(B) Schedule Goodwill pickup +GarageSale @phone');
      expect(listA.todos[2].raw).toBe('Post signs around the neighborhood +GarageSale @GroceryStore Eskimo pies');
    });

    it('should be able to import todos from a file with \'\r\n\' line endings and a trailing newline', ({ expect }) => {
      // eslint-disable-next-line max-len
      const input = '(A) Thank Mom for the meatballs @phone\r\n(B) Schedule Goodwill pickup +GarageSale @phone\r\nPost signs around the neighborhood +GarageSale @GroceryStore Eskimo pies\r\n';
      const list = new todotxt.TodoListModel([], '\r\n');
      const listA = list.importTodos(input, false);
      expect(listA.todos.length).toBe(3);
      expect(listA.todos[0].raw).toBe('(A) Thank Mom for the meatballs @phone');
      expect(listA.todos[1].raw).toBe('(B) Schedule Goodwill pickup +GarageSale @phone');
      expect(listA.todos[2].raw).toBe('Post signs around the neighborhood +GarageSale @GroceryStore Eskimo pies');
    });
  });

  it('should be able to remove a todo when only one is present', ({ expect }) => {
    const input = 'x (A) 2021-01-02 2021-01-01 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
    const todo = todotxt.TodoModel.parse(input);
    const todoList = new todotxt.TodoListModel([todo], '\n');
    const newTodoList = todoList.removeTodo(todo.id);
    expect(newTodoList.todos.length).toBe(0);
  });

  it('should be able to remove a todo when multiple todos are present', ({ expect }) => {
    const inputA = 'meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
    const inputB = 'yinkel @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
    const inputC = 'x meow';
    const inputD = 'x (A) 2023-04-13 2023-04-13 meow';
    const list = new todotxt.TodoListModel([], '\n').addTodos([inputA, inputB, inputC, inputD], false);
    const { id } = list.todos[1];
    const newList = list.removeTodo(id);
    expect(newList.todos.length).toBe(3);
  });

  it('should be able to clear todos', ({ expect }) => {
    const inputA = 'meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
    const inputB = 'yinkel @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
    const inputC = 'x meow';
    const inputD = 'x (A) 2023-04-13 2023-04-13 meow';
    const list = new todotxt.TodoListModel([], '\n').addTodos([inputA, inputB, inputC, inputD], false);
    const newList = list.clearTodos();
    expect(newList.todos.length).toBe(0);
  });

  it('should return isEmpty as true if there are no todos', ({ expect }) => {
    const list = new todotxt.TodoListModel([], '\n');
    expect(list.isEmpty).toBe(true);
  });

  it('should return isEmpty as false if there are todos', ({ expect }) => {
    const inputA = 'meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
    const inputB = 'yinkel @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456';
    const inputC = 'x meow';
    const inputD = 'x (A) 2023-04-13 2023-04-13 meow';
    const list = new todotxt.TodoListModel([], '\n').addTodos([inputA, inputB, inputC, inputD], false);
    expect(list.isEmpty).toBe(false);
  });
});
