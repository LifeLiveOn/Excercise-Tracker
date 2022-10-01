const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))
app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// where your node app starts
var mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI3, { useNewUrlParser: true, useUnifiedTopology: true });


//define schema configuration
const { Schema } = mongoose;

const userSchema = new Schema({
  username:{type:String,required:true},
})

const ExcerciseSchema = new Schema({
  userId :{type:String,required:true},
  description:{type:String},
  duration: Number,
  date: String,
  username :{type:String}
})

const User = mongoose.model("User",userSchema)
const Excercise = mongoose.model("Excercise",ExcerciseSchema);


app.get('/api/users/', function(_req, res){
  User.find({}).then(function (users) {
    res.send(users);
    });
})

app.get('/api/users/:_id/logs',  function(req, res){
        let dateFrom = null;
        let dateTo = null;
        let limitData = null;
        let user = null;
        try{
            dateFrom = req.query.from; ////https://stackoverflow.com/questions/17007997/how-to-access-the-get-parameters-after-in-express
            dateTo = req.query.to;
            limitData = req.query.limit; 
        }
        catch(e){
            console.log(e)
        }
  try{
    user = Excercise.find({userId:req.params._id}, function (err, userLogs) {
      if (err){console.log(err)}
      var count = userLogs.length; // get the amount of user exercises.
      if(dateFrom){
            const fromDate= new Date(dateFrom)
           userLogs = userLogs.filter(exe => new Date(exe.date) > fromDate);
              }

      else if(dateTo){
            const toDate = new Date(dateTo)
            userLogs =userLogs.filter(exe => new Date(exe.date) < toDate);
                  }
       else if (limitData){
           userLogs =userLogs.slice(0,limitData);
              }
      console.log(userLogs);
      const log = []
      let username = userLogs[0].username // get the user name from the data received from query
      let id = userLogs[0].userId
      userLogs.forEach(item => log.push({description:item.description, duration:item.duration, date: item.date}))
      const response = {
          username:username,  
          count:parseFloat(count),
          _id:id,
          log:log
             }
      res.json(response)
    })
  }catch(e){
    res.json(e)
  } 
     
})


app.post('/api/users', function(req, res){
  const newUser = new User({
     username: req.body.username,
  },
  { versionKey: false }) // to disable _v display in mongoDB
  newUser.save(function(err, data){
    if(err||!data){
      res.send("There was an unexpected error when creating user")
    }
    else{
      res.json({
        username: data.username,
        _id: data._id
      });
    }
  })
})

app.post('/api/users/:id/exercises', function(req, res){
  const id=req.params.id
  const description=req.body.description
  const duration= req.body.duration
  var date;
  if(req.body.date == '' || !req.body.date){
    // if blank, it will set date as the current date
    var currentdate = new Date();
    date = currentdate.toDateString();
  }else if(new Date(req.body.date) == 'Invalid Date'){
    // errors out if new date can't be created from provided input.
    return res.status(400).json({ error: 'Invalid Date' })
  }else{
    // else, format input string & set date
    var currentdate = new Date(req.body.date);
    date = currentdate.toDateString();
  }
  console.log(req.body)
  User.findById(id,function(err,userData)
  {
    if(err){
      res.send("cant find user")
    }else
    {
      const newExercise = new Excercise({
        username:userData.username,
        userId: id,
        description: description,
        duration: duration,
        date: date,
      })
      newExercise.save(
        function(err, data){
        if(err||!data){res.send("cant save")}
        else{
          res.json(
          {
            username: userData.username,
            description,
            duration:Number(duration),
            date: date, 
            _id:userData._id
          }
          
        )}
      })
    }
  })
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)})