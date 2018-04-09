const { Client } = require('pg')

const client = new Client({
  user: 'root_user',
  host: 'localhost',
  database: 'pubminer',
  password: 'root_pw',
  port: 5432
})

// client.connect( (err) => {
//     if (err) {
//       console.error('Postgres connection error', err.stack);
//     } else {
//       console.log('Postgres connected');
//     }
// });

module.exports = client;
