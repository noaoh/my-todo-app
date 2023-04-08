import { describe, it } from "vitest";
import { TodoModel, TodoListModel } from "../todotxt";
import { VIEW_STATES } from "../../constants";

describe("todotxt", () => {
    describe("TodoModel", () => {
        it("should parse a todo string", ({ expect }) => {
            const input = "x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const todo = TodoModel.parse(input);
            expect(todo.completed).toBe(true);
            expect(todo.priority).toBe("A");
            expect(todo.creationDate).toBe("2021-01-02");
            expect(todo.completionDate).toBe("2021-01-01");
            expect(todo.text).toBe("meow asdf sdf");
            expect(todo.contexts).toEqual(["test3", "test5"]);
            expect(todo.projects).toEqual(["test1", "test4", "test6"]);
            expect(todo.extras).toEqual({ test1: "123", test2: "456" });
            expect(todo.raw).toBe(input);
            expect(typeof todo.id).toBe("string");
        });

        it("should be able to set completed to false", ({ expect }) => {
            const input = "x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const todo = TodoModel.parse(input);
            const newTodo = todo.setCompleted(false); 
            expect(newTodo.completed).toBe(false);
            expect(newTodo.raw).toBe("(A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456");
            expect(newTodo.id).toBe(todo.id);
        });

        it("should be able to set completed to true", ({ expect }) => {
            const input = "(A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const todo = TodoModel.parse(input);
            const newTodo = todo.setCompleted(true); 
            expect(newTodo.completed).toBe(true);
            expect(newTodo.raw).toBe("x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456");
            expect(newTodo.id).toBe(todo.id);
        });

        it("should be able to return as string", ({ expect }) => {
            const input = "x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const todo = TodoModel.parse(input);
            const todoString = todo.toString();
            expect(todoString).toBe(input);
        });
    });

    describe("TodoListModel", () => {
        it("should be able to add todos", ({ expect }) => {
            const inputA = "x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const inputB = "meow";
            const list = new TodoListModel([], "\n");
            const listA = list.addTodo(inputA);
            const listB = listA.addTodo(inputB);
            expect(listB.todos.length).toBe(2);
            expect(listB.todos[0].raw).toBe(inputA);
            expect(listB.todos[1].raw).toBe(inputB);
        });

        it("should be able to show state", ({ expect }) => {
            const inputA = "x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const inputB = "meow";
            const list = new TodoListModel([], "\n");
            const listA = list.addTodo(inputA);
            const listB = listA.addTodo(inputB);
            expect(listB.show(VIEW_STATES.ALL).length).toBe(2);
            expect(listB.show(VIEW_STATES.COMPLETED).length).toBe(1);
            expect(listB.show(VIEW_STATES.ACTIVE).length).toBe(1);
        });

        it("should be able to remove todos", ({ expect }) => {
            const inputA = "x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const inputB = "x (A) 2021-01-01 2021-01-02 yinkel @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const inputC = "meow";
            const list = new TodoListModel([], "\n");
            const listA = list.addTodo(inputA);
            const listB = listA.addTodo(inputB);
            const listC = listB.addTodo(inputC);
            const listD = listC.removeCompleted();
            expect(listD.todos.length).toBe(1);
            expect(listD.todos[0].raw).toBe(inputC);
        });

        it("should be able to edit todos", ({ expect }) => {
            const inputA = "x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const inputB = "x (A) 2021-01-01 2021-01-02 yinkel @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const inputC = "x (B) meow";
            const list = new TodoListModel([], "\n");
            const listA = list.addTodo(inputA);
            const listB = listA.addTodo(inputB);
            const listC = listB.addTodo(inputC);
            const listD = listC.editTodo(listC.todos[0].id, "meow");
            expect(listD.todos.length).toBe(3);
            expect(listD.todos[0].raw).toBe("meow");
            expect(listD.todos[1].raw).toBe(inputB);
            expect(listD.todos[2].raw).toBe(inputC);
        });

        it("should be able to toggle todos", ({ expect }) => {
            const inputA = "x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const inputB = "x (A) 2021-01-01 2021-01-02 yinkel @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const inputC = "meow";
            const list = new TodoListModel([], "\n");
            const listA = list.addTodo(inputA);
            const listB = listA.addTodo(inputB);
            const listC = listB.addTodo(inputC);
            const listD = listC.toggleTodo(listC.todos[1].id);
            const listE = listD.toggleTodo(listD.todos[2].id);
            expect(listE.todos.length).toBe(3);
            expect(listE.todos[0].completed).toBe(true);
            expect(listE.todos[1].completed).toBe(false);
            expect(listE.todos[2].completed).toBe(true);
        });

        it("should be able to convert to string", ({ expect }) => {
            const inputA = "x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const inputB = "x (A) 2021-01-01 2021-01-02 yinkel @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const inputC = "meow";
            const list = new TodoListModel([], "\n");
            const listA = list.addTodo(inputA);
            const listB = listA.addTodo(inputB);
            const listC = listB.addTodo(inputC);
            const listString = listC.toString();
            expect(listString).toBe(inputA + "\n" + inputB + "\n" + inputC + "\n");
        });

        it("should have a computed notCompleted property", ({ expect }) => {
            const inputA = "x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const inputB = "x (A) 2021-01-01 2021-01-02 yinkel @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const inputC = "meow";
            const list = new TodoListModel([], "\n");
            const listA = list.addTodo(inputA);
            const listB = listA.addTodo(inputB);
            const listC = listB.addTodo(inputC);
            expect(listC.notCompleted).toBe('1');
        });

    });
});
