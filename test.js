const express = require('express');
const app = express();

let pgsync = require('pg-sync');
let client = new pgsync.Client('postgres://postgres:12345678@localhost/postgres');


// client.begin();
// client.setIsolationLevelSerializable();

app.listen(3000);






