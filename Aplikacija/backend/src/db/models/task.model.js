const { Schema, model } = require('mongoose');
const { MODEL_PROPERTIES } = require('../../constants');
const Comment = require('../models/comment.model');

const taskSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		deadline: {
			type: Date,
			required: true,
		},
		listId: {
			type: Schema.Types.ObjectId,
			requred: true,
			ref: MODEL_PROPERTIES.LIST.NAME,
		},
		parentTaskId: {
			type: Schema.Types.ObjectId,
			ref: MODEL_PROPERTIES.TASK.NAME,
		},
		isCompleted: {
			type: Boolean,
			default: false,
		},
		isArchived: {
			type: Boolean,
			default: false,
		},
		creatorId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: MODEL_PROPERTIES.USER.NAME,
		},
		isTeamPriority: {
			type: Boolean,
			default: false,
		},
		usersPriority: [
			{
				type: Schema.Types.ObjectId,
				required: true,
				ref: MODEL_PROPERTIES.USER.NAME,
			},
		],
		editors: [
			{
				type: Schema.Types.ObjectId,
				required: true,
				ref: MODEL_PROPERTIES.USER.NAME,
			},
		],
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

taskSchema.index({ creatorId: 1 });

taskSchema.index({ listId: 1 });

taskSchema.virtual('subTasks', {
	ref: 'Task',
	localField: '_id',
	foreignField: 'parentTaskId',
});

taskSchema.virtual('comments', {
	ref: 'Comment',
	localField: '_id',
	foreignField: 'taskId',
});

taskSchema.methods.toJSON = function () {
	const task = this;
	const taskObject = task.toObject();
	delete taskObject.updatedAt;
	delete taskObject.__v;
	return taskObject;
};

taskSchema.methods.notificationMessage = function (timeLeft, timeKey) {
	return `${timeLeft} ${timeKey + (timeLeft > 1 ? 's' : '')} until ${
		this.name
	} tasks deadline.`;
};

taskSchema.methods.attachPriority = function (user) {
	const taskObject = task.toObject();
	if (task.usersPriority && task.usersPriority.includes(user._id))
		taskObject.usersPriority = true;
	else taskObject.usersPriority = false;
	return taskObject;
};

taskSchema.pre('remove', async function () {
	const comments = await Comment.find({ taskId: this._id });
	const subTasks = await Task.find({ parentTaskId: this._id }).exec();
	for (const comment of comments) {
		comment.remove();
	}
	for (const task of subTasks) {
		task.remove();
	}
	console.log('Done');
});

const Task = model(MODEL_PROPERTIES.TASK.NAME, taskSchema);

module.exports = Task;
