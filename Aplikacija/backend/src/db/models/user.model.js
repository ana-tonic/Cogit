const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Avatar = require('./avatar.model');
const { MODEL_PROPERTIES, SOCKET_EVENTS } = require('../../constants');
const Session = require('./session.model');

//
//              Schema
//
// const contactSchema = new Schema({
// 	user: {
// 		type: Schema.Types.ObjectId,
// 		required: true,
// 		ref: MODEL_PROPERTIES.USER.NAME,
// 	},
// 	newMessages: {
// 		type: Number,
// 		default: 0,
// 	},
// });
const userSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			trim: true,
			unique: true,
		},
		role: {
			type: String,
			default: 'user',
			enum: ['user', 'admin'],
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error('Email is not valid.');
				}
			},
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minlength: [7, 'Password too short (must be at least 7 characters).'],
		},
		active: { type: Boolean, default: false },
		lastActiveAt: Date,
		resetToken: {
			key: { type: String },
			expiresIn: {
				type: Date,
			},
		},
		suspended: {
			isSuspended: {
				type: Boolean,
				default: false,
			},
			suspendedUntil: {
				type: Date,
			},
		},
		teams: [
			{
				type: Schema.Types.ObjectId,
				required: true,
				ref: MODEL_PROPERTIES.TEAM.NAME,
			},
		],
		visits: [
			{
				teamId: {
					type: Schema.Types.ObjectId,
				},
				date: {
					type: Date,
					required: true,
				},
			},
		],
		contacts: [
			{
				type: Schema.Types.ObjectId,
				required: true,
				ref: MODEL_PROPERTIES.USER.NAME,
			},
		],
		avatar: {
			type: Schema.Types.ObjectId,
			ref: MODEL_PROPERTIES.AVATAR.NAME,
		},
		settings: {
			theme: {
				type: String,
				enum: ['dark', 'light'],
				default: 'light',
			},
			projectView: [
				{
					reference: {
						type: Schema.Types.ObjectId,
						ref: MODEL_PROPERTIES.PROJECT.NAME,
						required: true,
					},
					view: {
						type: String,
						enum: ['list', 'board'],
						required: true,
					},
				},
			],
			defaultView: {
				type: String,
				enum: ['list', 'board'],
				default: 'list',
			},
		},

		notifications: [
			{
				seen: {
					type: Boolean,
					default: false,
				},
				event: {
					text: {
						type: String,
						required: true,
					},
					reference: {
						type: Schema.Types.ObjectId,
						required: true,
					},
				},
				receivedAt: {
					type: Date,
					required: true,
				},
			},
		],
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

userSchema.index({ username: 1 });

userSchema.index({ email: 1 });

userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 8);
	}
	if (this.isModified('resetToken') && this.resetToken) {
		this.resetToken.key = await bcrypt.hash(this.resetToken.key, 8);
	}
	if (!this.avatar) {
		const count = await Avatar.countDocuments();
		const skip = Math.floor(Math.random() * count);
		this.avatar = await Avatar.findOne({}).skip(skip);
	}
	await this.settings.populate('projectView.reference').execPopulate();
	for (const projectView of this.settings.projectView) {
		if (!this.teams.includes(projectView.reference.teamId))
			throw new Error('Invalid projectId');
	}
	next();
});

userSchema.statics.findByCredentials = async function (tag, password) {
	let user;
	if (validator.isEmail(tag)) user = await User.findOne({ email: tag });
	else user = await User.findOne({ username: tag });
	if (!user) {
		throw new Error('Unable to login.');
	}
	await user.checkPassword(password);
	return user;
};
userSchema.methods.checkPassword = async function (password) {
	if (!(await bcrypt.compare(password, this.password))) {
		throw new Error('Incorrect password.');
	}
};
userSchema.statics.generateTag = async () => {
	const lastTag = await User.countDocuments({});

	let tag = lastTag;
	tag = tag.toString();
	tag = '#' + tag.padStart(9, '0');

	return tag;
};

userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.notifications;
	delete userObject.invitations;
	delete userObject.teams;
	delete userObject.resetToken;
	delete userObject.createdAt;
	delete userObject.updatedAt;
	delete userObject.__v;

	return userObject;
};

userSchema.methods.checkIfSuspended = async function () {
	const user = this;
	if (user.suspended.isSuspended) {
		if (user.suspended.suspendedUntil <= new Date(Date.now())) {
			user.suspended.isSuspended = false;
			await user.save();
		} else {
			throw new Error(
				`User is suspended until ${new Date(user.suspended.suspendedUntil)}`
			);
		}
	}
};

userSchema.methods.generateContactList = async function (
	userId,
	sendEventToRoom
) {
	const user = this;
	await user
		.populate({
			path: 'contacts',
			model: MODEL_PROPERTIES.USER.NAME,
		})
		.execPopulate();

	user.contacts = user.contacts.filter(
		(contactId) => !contactId.equals(userId)
	);
	user.contacts.unshift(userId);
	await user.save();
	await user.populate('contacts').execPopulate();

	sendEventToRoom(user._id, SOCKET_EVENTS.CONTACTS_UPDATED, contacts);
};

userSchema.methods.notifyContacts = async function (sendEventToRoom, event) {
	try {
		for (const contact of this.contacts) {
			sendEventToRoom(contact._id ? contact._id : contact, event, {
				userId: this._id,
				active: this.active,
			});
		}
	} catch (e) {
		console.log(e);
	}
};

userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({ _id: user._id.toString() }, process.env.TOKEN_KEY, {
		expiresIn: '7 days',
	});
	return token;
};

const User = model(MODEL_PROPERTIES.USER.NAME, userSchema);

module.exports = User;
