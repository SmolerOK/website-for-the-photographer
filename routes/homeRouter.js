const express = require('express');
const homeController = require('../controllers/homeControllers');
const homeRouter = express.Router();
const urlParser = express.urlencoded({ extended: false });


homeRouter.get('/', homeController.home);
homeRouter.get('/login', homeController.login);
homeRouter.post('/login', urlParser, homeController.authorization);
homeRouter.get('/about', homeController.about);
homeRouter.get('/contacts', homeController.contacts);

module.exports = homeRouter;