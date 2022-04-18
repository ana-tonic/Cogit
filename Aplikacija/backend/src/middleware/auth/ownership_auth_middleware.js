const lodash = require('lodash');

function ownershipAuthMiddleware(
	parentModel,
	parentIdPropertyPath,
	requestSaveInProperty,
	childIdentifierProperty,
	childIdProrpertyPath
) {
	return async (req, res, next) => {
		try {
			if (req[requestSaveInProperty]) {
				return next();
			}
			const parentId = lodash.get(req, parentIdPropertyPath);
			const childId = lodash.get(req, childIdProrpertyPath);
			const findQuery = {
				_id: parentId,
			};
			const searchedModel = await parentModel.findOne(findQuery);
			if (!req.admin) {
				findQuery[childIdentifierProperty] = childId;
			}
			const model = await parentModel.findOne(findQuery);
			if (!searchedModel) {
				res.status(404);
				throw new Error('Dcoument not found.');
			}
			if (!model) {
				res.status(403);
				throw new Error('You dont have permission to access this document.');
			}
			req[requestSaveInProperty] = model;
			next();
		} catch (e) {
			next(e);
		}
	};
}

module.exports = {
	ownershipAuthMiddleware,
};
