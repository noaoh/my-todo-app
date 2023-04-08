import { describe, it } from "vitest";
import { parseReducers, parseMatchers, parseState, parseTodoTxt } from "../parser";
import { initialTodoState, MATCH_TYPES } from "../../constants";

describe("parser", () => {
    describe("parserReducers", () => {
        it("should apply the completed state", ({ expect }) => {
            const state = initialTodoState;
            const action = {
                completed: true,
            };
            const result = parseReducers.completed(state, action);
            expect(result.completed).toBe(true);
        });

        it("should apply the priority state", ({ expect }) => {
            const state = initialTodoState;
            const action = {
                priority: "A",
            };
            const result = parseReducers.priority(state, action);
            expect(result.priority).toBe("A");
        });

        it("should apply the completionDate state", ({ expect }) => {
            const state = initialTodoState;
            const action = {
                completionDate: "2021-01-01",
            };
            const result = parseReducers.completionDate(state, action);
            expect(result.completionDate).toBe("2021-01-01");
        });

        it("should apply the creationDate state", ({ expect }) => {
            const state = {
                completed: false,
                priority: "",
                completionDate: "",
                creationDate: "",
                text: "",
                contexts: [],
                projects: [],
                extras: {},
            };
            const action = {
                creationDate: "2021-01-01",
            };
            const result = parseReducers.creationDate(state, action);
            expect(result.creationDate).toBe("2021-01-01");
        });

        it("should apply the text state when text is empty string", ({ expect }) => {
            const state = {
                completed: false,
                priority: "",
                completionDate: "",
                creationDate: "",
                text: "",
                contexts: [],
                projects: [],
                extras: {},
            };
            const action = {
                text: "test",
            };
            const result = parseReducers.text(state, action);
            expect(result.text).toBe("test");
        });

        it("should apply the text state when text is non-empty string", ({ expect }) => {
            const state = {
                ...initialTodoState,
                text: "test",
            };
            const action = {
                text: "test",
            };
            const result = parseReducers.text(state, action);
            expect(result.text).toBe("test test");
        });

        it("should apply the context state to empty array", ({ expect }) => {
            const state = initialTodoState;
            const action = {
                context: "test",
            };
            const result = parseReducers.context(state, action);
            expect(result.contexts).toEqual(["test"]);
        });

        it("should apply the context state to non-empty array", ({ expect }) => {
            const state = {
                ...initialTodoState,
                contexts: [ "test" ],
            };
            const action = {
                context: "test",
            };
            const result = parseReducers.context(state, action);
            expect(result.contexts).toEqual(["test", "test"]);
        });

        it("should apply the project state to empty array", ({ expect }) => {
            const state = initialTodoState;
            const action = {
                project: "test",
            };
            const result = parseReducers.project(state, action);
            expect(result.projects).toEqual(["test"]);
        });

        it("should apply the project state to non-empty array", ({ expect }) => {
            const state = {
                ...initialTodoState,
                projects: [ "test" ],
            };
            const action = {
                project: "test",
            };
            const result = parseReducers.project(state, action);
            expect(result.projects).toEqual(["test", "test"]);
        });

        it("should apply the extras state to empty object", ({ expect }) => {
            const state = initialTodoState;
            const action = {
                extra: { test: "123" },
            };
            const result = parseReducers.extra(state, action);
            expect(result.extras).toEqual({ test: "123" });
        });

        it("should apply the extras state to non-empty object", ({ expect }) => {
            const state = {
                ...initialTodoState,
                extras: { test: "123" },
            };
            const action = {
                extra: { abc: "meow" },
            };
            const result = parseReducers.extra(state, action);
            expect(result.extras).toEqual({ test: "123", abc: "meow" });
        });
    });

    describe("parseMatchers", () => {
        it("should match 'x' with completed", ({ expect }) => {
            const result = parseMatchers.completed("x");
            expect(result).toStrictEqual({
                completed: true,
                matchType: MATCH_TYPES.COMPLETED, 
            });
        });

        it("should not match completed with anything else", ({ expect }) => {
            const result = parseMatchers.completed("a");
            expect(result).toBe(false);
        });

        it("should match '(A)' with priority", ({ expect }) => {
            const result = parseMatchers.priority("(A)");
            expect(result).toStrictEqual({
                priority: "A",
                matchType: MATCH_TYPES.PRIORITY, 
            });
        });

        it("should not match priority with anything else", ({ expect }) => {
            const result = parseMatchers.priority("(a)");
            expect(result).toBe(false);
        });

        it("should match '2021-01-01' with completionDate", ({ expect }) => {
            const result = parseMatchers.completionDate("2021-01-01");
            expect(result).toStrictEqual({
                completionDate: "2021-01-01",
                matchType: MATCH_TYPES.COMPLETION_DATE, 
            });
        });

        it("should not match completionDate with anything else", ({ expect }) => {
            const result = parseMatchers.completionDate("a2021-01-01a");
            expect(result).toBe(false);
        });

        it("should match '2021-01-01' with creationDate", ({ expect }) => {
            const result = parseMatchers.creationDate("2021-01-01");
            expect(result).toStrictEqual({
                creationDate: "2021-01-01",
                matchType: MATCH_TYPES.CREATION_DATE, 
            });
        });

        it("should not match creationDate with anything else", ({ expect }) => {
            const result = parseMatchers.creationDate("a2021-01-01a");
            expect(result).toBe(false);
        });

        it("should match '+test' with project", ({ expect }) => {
            const result = parseMatchers.project("+test");
            expect(result).toStrictEqual({
                project: "test",
                matchType: "project", 
            });
        });

        it("should not match project with anything else", ({ expect }) => {
            const result = parseMatchers.project("@test");
            expect(result).toBe(false);
        });

        it("should match '@test' with context", ({ expect }) => {
            const result = parseMatchers.context("@test");
            expect(result).toStrictEqual({
                context: "test",
                matchType: MATCH_TYPES.CONTEXT, 
            });
        });

        it("should not match context with anything else", ({ expect }) => {
            const result = parseMatchers.context("+test");
            expect(result).toBe(false);
        });

        it("should match 'test:123' with extra", ({ expect }) => {
            const result = parseMatchers.extra("test:123");
            expect(result).toStrictEqual({
                extra: { test: "123" },
                matchType: MATCH_TYPES.EXTRA, 
            });
        });

        it("should not match extra with anything else", ({ expect }) => {
            const result = parseMatchers.extra("test");
            expect(result).toBe(false);
        });

        it("should match 'test' with text", ({ expect }) => {
            const result = parseMatchers.text("test");
            expect(result).toStrictEqual({
                text: "test",
                matchType: MATCH_TYPES.TEXT, 
            });
        });

        it("should not match text with whitespace", ({ expect }) => {
            const result = parseMatchers.text(" meow");
            expect(result).toBe(false);
        });

        it("should not match text with an '@' symbol at the beginning", ({ expect }) => {
            const result = parseMatchers.text("@meow");
            expect(result).toBe(false);
        });

        it("should not match text with an '+' symbol at the beginning", ({ expect }) => {
            const result = parseMatchers.text("+meow");
            expect(result).toBe(false);
        });
    });

    describe("parseTodoTxt", () => {
        const state = initialTodoState;


        it("should parse a completed task", ({ expect }) => {
            const input = "x asdf";
            const result = parseTodoTxt(input);
            expect(result).toStrictEqual({
                ...state,
                completed: true,
                text: "asdf",
            });
        });

        it("should parse a task with a priority", ({ expect }) => {
            const input = "x (A) asdf";
            const result = parseTodoTxt(input);
            expect(result).toStrictEqual({
                ...state,
                priority: "A",
                text: "asdf",
                completed: true,
            });
        });

        it("should parse a task with a completion date", ({ expect }) => {
            const input = "x (A) 2021-01-01 asdf";
            const result = parseTodoTxt(input);
            expect(result).toStrictEqual({
                ...state,
                priority: "A",
                completionDate: "2021-01-01",
                text: "asdf",
                completed: true,
            });
        });

        it("should parse a task with a creation date", ({ expect }) => {
            const input = "x (A) 2021-01-01 2021-01-02 asdf";
            const result = parseTodoTxt(input);
            expect(result).toStrictEqual({
                ...state,
                priority: "A",
                completionDate: "2021-01-01",
                creationDate: "2021-01-02",
                text: "asdf",
                completed: true,
            });
        });

        it("should parse a task with a text", ({ expect }) => {
            const input = "abcdefgu";
            const result = parseTodoTxt(input);
            expect(result).toStrictEqual({
                ...state,
                text: "abcdefgu",
            });
        });

        it("should parse a task with a text that spans multiple words", ({ expect }) => {
            const input = "abcdefgu asdf asdf asdf";
            const result = parseTodoTxt(input);
            expect(result).toStrictEqual({
                ...state,
                text: "abcdefgu asdf asdf asdf",
            });
        });

        it("should parse a task with projects", ({ expect }) => {
            const input = "x (A) 2021-01-01 2021-01-02 +test1 asdf acdf +test2 meow";
            const result = parseTodoTxt(input);
            expect(result).toStrictEqual({
                ...state,
                priority: "A",
                completionDate: "2021-01-01",
                creationDate: "2021-01-02",
                projects: ["test1", "test2"],
                text: "asdf acdf meow",
                completed: true,
            });
        });

        it("should parse a task with contexts", ({ expect }) => {
            const input = "x (A) 2021-01-01 2021-01-02 @test3 asdf yeet @test4 meow";
            const result = parseTodoTxt(input);
            expect(result).toStrictEqual({
                ...state,
                priority: "A",
                completionDate: "2021-01-01",
                creationDate: "2021-01-02",
                contexts: ["test3", "test4"],
                text: "asdf yeet meow",
                completed: true,
            });
        });
        
        it("should parse a task with contexts and projects", ({ expect }) => {
            const input = "x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf";
            const result = parseTodoTxt(input);
            expect(result).toStrictEqual({
                ...state,
                priority: "A",
                completionDate: "2021-01-01",
                creationDate: "2021-01-02",
                contexts: ["test3", "test5"],
                projects: ["test1", "test4", "test6"],
                text: "meow asdf sdf",
                completed: true,
            });
        });

        it("should parse a task with extras", ({ expect }) => {
            const input = "x (A) 2021-01-01 2021-01-02 asdf test1:123 meow test2:456 yinkel";
            const result = parseTodoTxt(input);
            expect(result).toStrictEqual({
                ...state,
                priority: "A",
                completionDate: "2021-01-01",
                creationDate: "2021-01-02",
                text: "asdf meow yinkel",
                extras: {
                    test1: "123",
                    test2: "456",
                },
                completed: true,
            });
        });

        it("should parse a task with the whole kitchen sink", ({ expect }) => {
            const input = "x (A) 2021-01-01 2021-01-02 meow @test3 +test1 asdf +test4 @test5 +test6 sdf test1:123 test2:456";
            const result = parseTodoTxt(input);
            expect(result).toStrictEqual({
                ...state,
                priority: "A",
                completionDate: "2021-01-01",
                creationDate: "2021-01-02",
                contexts: ["test3", "test5"],
                projects: ["test1", "test4", "test6"],
                text: "meow asdf sdf",
                extras: {
                    test1: "123",
                    test2: "456",
                },
                completed: true,
            });
        });
    });
});
