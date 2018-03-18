const { Client } = require('pg')

const client = new Client({
  user: 'root_user',
  host: 'localhost',
  database: 'pubminer',
  password: 'root_pw',
  port: 5432,
})

client.connect()

//sample query
client.query('SELECT * FROM gender_race_v LIMIT 20', (err, res) => {
  console.log(err, res)
  client.end()
})