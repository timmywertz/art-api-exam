require('dotenv').config()
const PouchDB = require('pouchdb-core')
//PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-adapter-http'))

const { map, merge } = require('ramda')
const pkGen = require('./lib/pk-gen')

const db = new PouchDB(
	`${process.env.COUCH_HOSTNAME}${process.env.COUCH_DBNAME}`
)

const getPaintings = (id, callback) => db.get(id, callback)

const addPaintings = (painting, callback) => {
	const modifiedPainting = merge(painting, {
		type: 'painting',
		_id: pkGen('painting', '_', `${painting.name}`)
	})
	db.put(modifiedPainting, callback)
}

const listPaintings = (limit, paginate, callback) => {
	const options = paginate
		? { include_docs: true, limit: limit, start_key: `${paginate}\ufff0` }
		: { include_docs: true, limit: limit }

	db.allDocs(options, function(err, result) {
		if (err) {
			callback(err)
			return
		}
		callback(null, map(row => row.doc, result.rows))
	})
}

const updatePaintings = (painting, callback) => db.put(painting, callback)

const deletePaintings = (paintingID, callback) => {
	db.get(paintingID, function(err, painting) {
		if (err) {
			callback(err)
			return
		}
		db.remove(painting, function(err, deletedPainting) {
			if (err) {
				callback(err)
				return
			}
			callback(null, deletedPainting)
		})
	})
}

//(painting, callback) => db.remove(painting, callback)

module.exports = {
	addPaintings,
	getPaintings,
	updatePaintings,
	deletePaintings,
	listPaintings
}
