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
};

const initialTodoState = {
    completed: false,
    priority: "",
    completionDate: "",
    creationDate: "",
    text: "",
    contexts: [],
    projects: [],
    extras: {},
};

export { initialTodoState, VIEW_STATES, MATCH_TYPES };
