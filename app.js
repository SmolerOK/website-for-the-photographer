const express = require('express');
const hbs = require('hbs');
const expressHbs = require('express-handlebars');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const client = require('./db/connection._db')
const homeRouter = require('./routes/homeRouter.js');
const albumRouter = require('./routes/albumRouter.js');

const app = express();

client.connect();

app.engine('hbs', expressHbs.engine({
    layoutsDir: 'views/layouts',
    defaultLayout: 'layout',
    extname: 'hbs'
}));

app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
app.use(fileUpload());
app.use(express.static(__dirname + '/static'));
app.use(cookieParser());

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

app.use('/', homeRouter);
app.use('/album', albumRouter);

app.listen(8080);