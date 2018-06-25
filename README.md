# Tim's Art API

An api that manages paintings.

## Getting Started

This API is intended for storing famous paintings. If you have rights to the repo, simply clone. Otherwise, you should fork this repo.

After you fork, you should clone it to your local computer:

```
git clone <https://github.com/timmywertz/art-api-exam.git>
```

Then make sure to install all of the dependencies:

```
cd art-api-exam
npm install
```

In case any of the dependencies are not immediately installed, they are listed below so you can verify with your **package.json** file.

```
npm install pouchdb-find pouchdb-core pouchdb-adapter-http dotenv ramda node-http-error nodemon express body-parser
```

## Establish Environment Variables

You will need to create a local **.env** file to store your application's secrets and other configuration values. First, make sure that _".env"_ is written in your **.gitignore** file to maintain its privacy. Then create your **.env**.

```
touch .env
```

1.  `PORT`. Create a `PORT` environment variable. Set the value to an unused port number for your machine.
2.  `COUCH_HOSTNAME=https://{user}:{pwd}@{dbhostname}/`
3.  `COUCH_DBNAME=surfboards`

**.env file example**:

```
PORT=5432
COUCH_HOSTNAME=https://admin:8hA23IUjmfcl1@billy.jrscode.cloud/
COUCH_DBNAME=paintings
```

## Load some test data

You can load data in your CouchDB database by running `npm run load`. This will take the array of documents within **load-data.js** and add them into the database.

```
npm run load
```

You will want to make sure that the following plug-ins also match your port information within the **.env** file.

```
require('dotenv').config()
const PouchDB = require('pouchdb-core')
PouchDB.plugin(require('pouchdb-adapter-http'))

const db = new PouchDB(
	`${process.env.COUCH_HOSTNAME}${process.env.COUCH_DBNAME}`
)
```

## Start the API

The following command will start the API on your designated port.

```
npm start
```

This API allows you to create, read, update, delete and list various famous paintings. Please let me know your thoughts, and submit pull requests for edits.

## Create a Painting - `POST /paintings`

Add a painting to the collection by providing a new resource in the request body.

The `name`, `category`, `price`, and `sku` properties are required.

**Example**

```
POST /paintings

{
  "name": "The Persistence of Memory",
  "movement": "surrealism",
  "artist": "Salvador Dali",
  "yearCreated": 1931,
  "museum": {"name": "Museum of Modern Art", "location": "New York"}
}
```

### Response 201 OK - Created

Returned when the operation successfully adds a painting.

```
  {
    "ok": true,
    "id": "painting_persistence_of_memory",
    "rev": "1-c617189487fbe325d01cb7fc74acf45b"
  }
```

### Response 400 Bad request

Returned when the supplied request body is missing or if any required fields are missing.

### Response 404 Not Found

The requested resource could not be found. You may be trying to access a record that does not exist, or you may have supplied an invalid URL.

### Response 500 Internal Server Error

An unexpected error has occurred on our side. You should never receive this response, but if you do please let us know and we'll fix it.

## Get a single painting - `GET /paintings/:id`

Retrieve a single painting resource from the collection of boards. Use the _id_ to identify a single painting.

**Example**

```
GET /paintings/painting_bal_du_moulin_de_la_galette
```

If found, the painting will be returned in the response body.

```
  {
  "_id": "painting_bal_du_moulin_de_la_galette",
  "_rev": "1-c617189487fbe325d01cb7fc74acf45b",
  "name": "Bal du moulin de la Galette",
  "type": "painting",
  "movement": "impressionism",
  "artist": "Pierre-Auguste Renoires",
  "yearCreated": 1876,
  "museum": {"name": "Musée d’Orsay", "location": "Paris"}
}
```

### Response 200 OK

Returned when the operation successfully retrieves the painting.

### Response 404 Not Found

The requested resource could not be found. You may be trying to access a record that does not exist, or you may have supplied an invalid URL.

### Response 500 Internal Server Error

An unexpected error has occurred on our side. You should never receive this response, but if you do please let us know and we'll fix it.

## Update a Painting - `PUT /paintings/:id`

Edits a painting. Provide the `id` in the path to identify the painting. Provide the updated painting in the body of the request.

The `_id`, `_rev`, `type`, `name`, `category`, `price`, and `sku` properties are required.

---

**Example**

Here's an example of updating the price of the brah surfboard to 599.99

```
PUT /boards/58748

{
  "_id": "board_58748",
  "_rev": "1-10e675d267f4a1961c278014f38aec1f",
  "name": "brah",
  "category": "longboard",
  "price": 599.99,
  "sku": "58748",
  "type": "board"
}
```

### Response 200 OK

Returned when the operation successfully update the surfboard.

```
{
  "ok": true,
  "id": "add",
  "rev": "2-A6157A5EA545C99B00FF904EEF05FD9F"
}
```

### Response 400 Bad request

Returned when the supplied request body is missing or if required fields are missing.

### Response 404 Not Found

The requested resource could not be found. You may be trying to access a record that does not exist, or you may have supplied an invalid URL.

### Response 500 Internal Server Error

An unexpected error has occurred on our side. You should never receive this response, but if you do please let us know and we'll fix it.
