const express = require('express');
const albumControllers = require('../controllers/albumControllers')
const albumRouter = express.Router();

albumRouter.get('/viewing/:idAlbum', albumControllers.viewing);
albumRouter.use(albumControllers.isAuth);
albumRouter.get('/create', albumControllers.create);
albumRouter.post('/upload', albumControllers.upload);
albumRouter.delete('/delete/:idAlbum', albumControllers.delete);

module.exports = albumRouter;