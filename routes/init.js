const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const fetch = require('node-fetch');
const path = require('path');

const Datastore = require('nedb');
const userPath = path.join(__dirname, '../Database/users.db');
const db = new Datastore({ filename: userPath, autoload: true });

addUser = user => {
    db.insert(user);
};

router.use(function timeLog(req, res, next) {
    console.log('Time: ', Date.now());
    next();
});
/* GET users listing. */
router.get('/', async (req, res, next) => {
    const temp = await fetch('https://api.jsonbin.io/b/5d1339e6f467d60d75a8c9c6/4', {
        headers: {
            'secret-key': '$2a$10$.w5QIuNUx5d0nTzRIgaHlOepRy9HbdGVWlTD21MUCdnA8j3IPz4MS'
        }
    });
    const data = await temp.json();
    const formattedData = data.reduce((acc, curr) => [...acc, ...curr], []);
    db.remove({}, { multi: true });
    db.insert(formattedData);
    db.find({}, function(err, docs) {
        console.log(docs);
    });
    res.send(formattedData);
});

router.get('/searchUser', (req, res, next) => {
    const formattedQuery = Object.entries(req.query).map(([key, value]) => {
        return { [key]: { ['$regex']: new RegExp(value, 'i') } };
    });
    console.log(formattedQuery);
    db.find({ $or: formattedQuery }, function(err, docs) {
        if (err || !docs.length) {
            next(createError(404));
        } else {
            res.send(docs).status(200);
        }
    });
});

router.get('/:name', (req, res, next) => {
    db.find({ name: req.params.name }, function(err, docs) {
        console.log(docs);
        if (err || !docs.length) {
            next(createError(404));
        } else {
            res.send(docs).status(200);
        }
    });
});

router.post('/', (req, res) => {
    addUser({ name: req.query.name });
    res.status(200).send('User Added successfully');
});

router.put('/', (req, res) => {
    res.send('Update the Database');
});

router.delete('/', (req, res) => {
    db.remove({}, { multi: true });
    res.send('DataBase Deleted');
});

module.exports = router;
