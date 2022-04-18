const { Task, List, Project } = require('../db/models');

const Socket = require('../socket/socket');
const { SOCKET_EVENTS } = require('../constants');

const {
	queryHandler,
	optionsBuilder,
	matchBuilder,
	scheduleJobHandler,
	destructureObject,
	notifyUsers,
	newNotification,
	checkAndUpdate,
} = require('./utils');

const { MODEL_PROPERTIES } = require('../constants');
const selectFields = MODEL_PROPERTIES.TASK.SELECT_FIELDS;
const allowedKeys = MODEL_PROPERTIES.TASK.ALLOWED_KEYS;

async function createTaskHandler(req, res, next) {
	if (!req.body.deadline) {
		await req.list.populate('projectId').execPopulate();
		req.body.deadline = req.list.projectId.deadline;
	}
	const taskObject = destructureObject(req.body, allowedKeys.CREATE);
	await createTask(
		req,
		res,
		{
			...taskObject,
			listId: req.list._id,
		},
		next
	);
}

async function createSubTaskHandler(req, res, next) {
	try {
		const parentTask = await Task.findOne({ _id: req.params.taskId }).lean();
		const inheritObject = {
			listId: parentTask.listId,
			parentTaskId: parentTask._id,
			editors: parentTask.editors,
			isArchived: parentTask.isArchived,
			isTeamPriority: parentTask.isTeamPriority,
			usersPriority: parentTask.usersPriority,
		};
		const taskObject = destructureObject(req.body, allowedKeys.CREATE);
		if (
			req.body.deadline &&
			new Date(req.body.deadline) > parentTask.deadline
		) {
			req.body.deadline = parentTask.deadline;
		}
		await createTask(
			req,
			res,
			{
				...taskObject,
				...inheritObject,
			},
			next
		);
	} catch (e) {
		next(e);
	}
}

async function createTask(req, res, task, next) {
	try {
		if (task.deadline && new Date(task.deadline).getTime() < Date.now()) {
			res.status(422);
			throw new Error('Invalid date.');
		}
		const newTask = new Task({ ...task });
		newTask.creatorId = req.user._id;
		if (
			newTask.editors &&
			!Array.from(newTask.editors).find((editor) =>
				editor._id.equals(req.user._id)
			)
		) {
			newTask.editors.push(req.user._id);
		}
		await newTask.save();
		await scheduleTaskEditorsNotifications(newTask);
		await newTask.populate('editors').execPopulate();
		res.send(newTask);
	} catch (e) {
		next(e);
	}
}
async function scheduleTaskEditorsNotifications(task) {
	await task.populate('editors').execPopulate();
	task.editors.forEach((editor) => {
		scheduleJobHandler(task.deadline, editor, Socket, Task, task._id);
	});
}
async function getUserTasksHandler(req, res, next) {
	try {
		const projects = await Project.find({ teamId: req.team._id }, '_id').lean();
		let lists = [];
		let currentLists;
		for (const project of projects) {
			currentLists = await List.find({ projectId: project._id }, '_id').lean();
			lists = lists.concat(currentLists);
		}
		console.log(lists);
		let usersTasks = [];
		let currentTasks;
		for (const list of lists) {
			currentTasks = await Task.find({
				editors: req.user._id,
				listId: list._id,
			});
			console.log('listId ', list._id, ' currentTasks: ', currentTasks);
			usersTasks = usersTasks.concat(currentTasks);
		}
		//usersTasks = queryHandler(usersTasks, req.query);
		for (const task of usersTasks) {
			await task.populate('subTasks').execPopulate();
			attachPriority(task, req.user);
		}
		res.send(usersTasks);
	} catch (e) {
		next(e);
	}
}
function attachPriority(task, user) {
	let taskObject = task.toObject();
	if (task.usersPriority && task.usersPriority.includes(user._id))
		taskObject.usersPriority = true;
	else taskObject.usersPriority = false;
	return taskObject;
}
async function getSpecificTaskHandler(req, res, next) {
	try {
		await populateTaskWithComments(req.task);
		res.send(attachPriority(req.task, req.user));
	} catch (e) {
		next(e);
	}
}
async function populateTask(task) {
	if (task.editors && task.editors.length) {
		await task
			.populate('editors', MODEL_PROPERTIES.USER.SELECT_FIELDS)
			.execPopulate();
		for (const user of task.editors) {
			await user
				.populate('avatar', MODEL_PROPERTIES.AVATAR.SELECT_FIELDS)
				.execPopulate();
		}
	}
}
async function populateTaskWithComments(task) {
	await populateTask(task);
	await task
		.populate('comments', MODEL_PROPERTIES.COMMENT.SELECT_FIELDS)
		.execPopulate();
	for (const comment of task.comments) {
		await comment
			.populate('creatorId', MODEL_PROPERTIES.USER.SELECT_FIELDS)
			.execPopulate();
		await comment.creatorId
			.populate('avatar', MODEL_PROPERTIES.AVATAR.SELECT_FIELDS)
			.execPopulate();
	}
}
async function getTeamPriorityTasksHandler(req, res, next) {
	try {
		const priorityTasks = await getTasksHandler(
			req,
			{ editors: req.user._id, isTeamPriority: true },
			selectFields
		);
		res.send(priorityTasks);
	} catch (e) {
		next(e);
	}
}

async function getUserPriorityTasksHandler(req, res, next) {
	try {
		const priorityTasks = await getTasksHandler(
			req,
			{ editors: req.user._id, usersPriority: req.user._id },
			selectFields
		);
		res.send(priorityTasks);
	} catch (e) {
		next(e);
	}
}

async function getTasksFromListHandler(req, res, next) {
	try {
		const tasks = await getTasksHandler(
			req,
			{ listId: req.list._id },
			selectFields
		);

		res.send(tasks);
	} catch (e) {
		next(e);
	}
}

async function getTasksHandler(req, queryFields) {
	const options = optionsBuilder(
		req.query.limit,
		req.query.skip,
		req.query.sortBy,
		req.query.sortValue
	);
	const match = matchBuilder(req.query);

	const tasks = await Task.find(
		{
			...queryFields,
			...match,
		},
		null,
		options
	);
	let taskObjects = [];
	for (const task of tasks) {
		await populateTask(task);
		taskObjects.push(attachPriority(task, req.user));
	}
	return taskObjects;
}

function toObject(obj) {
	for (const prop in obj) {
		if (typeof prop === 'object' && prop !== null && prop !== undefined) {
			toObject(prop);
			prop = prop.toObject();
		}
	}
}

async function updateTaskHandler(req, res, next) {
	try {
		await checkAndUpdate('TASK', req.task, req.body, res);
		res.send(req.task);
	} catch (e) {
		next(e);
	}
}

async function setUsersPriorityHandler(req, res, next) {
	try {
		if (!req.task.usersPriority.includes(req.user._id)) {
			req.task.usersPriority.push(req.user._id);
		} else {
			req.task.usersPriority = req.task.usersPriority.filter(
				(userId) => !userId.equals(req.user._id)
			);
		}
		await req.task.save();
		res.send({ success: true });
	} catch (e) {
		next(e);
	}
}

async function setTeamsPriorityHandler(req, res, next) {
	try {
		if (!req.task) {
			res.status(403);
			throw new Error(
				'Not authorized.  To access this document you need to be team leader.'
			);
		}
		req.task.isTeamPriority = req.body.isTeamPriority === true;
		await req.task.save();
		res.send({ success: true });
	} catch (e) {
		next(e);
	}
}

async function changeListHandler(req, res, next) {
	try {
		await req.task.populate('listId').execPopulate();
		const oldList = req.task.listId;
		req.task.listId = req.params.listId;
		await req.task.populate('editors').execPopulate();
		await req.task.save();
		if (!req.list._id.equals(oldList._id)) {
			await notifyUsers(
				req.task.editors.filter((editor) => !editor._id.equals(req.user._id)),
				{
					event: {
						text: `${req.user.username} has moved task ${req.task.name}. It's moved from list ${oldList.name} to ${req.list.name}.`,
						reference: req.list,
					},
				}
			);
		}
		res.send({ success: true });
	} catch (e) {
		next(e);
	}
}

async function assignUserHandler(req, res, next) {
	try {
		if (req.task.editors.includes(req.assignee._id)) {
			req.task.editors = req.task.editors.filter(
				(editor) => !editor.equals(req.assignee._id)
			);
			await newNotification(req.assignee, {
				event: {
					text: `${req.user.username} removed your assignment from task:'${req.task.name}'.`,
					reference: req.task,
				},
			});
		} else {
			req.task.editors.push(req.assignee._id);
			if (!req.user._id.equals(req.assignee._id)) {
				await newNotification(req.assignee, {
					event: {
						text: `${req.user.username} assigned you to task:'${req.task.name}'.`,
						reference: req.task,
					},
				});
			}
			scheduleJobHandler(
				req.task.deadline,
				req.assignee._id,
				Socket,
				Task,
				req.task._id
			);
		}
		await req.task.save();
		await req.task.populate('editors').execPopulate();
		for (const editor of req.task.editors) {
			await editor.populate('avatar').execPopulate();
		}
		res.send(req.task.editors);
	} catch (e) {
		next(e);
	}
}

async function deleteTaskHandler(req, res, next) {
	try {
		const list = await List.findById(req.task.listId);
		await deleteSingleTaskHandler(req.task);
		await list.populate('tasks').execPopulate();
		return res.json(list.tasks);
	} catch (e) {
		next(e);
	}
}

async function deleteSingleTaskHandler(currentTask) {
	return currentTask.remove();
}

module.exports = {
	createTaskHandler,
	createSubTaskHandler,
	getUserTasksHandler,
	getSpecificTaskHandler,
	getTeamPriorityTasksHandler,
	getUserPriorityTasksHandler,
	getTasksFromListHandler,
	updateTaskHandler,
	deleteTaskHandler,
	deleteSingleTaskHandler,
	assignUserHandler,
	setUsersPriorityHandler,
	setTeamsPriorityHandler,
	changeListHandler,
	scheduleTaskEditorsNotifications,
	attachPriority,
};
