const { Schema, model } = require('mongoose');
const { MODEL_PROPERTIES } = require('../../constants');

const commentSchema = new Schema({
	text: {
		type: String,
		required: true,
		trim: true,
		maxlength: [250, 'Comment too long. (>250)'],
		minlength: [1, 'Comment too short.'],
	},
	likes: [
		{
			type: Schema.Types.ObjectId,
			ref: MODEL_PROPERTIES.USER.NAME,
			required: true,
		},
	],
	taskId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: MODEL_PROPERTIES.TASK.NAME,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	creatorId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: MODEL_PROPERTIES.USER.NAME,
	},
});

commentSchema.index({ creatorId: 1 });

commentSchema.index({ taskId: 1 });

const Comment = model(MODEL_PROPERTIES.COMMENT.NAME, commentSchema);

module.exports = Comment;
