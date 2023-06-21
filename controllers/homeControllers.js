const fs = require('fs');
const Users = require('../model/users');

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

    const users = new Users(login, password, response);
    users.authorization();
}

exports.about = (_, response) => {
    response.render('about');
}

exports.contacts = (_, response) => {
    response.render('contacts');
}