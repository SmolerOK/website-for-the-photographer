const express = require('express');
const hbs = require('hbs');
const expressHbs = require('express-handlebars');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const { v4: uuid } = require('uuid');
const { Client } = require('pg');

const app = express();

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '12345678',
    port: 5432,
});
client.connect();

app.engine('hbs', expressHbs.engine({
    layoutsDir: 'views/layouts',
    defaultLayout: 'layout',
    extname: 'hbs',
    // helpers: {
    //     isAuth: () => {
    //         // return 'ok'
    //         // let cookie = request.cookies['authToken'];
    //         // let result = client.query(`select uuid from uuid_tokens where uuid=$1`, [cookie]);
    //         // if (result.rows.length === 0) {
    //         //     return false;
    //         // }
    //         // if (result.rows[0].uuid === cookie) {
    //         //     return true;
    //         // }
    //         // return false;
    //     }
    // }
}));

app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
app.use(fileUpload());
app.use(express.static(__dirname + '/static'));
app.use(cookieParser());

const urlParser = express.urlencoded({ extended: false });
const albumsRouter = express.Router();

function isIterable(obj) {
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}

app.use((request, response, next) => {
    let cookie = request.cookies['authToken'];
    client.query(`select uuid from uuid_tokens where uuid=$1`, [cookie], (err, res) => {
        if (res.rows.length === 0) {
            response.locals.isAuth = false;
            return next();
        }
        if (res.rows[0].uuid === cookie) {
            response.locals.isAuth = true;
            return next();
        }
    });
});

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

app.get('/login', (request, response) => {

    response.render('login');
});

app.post('/login', urlParser, (request, response) => {

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
});

app.get('/about', (request, response) => {

    response.render('about');
});

app.get('/contacts', (request, response) => {

    response.render('contacts');
});

albumsRouter.get('/viewing/:idAlbum', (request, response) => {
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

albumsRouter.use((req, res, next) => {
    let cookie = req.cookies['authToken'];
    if (cookie === undefined) {
        res.send('У вас недостаточно прав');
    }
    client.query(`select uuid from uuid_tokens where uuid=$1`, [cookie], (err, result) => {
        if (err) console.log(err);
        if (result.rows.length === 0) {
            res.sendStatus(404);
            return;
        }
        if (result.rows[0].uuid === cookie) next();
    });
});

albumsRouter.get('/create', (request, response) => {

    response.render('create-album');
});


albumsRouter.post('/upload', (request, response) => {

    const series = request.files['series'];
    const cover = request.files['cover'];

    const lengthAlbums = fs.readdirSync(__dirname + '/static/albums/series').map((value) => Number(value));
    let newFolderNum = Math.max.apply(null, lengthAlbums) + 1;
    if (lengthAlbums.length === 0) {
        newFolderNum = 1;
    }
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
});

albumsRouter.delete('/delete/:idAlbum', (request, response) => {

    const idAlbum = request.params['idAlbum'];
    fs.rmSync(__dirname + `/static/albums/series/${idAlbum}`, { recursive: true, force: true });
    response.send('delete ok');
});

app.use('/album', albumsRouter);

app.listen(3000);