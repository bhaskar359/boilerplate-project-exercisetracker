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
  const userId = req.params._id;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = req.body.date ? new Date(req.body.date) : new Date();

  const u = Object.values(users).filter((u) => u._id === userId)[0];
  if (!u) {
    res.sendStatus(404);
    return res.json(err("user not found"));
  }

  if (!u.log) {
    u.log = [];
  }
  const ex = { description, duration, date: date.toDateString() };
  u.log.push(ex);
  users[u.username] = u;

  res.json({
    _id: u._id,
    username: u.username,
    description: ex.description,
    duration: ex.duration,
    // WTF: need to return toDateString() instead of using date object
    // https://forum.freecodecamp.org/t/apis-and-microservices-projects-exercise-tracker/364236/7
    date: date.toDateString(),
  });

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

  let from = req.query.from;
  from = from ? new Date(from) : new Date(0);
  const start = from.getTime();

  let to = req.query.to;
  to = to ? new Date(to) : new Date();
  const end = to.getTime();

  let limit = req.query.limit;

  let log = u.log
    .filter((ex) => {
      const ts = new Date(ex.date).getTime();
      return ts >= start && ts <= end;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

  if (from && to) {
    r["from"] = new Date(from).toDateString();
    r["to"] = new Date(to).toDateString();
  }
  console.log(r);
  return res.json(r);
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
