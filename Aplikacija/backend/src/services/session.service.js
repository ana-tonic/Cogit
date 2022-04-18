const { User, Session, Message } = require('../db/models');
const { optionsBuilder, destructureObject } = require('./utils/services.utils');

async function createPrivateSessionHandler(req, res, next) {
	try {
		const session = getSessionHandler([
			req.user._id.toString(),
			req.params.userId,
		]);
		res.send(session);
	} catch (e) {
		next(e);
	}
}

async function getUsersPrivateSessions(req, res, next) {
	try {
		const sessions = await Session.find({
			participants: { $elemMatch: { userId: req.user._id } },
			teamId: { $exists: false },
		}).lean();
		res.send(sessions);
	} catch (e) {
		next(e);
	}
}

async function getOnePrivateSession(req, res, next) {
	try {
		const session = await getPrivateSessionHandler([
			req.user._id,
			req.params.userId,
		]);
		res.send(session);
	} catch (e) {
		next(e);
	}
}

async function teamSessionHandler(req, res, next) {
	try {
		const session = await Session.findOne({
			teamId: req.params.teamId,
		}).lean();
		res.send(session);
	} catch (e) {
		next(e);
	}
}

async function getMessagesHandler(req, res, next) {
	try {
		const options = optionsBuilder(
			req.query.limit,
			req.query.skip,
			'createdAt',
			1
		);
		const sessionMessages = await Message.find(
			{
				sessionId: req.params.sessionId,
			},
			'from text createdAt -_id',
			options
		);
		res.send(sessionMessages);
	} catch (e) {
		next(e);
	}
}

async function getSessionHandler(sessionParticipants, teamId) {
	let session;
	if (teamId) {
		session = await getTeamSessionHandler(teamId);
		if (session) {
			await session.updateParticipants();
		}
	} else {
		session = await getPrivateSessionHandler(sessionParticipants);
	}
	console.log(sessionParticipants);
	console.log(session);
	return session
		? session
		: await newSessionHandler(sessionParticipants, teamId);
}

async function newSessionHandler(sessionParticipants, teamId) {
	const newSession = new Session({
		teamId: teamId ? teamId : undefined,
	});
	if (teamId) {
		users = await User.find({
			teams: teamId,
		}).lean();
		users.forEach((user) => {
			newSession.participants.push({
				userId: user._id,
			});
		});
	} else {
		for (const userId of sessionParticipants) {
			let user = await User.findById(userId);
			let contact = sessionParticipants.find(
				(participant) => !participant.equals(user._id)
			);
			contact = contact ? contact : userId;
			if (!user.contacts.includes(contact)) user.contacts.push(contact);
			await user.save();
			newSession.participants.push({
				userId,
			});
		}
	}
	await newSession.save();
	return newSession;
}

async function getSessionMessagesHandler(
	options,
	sessionParticipants,
	teamId,
	user
) {
	try {
		const session = await getSessionHandler(sessionParticipants, teamId);
		let sessionMessages;
		if (session) {
			sessionMessages = await Message.find(
				{
					sessionId: session._id,
					deletedBy: { $ne: user._id },
				},
				'from deletedBy seenBy text createdAt id _id',
				options
			);
		}
		return sessionMessages ? sessionMessages : [];
	} catch (e) {
		throw new Error(e.message);
	}
}

async function getTeamSessionHandler(teamId) {
	const session = await Session.findOne({
		teamId,
	});
	return session;
}

async function getPrivateSessionHandler(sessionParticipants) {
	let session;
	console.log(sessionParticipants);
	if (sessionParticipants[0].equals(sessionParticipants[1])) {
		console.log('sadsads');
		let sessions = await Session.find({
			$and: [
				{
					participants: {
						$all: { $elemMatch: { userId: { $in: [sessionParticipants[0]] } } },
					},
				},
				{ teamId: { $exists: false } },
			],
		});
		session = sessions.find((session) =>
			session.participants.every((participant) =>
				participant.userId.equals(sessionParticipants[0])
			)
		);
		return session;
	}
	session = await Session.findOne({
		$and: [
			{ participants: { $elemMatch: { userId: sessionParticipants[0] } } },
			{ participants: { $elemMatch: { userId: sessionParticipants[1] } } },
			{ teamId: { $exists: false } },
		],
	});
	// sessions.forEach((session) => {
	// 	session.userIds = session.participants.map(
	// 		(participant) => participant.userId
	// 	);
	// 	if (
	// 		session.userIds.sort().toString() ===
	// 		sessionParticipants.sort().toString()
	// 	) {
	// 		result = session;
	// 	}
	// });
	return session;
}

async function addParticipantHandler(teamId, userId) {
	try {
		const session = await Session.findOne({ teamId });
		session.participants.forEach((par) => {
			if (par.userId.equals(userId)) {
				res.status(500);
				throw new Error('already member');
			}
		});
		session.participants.push({
			userId,
		});
		await session.save();
		return true;
	} catch (e) {
		next(e);
	}
}
module.exports = {
	addParticipantHandler,
	newSessionHandler,
	getTeamSessionHandler,
	getSessionMessagesHandler,
	getSessionHandler,
	getPrivateSessionHandler,
	createPrivateSessionHandler,
	getUsersPrivateSessions,
	teamSessionHandler,
	getMessagesHandler,
	getOnePrivateSession,
};
