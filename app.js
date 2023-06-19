const express = require('express');
const hbs = require('hbs');
const expressHbs = require('express-handlebars');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const { request } = require('http');
const { redirect } = require('express/lib/response');
const app = express();

app.engine('hbs', expressHbs.engine({
    layoutsDir: 'views/layouts',
    defaultLayout: 'layout',
    extname: 'hbs'
}));
app.set('view engine', 'hbs');
app.use(fileUpload());
hbs.registerPartials(__dirname + '/views/partials');
app.use(express.static(__dirname + '/static'));

function isIterable(obj) {
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}

app.get('/', (request, response) => {

    let readCoverDir = fs.readdirSync(__dirname + '/static/albums/series').sort();
    let arrObjectCovers = [];
    let i = 1;
    for (let albumNum of readCoverDir) {
        arrObjectCovers.push({ id: albumNum, name: 'cover.jpg' });
        i++;
    }
    arrObjectCovers.reverse();
    response.render('albums', {
        cover: arrObjectCovers
    });
});

app.get('/album/viewing/:idAlbum', (request, response) => {

    const idAlbum = request.params['idAlbum'];
    let readAlbumDir = fs.readdirSync(__dirname + `/static/albums/series/${idAlbum}`);
    let arrObjectAlbum = [];
    for (let imgName of readAlbumDir) {
        arrObjectAlbum.push({ id: idAlbum, name: imgName })
    }
    response.render('album', {
        imgItem: arrObjectAlbum
    });
});

app.get('/login', (request, response) => {

    response.render('login');
});

app.get('/album/create', (request, response) => {

    response.render('create-album');
});

app.post('/upload/album', (request, response) => {

    const series = request.files['series'];
    const cover = request.files['cover'];

    const lengthAlbums = fs.readdirSync(__dirname + '/static/albums/series').map((value) => Number(value));
    const newFolderNum = Math.max.apply(null, lengthAlbums) + 1;
    fs.mkdirSync(__dirname + `/static/albums/series/${newFolderNum}`);
    cover.mv(__dirname + `/static/albums/series/${newFolderNum}/cover.jpg`);

    if (isIterable(series)) {
        for (let image of series) {
            image.mv(__dirname + `/static/albums/series/${newFolderNum}/${image.name}`);
        }
    }
    else {
        series.mv(__dirname + `/static/albums/series/${newFolderNum}/${series.name}`);
    }
    response.redirect('/');
})

app.delete('/album/delete/:idAlbum', (request, response) => {

    const idAlbum = request.params['idAlbum'];
    fs.rmSync(__dirname + `/static/albums/series/${idAlbum}`, { recursive: true, force: true });
    response.send('delete ok');
});

app.get('/about', (request, response) => {

    response.render('about');
});

app.get('/contacts', (request, response) => {

    response.render('contacts');
});

app.listen(3000);