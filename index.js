const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = {}

app.post('/api/users', (req, res) => {
  let username = req.body.username;
  const userObj = { _id: username, username };
  users[username] = userObj;
  res.json(userObj);
})

app.get('/api/users', (req, res) => {
  res.json([...Object.values(users)]);
})

app.post('/api/users/:_id/exercises', (req, res) => {
  console.log(users);
  let { description, duration, date } = req.body;
  let { _id } = req.params
  console.log(_id, duration, description, date)
  if (!date) {
    date = new Date();
  }
  date = new Date(date);

  let exercise = { description, duration: Number(duration), date: date.toDateString() };
  if (_id in users) {
    users[_id]["log"] = [exercise]
    console.log(users);
    res.json({ _id, username: _id, ...exercise });
  }

})

// app.get('/api/users/:_id/logs', (req,res)=>{
//   let {_id} = req.params;
//   if(_id in users){
//     let userObj = users._id;
//     userObj["count"] = userObj.log.length;
//     res.json(userObj);
//   }

// })

app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;

  const u = Object.values(users).filter((u) => u._id === userId)[0];
  if (!u) {
    res.sendStatus(404);
    return res.json(err("user not found"));
  }

  let from = req.params.from;
  from = from ? new Date(from) : new Date(0);
  const start = from.getTime();

  let to = req.params.to;
  to = to ? new Date(to) : new Date();
  const end = to.getTime();

  let limit = Number(req.params.limit);

  let log = u.log
    .filter((ex) => {
      const ts = new Date(ex.date)?.getTime();
      return ts >= start && ts <= end;
    })
    .sort((a, b) => new Date(a.date)?.getTime() - new Date(b.date)?.getTime());

  limit = parseInt(limit);
  if (limit !== 0 && !isNaN(limit) && log.length > limit) {
    log = log.slice(0, limit);
  }

  const r = {
    _id: u._id,
    username: u.username,
    count: u.log.length,
    log: log,
  };

  return res.json(r);
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
