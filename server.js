const fs = require("fs");
const path = require("path");
const express = require('express');
const { notes } = require('./db/db');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(express.static('public'));

function findById(id, notesArray) {
    const result = notesArray.filter(note => note.id === id)[0];
    return result;
}

function createNewNote (body, notesArray) {
    const note = body;
    notesArray.push(note);

    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify({ notes: notesArray }, null, 2)
    );

    return body;
}

function deleteNote (body, notesArray) {
    const note = body;
    notesArray.splice(notesArray.lastIndexOf(note) ,1);

    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify({ notes: notesArray }, null, 2)
    );
}

function validateNote(note) {
    if (!note.title || typeof note.title !== 'string') {
        return false;
    }
    if (!note.text || typeof note.text !== 'string') {
        return false;
    }
    return true;
}

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});

app.get('/api/notes', (req, res) => {
    res.json(notes);
});

app.get('/api/notes/:id', (req, res) => {
    const result = findById(req.params.id, notes);
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
});

app.post('/api/notes', (req, res) => {
    if(notes.length === 0)
        req.body.id = '0';
    else
        req.body.id = (parseInt(notes[notes.length - 1].id) + 1).toString();

    if (!validateNote(req.body)) {
        res.status(400).send("The note is not properly formatted.")
    } else {
        const note = createNewNote(req.body, notes);
        res.json(note);
    }
});

app.delete('/api/notes/:id', (req, res) => {
    const result = findById(req.params.id, notes);
    deleteNote(result, notes);
    res.send('DELETE request to homepage');
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '.public/index.html'));
});