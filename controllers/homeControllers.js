const client = require('../db/connection._db');
const { v4: uuid } = require('uuid');
const fs = require('fs');

exports.home = (_, response) => {
    let readCoverDir = fs.readdirSync(__dirname + '/../static/albums/series').sort();
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
}

exports.login = (_, response) => {
    response.render('login');
}

exports.authorization = (request, response) => {
    const login = request.body.login;
    const password = request.body.password;

    client.query(`select * from accounts where login=$1`, [login], (err, result) => {
        if (err) {
            response.send(`Ошибка после запроса (\`select * from accounts where login=\'${login}\'\`): ${err}`);
        }

        if (result.rows.length === 0) {
            response.send('Такой аккаунт не найден');
            return;
        }

        if (result.rows[0].passwords === password) {
            const getUuid = uuid();
            client.query(`insert into uuid_tokens (uuid) values (\'${getUuid}\')`, (err) => {
                if (err) console.log(err);
            });
            const UTCDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toUTCString();
            response.setHeader('Set-Cookie', `authToken=${getUuid}; expires=${UTCDate}`);
            response.redirect('/');
        } else {
            response.send('Логин или пароль не верный');
        }
    });
}

exports.about = (_, response) => {
    response.render('about');
}

exports.contacts = (_, response) => {
    response.render('contacts');
}