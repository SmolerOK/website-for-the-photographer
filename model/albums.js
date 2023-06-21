const fs = require('fs');

function isIterable(obj) {
    if (obj == null) {
        return false;
    }
    return typeof obj[Symbol.iterator] === 'function';
}

module.exports = class Albums {
    constructor(){}

    viewing(idAlbum) {
        let readAlbumDir = fs.readdirSync(__dirname + `/../static/albums/series/${idAlbum}`);
        let arrObjectAlbum = [];
        for (let imgName of readAlbumDir) {
            arrObjectAlbum.push({ id: idAlbum, name: imgName })
        }
        return arrObjectAlbum;
    }

    upload(cover, series) {
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
    }
    delete(idAlbum) {
        fs.rmSync(__dirname + `/../static/albums/series/${idAlbum}`, { recursive: true, force: true });
    }
}