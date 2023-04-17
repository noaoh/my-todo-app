import { initialTodoState, onlyOneMatchTypes, MATCH_TYPES } from "../constants";

const parseReducers = {
    [MATCH_TYPES.COMPLETED]: (state, action) => {
        return { ...state, completed: action.completed };
    },
    [MATCH_TYPES.PRIORITY]: (state, action) => {
        return { ...state, priority: action.priority };
    },
    [MATCH_TYPES.COMPLETION_DATE]: (state, action) => {
        return { ...state, completionDate: action.completionDate };
    },
    [MATCH_TYPES.CREATION_DATE]: (state, action) => {
        return { ...state, creationDate: action.creationDate };
    },
    [MATCH_TYPES.CONTEXT]: (state, action) => {
        return { ...state, contexts: [ ...state.contexts, action.context ] };
    },
    [MATCH_TYPES.PROJECT]: (state, action) => {
        return { ...state, projects: [ ...state.projects, action.project ] };
    },
    [MATCH_TYPES.EXTRA]: (state, action) => {
        return { ...state, extras: { ...state.extras, ...action.extra } };
    },
    [MATCH_TYPES.TEXT]: (state, action) => {
        if (state.text === "") {
            return { ...state, text: action.text };
        } else {
            return { ...state, text: state.text + " " + action.text };
        }
    },
};

const parseMatchers = {
    [MATCH_TYPES.COMPLETED]: (token) => {
        if (token === "x") {
            return { matchType: MATCH_TYPES.COMPLETED, completed: true };
        } else {
            return false;
        }
    },
    [MATCH_TYPES.PRIORITY]: (token) => {
        if (token.startsWith("(")) {
            const peek = token.slice(1, 2);
            if (peek.match(/[A-Z]/)) {
                return { matchType: MATCH_TYPES.PRIORITY, priority: peek };
            } else {
                return false;
            }
        } else {
            return false;
        }
    },
    [MATCH_TYPES.COMPLETION_DATE]: (token) => {
        if (token.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return { matchType: MATCH_TYPES.COMPLETION_DATE, completionDate: token };
        } else {
            return false;
        }
    },
    [MATCH_TYPES.CREATION_DATE]: (token) => {
        if (token.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return { matchType: MATCH_TYPES.CREATION_DATE, creationDate: token };
        } else {
            return false;
        }
    },
    [MATCH_TYPES.CONTEXT]: (token) => {
        if (token.startsWith("@")) {
            return { matchType: MATCH_TYPES.CONTEXT, context: token.slice(1) };
        } else {
            return false;
        }
    },
    [MATCH_TYPES.PROJECT]: (token) => {
        if (token.startsWith("+")) {
            return { matchType: MATCH_TYPES.PROJECT, project: token.slice(1) };
        } else {
            return false;
        }
    },
    [MATCH_TYPES.EXTRA]: (token) => {
        if (token.match(/[^\s@+]*\:[^\s@+]*/)) {
            const [ key, value ] = token.split(":");
            return { matchType: MATCH_TYPES.EXTRA, extra: { [key]: value } };
        } else {
            return false;
        }
    },
    [MATCH_TYPES.TEXT]: (token) => {
        if (token.match(/^[^\s@+]{1}[^\s]*$/)) {
            return { matchType: MATCH_TYPES.TEXT, text: token };
        } else {
            return false;
        }
    },
}

const parseState = {
    0: [ MATCH_TYPES.COMPLETED, MATCH_TYPES.PRIORITY, MATCH_TYPES.COMPLETION_DATE, MATCH_TYPES.CONTEXT, MATCH_TYPES.PROJECT, MATCH_TYPES.EXTRA, MATCH_TYPES.TEXT ],
    1: [ MATCH_TYPES.PRIORITY, MATCH_TYPES.COMPLETION_DATE, MATCH_TYPES.CREATION_DATE, MATCH_TYPES.CONTEXT, MATCH_TYPES.PROJECT, MATCH_TYPES.EXTRA, MATCH_TYPES.TEXT ],
    2: [ MATCH_TYPES.COMPLETION_DATE, MATCH_TYPES.CREATION_DATE, MATCH_TYPES.CONTEXT, MATCH_TYPES.PROJECT, MATCH_TYPES.EXTRA, MATCH_TYPES.TEXT ],
    3: [ MATCH_TYPES.CREATION_DATE, MATCH_TYPES.CONTEXT, MATCH_TYPES.PROJECT, MATCH_TYPES.EXTRA, MATCH_TYPES.TEXT ],
    "rest": [ MATCH_TYPES.CONTEXT, MATCH_TYPES.PROJECT, MATCH_TYPES.EXTRA, MATCH_TYPES.TEXT ],
};


const findMatch = (matchers, token) => {
    for (const matcher of matchers) {
        const matchValue = parseMatchers[matcher](token);
        if (matchValue !== false) {
            return matchValue;
        }
    }
    return false;
}

const filterOutStates = (parseState, foundStates) => {
    return parseState.filter((t) => !foundStates.includes(t));
}

const parseTodoTxt = (string) => {
    let result = initialTodoState;
    const tokens = string.split(" ");
    let i = 0;
    let exclusiveMatches = [];
    let currentMatchType = "";
    while (i < tokens.length) {
        const token = tokens[i];
        if (!parseState["rest"].includes(currentMatchType) && i < 4) {
            const match = findMatch(filterOutStates(parseState[i], exclusiveMatches), token);
            const { matchType, ...rest } = match;
            if (onlyOneMatchTypes.includes(matchType)) {
                exclusiveMatches.push(matchType);
            }
            currentMatchType = matchType;
            result = parseReducers[currentMatchType](result, rest);
        } else {
            const match = findMatch(parseState["rest"], token);
            const { matchType, ...rest } = match;
            currentMatchType = matchType;
            result = parseReducers[currentMatchType](result, rest);
        }
        i += 1;
    }
    return result;
}

export { filterOutStates, parseMatchers, parseState, findMatch, parseReducers, parseTodoTxt };
