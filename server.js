var express = require('express');
var bodyParser = require('body-parser');
var multiparty = require('connect-multiparty');
var mongodb = require('mongodb');
var objectId = require('mongodb').ObjectId;
var fs = require('fs');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multiparty());

var port = 8080;

app.listen(port);

var db = new mongodb.Db('instagram', new mongodb.Server('localhost', 27017, {}), {});

console.log('Servidor HTTP escutando na porta: ' + port);

app.get('/', function(req, res) {
    var resposta = { msg: 'Olá Postman' };
    res.send(resposta);
});

app.post('/api', function(req, res) {

    res.setHeader('Access-Control-Allow-Origin', '*');

    var date = new Date();
    time_stamp = date.getDate();

    var url_imagen = time_stamp + '' + req.files.arquivo.originalFilename;

    var path_origen = req.files.arquivo.path;
    var path_destino = './uploads/' + url_imagen;



    fs.rename(path_origen, path_destino, function(err) {
        if (err) {
            res.status(500).json({ error: err });
            return;
        }

        var dados = {
            titulo: req.body.titulo,
            url_imagen: url_imagen
        }

        db.open(function(err, mongoclient) {
            mongoclient.collection('postagens', function(err, collection) {
                collection.insert(dados, function(err, records) {
                    if (err) {
                        res.json({ 'status': 'erro' });
                    } else {
                        res.json({ 'status': 'inclusao realizada com sucesso' });
                    }
                    mongoclient.close();
                });
            });
        });
    });
});

app.get('/api', function(req, res) {
    db.open(function(err, mongoclient) {
        mongoclient.collection('postagens', function(err, collection) {
            collection.find().toArray(function(err, result) {
                if (err) {
                    res.json(err);
                } else {
                    res.json(result);
                }
                mongoclient.close();
            });
        });
    });
});

app.get('/api/:id', function(req, res) {
    db.open(function(err, mongoclient) {
        mongoclient.collection('postagens', function(err, collection) {
            collection.find(objectId(req.params.id)).toArray(function(err, result) {
                if (err) {
                    res.json(err);
                } else {
                    res.json(result);
                }
                mongoclient.close();
            });
        });
    });
});

app.put('/api/:id', function(req, res) {
    db.open(function(err, mongoclient) {
        mongoclient.collection('postagens', function(err, collection) {
            collection.update({ _id: objectId(req.params.id) }, { $set: { titulo: req.body.titulo, url_imagen: req.body.url_imagen } }, {},
                function(err, records) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    }
                    mongoclient.close();
                });
        });
    });
});

app.delete('/api/:id', function(req, res) {
    db.open(function(err, mongoclient) {
        mongoclient.collection('postagens', function(err, collection) {
            collection.remove({ _id: objectId(req.params.id) }, function(err, records) {
                if (err) {
                    res.json(err);
                } else {
                    res.json(records);
                }
                mongoclient.close();
            });
        });
    });
});