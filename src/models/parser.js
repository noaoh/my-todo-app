import { initialTodoState, onlyOneMatchTypes, MATCH_TYPES } from '../constants';

const parseReducers = {
  [MATCH_TYPES.COMPLETED]: (state, action) => ({ ...state, completed: action.completed }),
  [MATCH_TYPES.PRIORITY]: (state, action) => ({ ...state, priority: action.priority }),
  [MATCH_TYPES.COMPLETION_DATE]: (state, action) => ({ ...state, completionDate: action.completionDate }),
  [MATCH_TYPES.CREATION_DATE]: (state, action) => ({ ...state, creationDate: action.creationDate }),
  [MATCH_TYPES.CONTEXT]: (state, action) => ({ ...state, contexts: [...state.contexts, action.context] }),
  [MATCH_TYPES.PROJECT]: (state, action) => ({ ...state, projects: [...state.projects, action.project] }),
  [MATCH_TYPES.EXTRA]: (state, action) => ({ ...state, extras: { ...state.extras, ...action.extra } }),
  [MATCH_TYPES.TEXT]: (state, action) => {
    if (state.text === '') {
      return { ...state, text: action.text };
    }
    return { ...state, text: `${state.text} ${action.text}` };
  },
  [MATCH_TYPES.OTHER]: (state, action) => {
    if (state.text === '') {
      return { ...state, text: action.other };
    }
    return { ...state, text: `${state.text} ${action.other}` };
  },
};

const parseMatchers = {
  [MATCH_TYPES.COMPLETED]: (token) => {
    if (token === 'x') {
      return { matchType: MATCH_TYPES.COMPLETED, completed: true };
    }
    return false;
  },
  [MATCH_TYPES.PRIORITY]: (token) => {
    if (token.startsWith('(')) {
      const peek = token.slice(1, 2);
      if (peek.match(/[A-Z]/)) {
        return { matchType: MATCH_TYPES.PRIORITY, priority: peek };
      }
      return false;
    }
    return false;
  },
  [MATCH_TYPES.COMPLETION_DATE]: (token) => {
    if (token.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return { matchType: MATCH_TYPES.COMPLETION_DATE, completionDate: token };
    }
    return false;
  },
  [MATCH_TYPES.CREATION_DATE]: (token) => {
    if (token.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return { matchType: MATCH_TYPES.CREATION_DATE, creationDate: token };
    }
    return false;
  },
  [MATCH_TYPES.CONTEXT]: (token) => {
    if (token.startsWith('@')) {
      return { matchType: MATCH_TYPES.CONTEXT, context: token.slice(1) };
    }
    return false;
  },
  [MATCH_TYPES.PROJECT]: (token) => {
    if (token.startsWith('+')) {
      return { matchType: MATCH_TYPES.PROJECT, project: token.slice(1) };
    }
    return false;
  },
  [MATCH_TYPES.EXTRA]: (token) => {
    if (token.match(/[^\s@+]*:[^\s@+]*/)) {
      const [key, value] = token.split(':');
      return { matchType: MATCH_TYPES.EXTRA, extra: { [key]: value } };
    }
    return false;
  },
  [MATCH_TYPES.TEXT]: (token) => {
    if (token.match(/^[^\s@+]{1}[^\s]*$/)) {
      return { matchType: MATCH_TYPES.TEXT, text: token };
    }
    return false;
  },
  [MATCH_TYPES.OTHER]: (token) => ({ matchType: MATCH_TYPES.OTHER, other: token }),
};

/* eslint-disable max-len */
const parseStateTable = {
  0: [MATCH_TYPES.COMPLETED, MATCH_TYPES.PRIORITY, MATCH_TYPES.COMPLETION_DATE, MATCH_TYPES.CONTEXT, MATCH_TYPES.PROJECT, MATCH_TYPES.EXTRA, MATCH_TYPES.TEXT, MATCH_TYPES.OTHER],
  1: [MATCH_TYPES.PRIORITY, MATCH_TYPES.COMPLETION_DATE, MATCH_TYPES.CREATION_DATE, MATCH_TYPES.CONTEXT, MATCH_TYPES.PROJECT, MATCH_TYPES.EXTRA, MATCH_TYPES.TEXT, MATCH_TYPES.OTHER],
  2: [MATCH_TYPES.COMPLETION_DATE, MATCH_TYPES.CREATION_DATE, MATCH_TYPES.CONTEXT, MATCH_TYPES.PROJECT, MATCH_TYPES.EXTRA, MATCH_TYPES.TEXT, MATCH_TYPES.OTHER],
  3: [MATCH_TYPES.CREATION_DATE, MATCH_TYPES.CONTEXT, MATCH_TYPES.PROJECT, MATCH_TYPES.EXTRA, MATCH_TYPES.TEXT, MATCH_TYPES.OTHER],
  rest: [MATCH_TYPES.CONTEXT, MATCH_TYPES.PROJECT, MATCH_TYPES.EXTRA, MATCH_TYPES.TEXT, MATCH_TYPES.OTHER],
};
/* eslint-enable max-len */

/* eslint-disable no-restricted-syntax */
const findMatch = (matchers, token) => {
  for (const matcher of matchers) {
    const matchValue = parseMatchers[matcher](token);
    if (matchValue !== false) {
      return matchValue;
    }
  }
  return false;
};
/* eslint-enable no-restricted-syntax */

const filterOutStates = (parseState, foundStates) => parseState.filter((t) => !foundStates.includes(t));

const parseTodoTxt = (string) => {
  let result = initialTodoState;
  const tokens = string.trim().split(' ');
  let i = 0;
  const exclusiveMatches = [];
  let currentMatchType = '';
  while (i < tokens.length) {
    const token = tokens[i];
    if (!parseStateTable.rest.includes(currentMatchType) && i < 4) {
      const match = findMatch(filterOutStates(parseStateTable[i], exclusiveMatches), token);
      const { matchType, ...rest } = match;
      if (onlyOneMatchTypes.includes(matchType)) {
        exclusiveMatches.push(matchType);
      }
      currentMatchType = matchType;
      result = parseReducers[currentMatchType](result, rest);
    } else {
      const match = findMatch(parseStateTable.rest, token);
      const { matchType, ...rest } = match;
      if (!matchType) {
        rest.other = token;
        currentMatchType = MATCH_TYPES.OTHER;
      } else {
        currentMatchType = matchType;
      }
      result = parseReducers[currentMatchType](result, rest);
    }
    i += 1;
  }
  return result;
};

export {
  filterOutStates, parseMatchers, parseStateTable as parseState, findMatch, parseReducers, parseTodoTxt,
};
