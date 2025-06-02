const path = require('path');
var Todo = require('./models/todo');

function getTodos(res) {
    Todo.find(function (err, todos) {
        if (err) return res.send(err);
        res.json(todos);
    });
}

module.exports = function (app) {

    // get all todos
    app.get('/api/todos', function (req, res) {
        getTodos(res);
    });

    // create todo and send back all todos
    app.post('/api/todos', function (req, res) {
        Todo.create({
            text: req.body.text,
            done: false
        }, function (err, todo) {
            if (err) return res.send(err);
            getTodos(res);
        });
    });

    // delete a todo
    app.delete('/api/todos/:todo_id', function (req, res) {
        Todo.remove({
            _id: req.params.todo_id
        }, function (err, todo) {
            if (err) return res.send(err);
            getTodos(res);
        });
    });

    // load single page view — исправлен путь к index.html
    app.get('*', function (req, res) {
        res.sendFile(path.resolve(__dirname, '../public/index.html'));
    });
};
