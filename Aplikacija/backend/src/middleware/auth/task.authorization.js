const mongoose = require('mongoose');
const { MODEL_PROPERTIES } = require('../../constants');
const { Team, Project, List, Task, User } = require('../../db/models');
require('../utils');

async function taskToLeaderAuth(req, res, next) {
	try {
		const task = await Task.findById(req.params.taskId);
		if (!task) {
			res.status(404);
			throw new Error('Task not found');
		}
		// // await task
		// // 	.populate({
		// // 		path: 'listId',
		// // 		model: MODEL_PROPERTIES.LIST.NAME,
		// // 		populate: {
		// // 			path: 'projectId',
		// // 			model: MODEL_PROPERTIES.PROJECT.Name,
		// // 			populate: {
		// // 				path: 'teamId',
		// // 				model: MODEL_PROPERTIES.TEAM.NAME,
		// // 			},
		// // 		},
		// // 	})
		// // 	.execPopulate();
		// await task.populate('listId').execPopulate();
		// await task.listId.populate('projectId').execPopulate();
		// await task.listId.projectId.populate('teamId').execPopulate();

		const list = await List.findById(task.listId).lean();
		const project = await Project.findById(list.projectId).lean();
		const team = await Team.findById(project.teamId);
		if (team.leaderId.equals(req.user._id)) req.task = task;
		next();
	} catch (e) {
		next(e);
	}
}

async function taskToMemberAuth(req, res, next) {
	try {
		const task = await Task.findById(req.params.taskId);
		if (!task) {
			res.status(404);
			throw new Error('Task not found');
		}

		const list = await List.findById(task.listId).lean();
		const project = await Project.findById(list.projectId).lean();
		const users = await User.find({
			teams: project.teamId,
		});
		if (!req.admin && !users.find((user) => user._id.equals(req.user._id))) {
			res.status(403);
			throw new Error(
				'Not authorized.  To access this document you need to be team member.'
			);
		}
		req.task = task;
		next();
	} catch (e) {
		next(e);
	}
}

async function assignAuth(req, res, next) {
	try {
		if (!req.task) {
			res.status(403);
			throw new Error(
				'Not authorized.  To access this document you need to be team leader.'
			);
		}

		const list = await List.findById(req.task.listId).lean();
		const project = await Project.findById(list.projectId).lean();
		const user = await User.findById(req.params.userId);
		if (!user) {
			res.status(404);
			throw new Error('User not found');
		}
		if (!user.teams.includes(project.teamId)) {
			res.status(400);
			throw new Error('Assignee must be a team member.');
		}
		req.assignee = user;
		next();
	} catch (e) {
		next(e);
	}
}

module.exports = {
	taskToLeaderAuth,
	taskToMemberAuth,
	assignAuth,
};
