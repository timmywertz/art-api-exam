require('dotenv').config()
const app = require('express')()
//const app = express()
const port = process.env.PORT || 5678
const bodyParser = require('body-parser')
const NodeHTTPError = require('node-http-error')
const checkRequiredFields = require('./lib/check-required-fields')
const cleanObj = require('./lib/clean-obj')
const createMissingFieldsMsg = require('./lib/create-missing-field-msg')

const {
	compose,
	keys,
	join,
	pathOr,
	propEq,
	propOr,
	isEmpty,
	not,
	valuesIn
} = require('ramda')

const {
	addPaintings,
	getPaintings,
	updatePaintings,
	deletePaintings,
	listPaintings
} = require('./dal')

app.use(bodyParser.json())

app.get('/', function(req, res, next) {
	res.send('Welcome to the Art API. Manage all the paintings.')
})

app.get('/paintings/:id', function(req, res, next) {
	const paintingID = req.params.id
	getPaintings(paintingID, function(err, painting) {
		if (err) {
			next(new NodeHTTPError(err.status, err.message, err))
			return
		}
		res.status(200).send(painting)
	})
})

app.get('/paintings', function(req, res, next) {
	const limit = Number(pathOr(5, ['query', 'limit'], req))
	const paginate = pathOr(null, ['query', 'start_key'], req)

	listPaintings(limit, paginate, function(err, paintings) {
		if (err) {
			next(new NodeHTTPError(err.status, err.message, err))
			return
		}
		res.status(200).send(paintings)
	})
})

//filter
app.get('/paintings', function(req, res, next) {})

app.post('/paintings', function(req, res, next) {
	const newPainting = propOr({}, 'body', req)

	if (isEmpty(newPainting)) {
		next(
			new NodeHTTPError(
				400,
				'Please add a painting to the request body. Ensure that the Content-Type is Application/JSON.'
			)
		)
		return
	}

	const missingFields = checkRequiredFields(
		['name', 'movement', 'artist', 'yearCreated', 'museum'],
		newPainting
	)

	const sendMissingFieldError = compose(
		not,
		isEmpty
	)(missingFields)

	if (sendMissingFieldError) {
		next(
			new NodeHTTPError(
				400,
				`You didn't pass all of the required fields: ${join(
					', ',
					missingFields
				)}`
			)
		)
		return
	}

	addPaintings(newPainting, function(err, painting) {
		if (err) next(new NodeHTTPError(err.status, err.message, err))
		res.status(201).send(painting)
	})
})

app.put('/paintings/:id', function(req, res, next) {
	const newPainting = propOr({}, 'body', req)

	if (isEmpty(newPainting)) {
		next(
			new NodeHTTPError(
				400,
				'Please add a painting to the request body. Ensure that the Content-Type is Application/JSON.'
			)
		)
		return
	}
	const missingFields = checkRequiredFields(
		[
			'_id',
			'_rev',
			'name',
			'movement',
			'type',
			'artist',
			'yearCreated',
			'museum' //,
			//`${museum.keys('name')}` //,
			//'{museum.name}'
			//'museum.keys("location")'
		],
		newPainting
	)

	if (not(isEmpty(missingFields))) {
		next(new NodeHTTPError(400, `${createMissingFieldsMsg(missingFields)}`))
		return
	}

	if (not(propEq('rev', req.params.rev, newPainting))) {
		next(
			new NodeHTTPError(
				409,
				'Conflict. This _rev is not up to date, please ensure it is the most recent one.'
			)
		)
		return
	}

	updatePaintings(newPainting, function(err, replacePainting) {
		if (err) {
			next(new NodeHTTPError(err.status, err.message, err))
			return
		}
		res.status(200).send(replacePainting)
	})
})

app.delete('/paintings/:id', function(req, res, next) {
	const paintingID = req.params.id
	// getPainting(paintingID, function(err, painting) {
	// 	if (err) {
	// 		next(new NodeHTTPError(err.status, err.message, err))
	// 		return
	// 	}
	deletePaintings(paintingID, function(err, painting) {
		if (err) {
			next(new NodeHTTPError(err.status, err.message, err))
			return
		}
		res.status(200).send(painting)
		// })
	})
})

app.use(function(err, req, res, next) {
	console.log(
		'ERROR! ',
		'METHOD: ',
		req.method,
		' PATH',
		req.path,
		' error:',
		JSON.stringify(err)
	)
	res.status(err.status || 500)
	res.send(err)
})

app.listen(port, () => console.log('API is up', port))
