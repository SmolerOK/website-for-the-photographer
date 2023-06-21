const client = require('../db/connection._db');
const { v4: uuid } = require('uuid');

module.exports = class Users {
    constructor(login, password, response) {
        this.login = login;
        this.password = password;
        this.response = response;
    }

    authorization() {
        client.query(`select * from accounts where login=$1`, [this.login], (err, result) => {
            if (err) {
                this.response.send(`Ошибка после запроса (\`select * from accounts where login=\'${this.login}\'\`): ${err}`);
            }

            if (result.rows.length === 0) {
                this.response.send('Неправильный логин или пароль');
                return;
            }
            if (result.rows[0].passwords === this.password) {
                const getUuid = uuid();
                client.query(`insert into uuid_tokens (uuid) values ($1)`, [getUuid], (err) => {
                    if (err) console.log(err);
                });
                const UTCDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toUTCString();
                this.response.setHeader('Set-Cookie', `authToken=${getUuid}; expires=${UTCDate}`);
                this.response.redirect('/');
            } else {
                this.response.send('Неправильный логин или пароль');
            }
        });
    }
}