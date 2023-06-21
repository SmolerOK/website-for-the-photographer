const client = require('../db/connection._db');
const fs = require('fs');

function isIterable(obj) {
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}

exports.viewing = (request, response) => {
    const idAlbum = request.params['idAlbum'];
    let readAlbumDir = fs.readdirSync(__dirname + `/../static/albums/series/${idAlbum}`);
    let arrObjectAlbum = [];
    for (let imgName of readAlbumDir) {
        arrObjectAlbum.push({ id: idAlbum, name: imgName })
    }
    response.render('album', {
        imgItem: arrObjectAlbum
    });
}

exports.isAuth = (request, response, next) => {
    let cookie = request.cookies['authToken'];
    if (cookie === undefined) {
        response.send('У вас недостаточно прав');
    }
    client.query(`select uuid from uuid_tokens where uuid=$1`, [cookie], (err, result) => {
        if (err) console.log(err);
        if (result.rows.length === 0) {
            response.sendStatus(404);
            return;
        }
        if (result.rows[0].uuid === cookie) next();
    });
}

exports.create = (_, response) => {
    response.render('create-album');
}

exports.upload = (request, response) => {
    const series = request.files['series'];
    const cover = request.files['cover'];

    const lengthAlbums = fs.readdirSync(__dirname + '/../static/albums/series').map((value) => Number(value));
    let newFolderNum = Math.max.apply(null, lengthAlbums) + 1;
    if (lengthAlbums.length === 0) {
        newFolderNum = 1;
    }
    fs.mkdirSync(__dirname + `/../static/albums/series/${newFolderNum}`);
    cover.mv(__dirname + `/../static/albums/series/${newFolderNum}/cover.jpg`);

    if (isIterable(series)) {
        for (let image of series) {
            image.mv(__dirname + `/../static/albums/series/${newFolderNum}/${image.name}`);
        }
    }
    else {
        series.mv(__dirname + `/../static/albums/series/${newFolderNum}/${series.name}`);
    }
    response.redirect('/');
}

exports.delete = (request, response) => {
    const idAlbum = request.params['idAlbum'];
    fs.rmSync(__dirname + `/../static/albums/series/${idAlbum}`, { recursive: true, force: true });
    response.send('delete ok');
}