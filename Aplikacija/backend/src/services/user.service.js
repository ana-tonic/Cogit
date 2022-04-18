const bcrypt = require('bcryptjs');

const Socket = require('../socket/socket');
const { SOCKET_EVENTS, TIME_VALUES } = require('../constants');
const {
	User,
	Project,
	Task,
	Avatar,
	Calendar,
	Team,
	Session,
	Message,
} = require('../db/models');
const mongoose = require('mongoose');
const timeValues = require('../constants/time_values');
const { deleteSingleTeamHandler } = require('./team.service');

const {
	sendResetTokenMail,
	optionsBuilder,
	matchBuilder,
	queryHandler,
	scheduleJobHandler,
	destructureObject,
	newNotification,
	checkAndUpdate,
} = require('./utils');

const {
	getSessionMessagesHandler,
	getSessionHandler,
	addParticipantHandler,
	getPrivateSessionHandler,
} = require('./session.service');

const { MODEL_PROPERTIES } = require('../constants');
const { jwtAuthMiddleware } = require('../middleware/auth');

const selectFields = MODEL_PROPERTIES.USER.SELECT_FIELDS;
const allowedKeys = MODEL_PROPERTIES.USER.ALLOWED_KEYS;

async function createUserHandler(req, res, next) {
	{
		try {
			const userObject = destructureObject(req.body, allowedKeys.CREATE);
			const user = new User({
				...userObject,
			});
			const userCalendar = new Calendar({
				userId: user._id,
			});
			await user.save();
			await userCalendar.save();
			const token = await user.generateAuthToken();
			res.send({ user, token });
		} catch (e) {
			next(e);
		}
	}
}

async function loginUserHandler(req, res, next) {
	try {
		const user = await User.findByCredentials(req.body.id, req.body.password);
		await user.checkIfSuspended();
		const notificationNumber = user.notifications.reduce(
			(acc, notif) => acc + (notif.seen ? 0 : 1),
			0
		);
		if (!user.active) {
			user.active = true;
			await user.save();
		}
		const token = await user.generateAuthToken();

		res.send({ user, token, notificationNumber });
		user.notifyContacts(
			Socket.sendEventToRoom.bind(Socket),
			SOCKET_EVENTS.USER_STATUS_CHANGED
		);
	} catch (e) {
		next(e);
	}
}

async function setAvatarHandler(req, res, next) {
	try {
		const avatar = await Avatar.findById(req.params.avatarId);
		if (!avatar) {
			res.status(404);
			throw new Error('Avatar not found.');
		}
		req.user.avatar = req.params.avatarId;
		await req.user.save();
		// req.user.avatar.picture = await req.user.generateBase64();
		res.send(avatar);
	} catch (e) {
		next(e);
	}
}

async function logoutUserHandler(req, res, next) {
	try {
		await req.user.save();
		res.send();
	} catch (e) {
		next(e);
	}
}

async function getProfileHandler(req, res, next) {
	await req.user.populate('teams').execPopulate();
	await req.user.populate('avatar').execPopulate();
	// if (req.user.avatar) {
	// 	req.user.avatar.picture = await req.user.generateBase64();
	// }
	res.send(req.user);
}

async function getAvatarHandler(req, res, next) {
	try {
		if (!req.user.avatar) {
			res.status(404);
			throw new Error('User has no avatar.');
		}
		await req.user.populate('avatar').execPopulate();

		res.send(req.user.avatar.picture);
	} catch (e) {
		next(e);
	}
}
async function getContactsHandler(req, res, next) {
	try {
		let session;
		let lastMessage;
		const comparable = [];
		for (const contactId of req.user.contacts) {
			session = await getSessionHandler([req.user._id, contactId]);
			lastMessage = await Message.findOne({ sessionId: session._id }, null, {
				sort: { createdAt: -1 },
			});
			comparable.push({
				contact: contactId,
				lastMessage: lastMessage === null ? 0 : lastMessage.createdAt.getTime(),
			});
		}

		comparable.sort((a, b) => (a.lastMessage < b.lastMessage ? 1 : -1));

		req.user.contacts = comparable.map((el) => el.contact);
		req.user = await User.findOneAndUpdate({ _id: req.user._id }, req.user, {
			new: true,
		});
		await req.user.populate('contacts').execPopulate();
		for (const contact of req.user.contacts) {
			await contact.populate('avatar').execPopulate();
		}
		const requestedContacts = queryHandler(
			req.user.contacts,
			req.query,
			selectFields
		);
		for (const contact of requestedContacts) {
			contact.numOfUnreadMessages = (
				await getSessionMessagesHandler(
					undefined,
					[req.user._id, contact._id],
					undefined,
					req.user
				)
			).filter((msg) => !msg.seenBy.includes(req.user._id)).length;
		}
		res.send(requestedContacts);
	} catch (e) {
		next(e);
	}
}

async function getUserHandler(req, res, next) {
	try {
		const user = await User.findById(req.params.userId).lean();
		if (!user) {
			return res.status(404).send();
		}
		res.send(user);
	} catch (e) {
		next(e);
	}
}

async function getAllNotificationsHandler(req, res, next) {
	try {
		const requestedNotifications = queryHandler(
			req.user.notifications,
			req.query
			// undefined,
			// 'receivedAt',
			// -1
		);

		res.send(requestedNotifications);

		await markAsRead(req.user, requestedNotifications);
		Socket.sendEventToRoom(req.user._id, SOCKET_EVENTS.NEW_NOTIFICATION, {
			notificationNumber: req.user.notifications.filter((notif) => !notif.seen)
				.length,
		});
	} catch (e) {
		next(e);
	}
}

async function getNotificationNumberHandler(req, res, next) {
	try {
		res.send({
			newNotificationsNumber: req.user.notifications.filter(
				(notif) => !notif.seen
			).length,
		});
	} catch (e) {
		next(e);
	}
}

async function markAsRead(user, requestedNotifications) {
	try {
		user.notifications.forEach((notif) => {
			if (requestedNotifications.includes(notif) && !notif.seen)
				notif.seen = true;
		});
		await user.save();
	} catch (e) {
		console.log('Mark Notifications Failed. Error:');
		console.log(e);
	}
}
async function getTeamInvitationsHandler(req, res, next) {
	try {
		const options = optionsBuilder(
			req.query.limit,
			req.query.skip,
			req.query.sortBy,
			req.query.sortValue
		);
		const match = matchBuilder(req.query);
		await req.user
			.populate({
				path: 'invitations',
				match,
				options,
			})
			.execPopulate();
		res.send(req.user.invitations);
	} catch (e) {
		next(e);
	}
}

// async function markAsSeen(msg) {
// 	let user;
// 	user = seenQueue.shift();
// 	msg.seenBy.push(user);
// 	await msg.save();
// 	if (seenQueue.length > 0) await markAsSeen(msg);
// }
// async function markQueue(msg) {
// 	await markAsSeen(msg);
// 	lock = null;
// }
// var seenQueue = [];
// var lock = null;
async function getUserMessagesHandler(req, res, next) {
	try {
		const contact = await User.findById(req.params.userId);
		if (!contact) {
			res.status(404);
			throw new Error('User not found.');
		}
		const options = optionsBuilder(
			req.query.limit,
			req.query.skip,
			req.query.sortBy,
			req.query.sortValue
		);
		// await req.user.populate('avatar', 'username _id avatar').execPopulate();
		// await contact.populate('avatar').execPopulate();

		let messages = await getSessionMessagesHandler(
			options,
			[req.user._id, contact._id],
			undefined,
			req.user
		);
		const session = await getSessionHandler([req.user._id, contact._id]);
		const allUnreadMessages = await Message.find({
			sessionId: session._id,
			seenBy: { $ne: req.user._id },
		});
		for (const msg of allUnreadMessages) {
			if (!msg.seenBy.includes(req.user._id)) {
				msg.seenBy.push(req.user._id);
				await msg.save();
			}
		}
		// for (const msg of messages) {
		// 	if (
		// 		!msg.from.equals(req.user._id) &&
		// 		!msg.seenBy.includes(req.user._id)
		// 	) {
		// 		if (seenQueue[msg._id]) {
		// 			seenQueue[msg._id] = [];
		// 		}
		// 		if (!msg.seenBy.includes(req.user._id)) seenQueue.push(req.user._id);
		// 		if (seenQueue.length == 1) {
		// 			if (lock === null) {
		// 				lock = true;
		// 				markQueue(msg);
		// 			}
		// 		}
		// 	}
		// }
		res.send(messages);
	} catch (e) {
		next(e);
	}
}
// currentMsgObject = msg.toObject();
// currentMsgObject.seen =
// 	currentMsgObject.createdAt <
// 	(participant.lastSeen ? participant.lastSeen : new Date(0));
// msgObjects.push(currentMsgObject);

// participant.lastSeen = Date.now();
// await Session.updateOne({ _id: session._id }, session);

async function getTeamMessagesHandler(req, res, next) {
	try {
		const options = optionsBuilder(
			req.query.limit,
			req.query.skip,
			'createdAt',
			-1
		);
		const messages = await getSessionMessagesHandler(
			options,
			undefined,
			req.params.teamId,
			req.user
		);
		for (const msg of messages) {
			await msg.populate('from', 'username _id avatar').execPopulate();
			if (msg.from) {
				await msg.from.populate('avatar').execPopulate();
			}
		}
		res.send(messages);
	} catch (e) {
		next(e);
	}
}

async function getUserByEmailHandler(req, res, next) {
	try {
		const user = await getSingleUserHandler({ email: req.params.email });
		res.send({ user });
	} catch (e) {
		res.status(400).send({ error: e.message });
	}
}

async function getUserByUsernameHandler(req, res, next) {
	try {
		const user = await getSingleUserHandler({ username: req.params.username });
		await user.populate('avatar').execPopulate();
		res.send(user);
	} catch (e) {
		next(e);
	}
}

async function getSingleUserHandler(queryObject) {
	const user = await User.findOne(queryObject);
	if (!user) {
		res.status(404);
		throw new Error('User not found.');
	}
	return user;
}

async function updateUserHandler(req, res, next) {
	try {
		const updates = Object.keys(req.body);
		if (updates.includes('password')) {
			if (updates.includes('oldPassword')) {
				await req.user.checkPassword(req.body.oldPassword);
				delete req.body.oldPassword;
			} else {
				throw new Error('Old Password Not Found.');
			}
		}
		await checkAndUpdate('USER', req.user, req.body, res);
		res.send(req.user);
	} catch (e) {
		next(e);
	}
}

async function addUserToTeamByIdHandler(req, res, next) {
	try {
		const user = await User.findById(req.params.userId);
		req.newMember = user;
		next();
	} catch (e) {
		next(e);
	}
}

async function addUserToTeamByUsernameHandler(req, res, next) {
	try {
		const user = await User.findOne({ username: req.params.username });
		req.newMember = user;
		next();
	} catch (e) {
		next(e);
	}
}

async function addUserToTeamHandler(req, res, next) {
	try {
		if (!req.newMember) {
			res.status(404);
			throw new Error('User not found.');
		}
		if (req.newMember.teams.includes(req.team._id)) {
			res.status(400);
			throw new Error('Already joined.');
		}

		req.newMember.teams.push(req.team._id);

		const session = await getSessionHandler(undefined, req.team._id);
		session.participants.push({ userId: req.newMember._id });
		console.log(session);
		await session.save();

		await newNotification(req.newMember, {
			event: {
				text: `${req.user.username} added you to his team '${req.team.name}'.`,
				reference: req.team,
			},
		});

		res.send({ success: true });
	} catch (e) {
		next(e);
	}
}

async function removeUserFromTeamHandler(req, res, next) {
	try {
		const user = await User.findOne({ _id: req.params.userId });
		if (!user) {
			res.status(404);
			throw new Error('User not found.');
		}
		if (!user.teams.includes(req.team._id)) {
			res.status(400);
			throw new Error('User is not team member.');
		}

		user.teams = user.teams.filter((teamId) => !teamId.equals(req.team._id));
		await user.save();

		const session = await getSessionHandler(undefined, req.team._id);
		session.participants = session.participants.filter(
			(participant) => !participant.userId.equals(user._id)
		);
		await session.save();

		await newNotification(user, {
			event: {
				text: `${req.user.username} removed you out of team: '${req.team.name}'.`,
				reference: req.team,
			},
		});

		res.send({ success: true });
	} catch (e) {
		next(e);
	}
}

// async function acceptTeamInvitationHandler(req, res, next) {
// 	try {
// 		if (
// 			!req.user.invitations.filter((inv) =>
// 				inv.teamId.equals(req.params.teamId)
// 			).length
// 		) {
// 			res.status(400);
// 			throw new Error('You have not been `1`d.');
// 		}
// 		req.user.invitations = req.user.invitations.filter((invitation) => {
// 			if (invitation.teamId.equals(req.params.teamId)) {
// 				req.user.teams.push(req.params.teamId);
// 				return false;
// 			}
// 			return true;
// 		});
// 		const team = await Team.findById(req.params.teamId);
// 		await addParticipantHandler(team._id, req.user._id);
// 		await req.user.save();
// 		await team.populate('leaderId').execPopulate();
// 		await newNotification(team.leaderId, {
// 			event: {
// 				text: `User ${req.user.username} has accepted your invitation.`,
// 				reference: team,
// 			},
// 		});

// 		const projects = await Project.find({ teamId: team._id });
// 		for (const project of projects) {
// 			await scheduleJobHandler(
// 				project.deadline,
// 				req.user._id,
// 				Socket,
// 				Project,
// 				project._id
// 			);
// 		}

// 		res.send(req.user.invitations);
// 	} catch (e) {
// 		next(e);
// 	}
// }

async function declineTeamInvitationHandler(req, res, next) {
	try {
		req.user.invitations = req.user.invitations.filter(
			(invitation) => !invitation.teamId.equals(req.params.teamId)
		);
		await req.user.save();
		res.send(req.user.invitations);
	} catch (e) {
		next(e);
	}
}

async function leaveTeamHandler(req, res, next) {
	try {
		if (req.team.leaderId.equals(req.user._id)) {
			res.status(406);
			throw new Error('You are Team leader.');
		}
		req.user.teams = req.user.teams.filter(
			(team) => !team.equals(req.team._id)
		);
		await req.user.save();
		await req.user.populate('teams').execPopulate();
		res.send(req.user.teams);
	} catch (e) {
		next(e);
	}
}

async function updateSettingsHandler(req, res, next) {
	try {
		const updates = Object.keys(req.body);
		const isValidUpdate = updates.every((update) =>
			allowedKeys.SETTINGS.includes(update)
		);
		if (!isValidUpdate) {
			res.status(422);
			throw new Error('Invalid update fields.');
		}
		updates.forEach((update) => {
			if (update.toString() === 'projectView') {
				const index = req.user.settings.projectView.findIndex((prView) =>
					prView.reference.equals(req.body[update].reference)
				);
				if (index !== -1) {
					req.user.settings.projectView[index] = req.body[update];
				} else {
					req.user.settings.projectView.push(req.body[update]);
				}
			} else {
				req.user.settings[update] = req.body[update];
			}
		});
		await req.user.save();
		res.send(req.user.settings);
	} catch (e) {
		next(e);
	}
}

async function updateContactListHandler(req, res, next) {
	try {
		const user = await User.findOne({ username: req.params.username });
		if (!user) {
			res.status(404);
			throw new Error('User not found.');
		}
		if (req.user.contacts.includes(user._id)) {
			req.user.contacts = req.user.contacts.filter(
				(userId) => !userId.equals(user._id)
			);
			const messages = await getSessionMessagesHandler(
				undefined,
				[req.user._id, user._id],
				undefined,
				req.user
			);
			for (const msg of messages) {
				if (!msg.deletedBy.includes(req.user._id)) {
					msg.deletedBy.push(req.user._id);
					await msg.save();
				}
			}
		} else {
			req.user.contacts.push(user._id);
		}
		await req.user.save();
		await user.populate('avatar').execPopulate();
		res.send(user);
	} catch (e) {
		next(e);
	}
}

async function sendResetTokenHandler(req, res, next) {
	try {
		const user = await User.findOne({ email: req.params.email });
		if (!user) {
			res.status(404);
			throw new Error('User not found.');
		}
		const key = generateKey(6);
		user.resetToken = {
			key,
			expiresIn: new Date(Date.now() + timeValues.hour),
		};
		await user.save();
		sendResetTokenMail('zlatanovic007@gmail.com', key);
		res.send(user);
	} catch (e) {
		next(e);
	}
}
function generateKey(len) {
	var newPassword = [];
	var characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (var i = 0; i < len; i++) {
		newPassword.push(
			characters.charAt(Math.floor(Math.random() * characters.length))
		);
	}
	return newPassword.join('');
}
async function changePasswordHandler(req, res, next) {
	try {
		const user = await User.findOne({ email: req.params.email });
		if (!user) {
			res.status(404);
			throw new Error('User not found.');
		}
		const rtKey = user.resetToken.key;
		if (
			user.resetToken &&
			(user.resetToken.expiresIn.getTime() < Date.now() ||
				!(await bcrypt.compare(req.params.key, rtKey)))
		) {
			throw new Error('Invalid reset token');
		}

		user.resetToken.expiresIn = new Date(Date.now());
		await user.save();
		const token = await user.generateAuthToken();

		res.send({ user, token });
	} catch (e) {
		next(e);
	}
}

async function deleteUserHandler(req, res, next) {
	try {
		if (req.user.teams.length > 0) {
			let users;
			await req.user.populate('teams').execPopulate();
			for (const team of req.user.teams) {
				if (team.leaderId.equals(req.user._id)) {
					await team.populate('members').execPopulate();
					for (const member of team.members) {
						member.teams = member.teams.filter(
							(teamId) => !teamId.equals(team._id)
						);
					}
					await deleteSingleTeamHandler(team, req.user);
				}
			}
		}

		await req.user.remove();
		res.send(req.user);
	} catch (e) {
		next(e);
	}
}

async function getAllUsersHandler(req, res, next) {
	try {
		const options = optionsBuilder(
			req.query.limit,
			req.query.skip,
			req.query.sortBy,
			req.query.sortValue
		);
		const match = matchBuilder(req.query);
		const users = await User.find({ ...match }, selectFields, options).lean();
		res.send(users);
	} catch (e) {
		next(e);
	}
}

async function deleteAnyUserHandler(req, res, next) {
	try {
		if (!req.admin) {
			res.status(403);
			throw new Error('You are not admin.');
		}
		const user = await User.findById(req.params.userId);
		if (!user) {
			res.status(404);
			throw new Error('User not found.');
		}
		if (user.teams && user.teams.length) {
			await user.populate('teams').execPopulate();
			for (const team of user.teams) {
				if (team.leaderId.equals(user._id)) {
					await deleteSingleTeamHandler(team, req.user);
				}
			}
		}
		const contacts = await User.find({ contacts: user._id });
		for (const contact of contacts) {
			contact.contacts = contact.contacts.filter(
				(con) => !con.equals(user._id)
			);
			await contact.save();
		}
		await user.remove();
		res.send({ success: true });
	} catch (e) {
		next(e);
	}
}

async function testNotif(req, res, next) {
	try {
		newNotification(req.user, {
			event: {
				text: `Test.`,
				reference: req.user,
			},
		});
		res.send({ success: true });
	} catch (e) {
		next(e);
	}
}

async function suspendUserHandler(req, res, next) {
	try {
		const user = await User.findById(req.params.userId);
		user.suspended.isSuspended = true;
		if (!req.body.days || Number(req.body.days) === NaN)
			throw new Error('Pass the number of days in body.');
		user.suspended.suspendedUntil =
			Date.now() + TIME_VALUES.day * Number(req.body.days);
		await user.save();
		res.send({ success: true });
	} catch (e) {
		next(e);
	}
}

module.exports = {
	createUserHandler,
	loginUserHandler,
	logoutUserHandler,
	getProfileHandler,
	getUserHandler,
	getAllUsersHandler,
	updateUserHandler,
	deleteUserHandler,
	addUserToTeamByIdHandler,
	addUserToTeamByUsernameHandler,
	getTeamInvitationsHandler,
	addUserToTeamHandler,
	//	acceptTeamInvitationHandler,
	declineTeamInvitationHandler,
	deleteAnyUserHandler,
	getAllNotificationsHandler,
	getUserByEmailHandler,
	getUserMessagesHandler,
	getTeamMessagesHandler,
	getUserByUsernameHandler,
	setAvatarHandler,
	getAvatarHandler,
	getContactsHandler,
	updateSettingsHandler,
	updateContactListHandler,
	sendResetTokenHandler,
	changePasswordHandler,
	leaveTeamHandler,
	testNotif,
	getNotificationNumberHandler,
	removeUserFromTeamHandler,
	suspendUserHandler,
};
