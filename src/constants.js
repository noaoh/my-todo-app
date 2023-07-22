import { getOsLineEnding } from './utils';

const VIEW_STATES = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

const MATCH_TYPES = {
  COMPLETED: 'completed',
  PRIORITY: 'priority',
  COMPLETION_DATE: 'completionDate',
  CREATION_DATE: 'creationDate',
  TEXT: 'text',
  CONTEXT: 'context',
  PROJECT: 'project',
  EXTRA: 'extra',
  OTHER: 'other',
};

const initialTodoState = {
  completed: false,
  priority: '',
  completionDate: '',
  creationDate: '',
  text: '',
  contexts: [],
  projects: [],
  extras: {},
};

const onlyOneMatchTypes = [
  MATCH_TYPES.COMPLETED,
  MATCH_TYPES.PRIORITY,
  MATCH_TYPES.COMPLETION_DATE,
  MATCH_TYPES.CREATION_DATE,
];

const osLineEnding = getOsLineEnding();

const HISTORY_LIMIT = 10;

export {
  onlyOneMatchTypes, initialTodoState, VIEW_STATES, MATCH_TYPES, osLineEnding, HISTORY_LIMIT,
};
