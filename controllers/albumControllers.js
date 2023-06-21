const client = require('../db/connection._db');
const Albums = require('../model/albums');
const albums = new Albums();

exports.viewing = (request, response) => {
    const idAlbum = request.params['idAlbum'];

    response.render('album', {
        imgItem: albums.viewing(idAlbum)
    });
}

exports.isAuth = (request, response, next) => {
    let cookie = request.cookies['authToken'];
    if (cookie === undefined) {
        return response.send('У вас недостаточно прав');
    }
    client.query(`select uuid from uuid_tokens where uuid=$1`, [cookie], (err, result) => {
        if (err) console.log(err);
        if (result.rows.length === 0) {
             return response.send('У вас недостаточно прав');
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
    albums.upload(cover, series);
    response.redirect('/');
}

exports.delete = (request, response) => {
    const idAlbum = request.params['idAlbum'];
    albums.delete(idAlbum);
    response.send('albums');
}