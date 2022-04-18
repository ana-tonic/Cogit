const MODEL_PROPERTIES = {
	USER: {
		NAME: 'User',
		ALLOWED_KEYS: {
			CREATE: ['username', 'email', 'password'],
			UPDATE: ['username', 'email', 'password', 'settings'],
			SETTINGS: ['defaultView', 'projectView', 'theme'],
		},
		SELECT_FIELDS: 'username email lastActiveAt suspended avatar id _id',
	},
	TEAM: {
		NAME: 'Team',
		ALLOWED_KEYS: {
			CREATE: ['name'],
			UPDATE: ['name'],
		},
		SELECT_FIELDS: 'name id _id',
	},
	NOTE: {
		NAME: 'Note',
		ALLOWED_KEYS: {
			CREATE: ['text'],
			UPDATE: ['text'],
		},
		SELECT_FIELDS: 'text createdAt creatorId teamId id _id',
	},
	PROJECT: {
		NAME: 'Project',
		ALLOWED_KEYS: {
			CREATE: ['name', 'description', 'deadline', 'tag', 'isTemplate'],
			UPDATE: [
				'name',
				'description',
				'deadline',
				'isArchived',
				'isTemplate',
				'tag',
			],
		},
		SELECT_FIELDS:
			'name description deadline tags isArchived isTemplate teamId id _id',
	},
	LIST: {
		NAME: 'List',
		ALLOWED_KEYS: {
			CREATE: ['name'],
			UPDATE: ['name', 'order'],
		},
		SELECT_FIELDS: 'name order projectId id _id',
	},
	TASK: {
		NAME: 'Task',
		ALLOWED_KEYS: {
			CREATE: ['name', 'description', 'deadline', 'isTeamPriority'],
			UPDATE: ['name', 'deadline', 'description', 'isCompleted', 'isArchived'],
		},
		SELECT_FIELDS:
			'name description deadline editors comments isCompleted parentTaskId isArchived isTeamPriority id _id',
	},
	COMMENT: {
		NAME: 'Comment',
		ALLOWED_KEYS: {
			CREATE: ['text'],
			UPDATE: ['text'],
		},
		SELECT_FIELDS: 'text taskId createdAt creatorId likes id _id',
	},
	MESSAGE: {
		NAME: 'Message',
		ALLOWED_KEYS: {
			CREATE: [],
			UPDATE: [],
		},
		SELECT_FIELDS: 'createdAt text _id id deletedBy seenBy from sessionId',
	},
	SESSION: {
		NAME: 'Session',
		ALLOWED_KEYS: {
			CREATE: [],
			UPDATE: [],
		},
		SELECT_FIELDS: '',
	},
	CALENDAR: {
		NAME: 'Calendar',
		ALLOWED_KEYS: {
			CREATE: [],
			UPDATE: [],
		},
		SELECT_FIELDS: '',
	},
	EVENT: {
		NAME: 'Event',
		ALLOWED_KEYS: {
			CREATE: [],
			UPDATE: [],
		},
		SELECT_FIELDS: '',
	},
	AVATAR: {
		NAME: 'Avatar',
		ALLOWED_KEYS: {
			CREATE: ['name'],
			UPDATE: ['name'],
		},
		SELECT_FIELDS: ' _id name picture id ',
	},
};

module.exports = {
	MODEL_PROPERTIES,
};
