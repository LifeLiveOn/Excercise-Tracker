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
  date: Date,
})

const User = mongoose.model("User",userSchema)
const Excercise = mongoose.model("Excercise",ExcerciseSchema);

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

app.get('/api/users/', function(_req, res){
  User.find({}).then(function (users) {
    res.send(users);
    });
})

app.get('/api/users/:_id/logs',function(_req, res){
  User.findById(_req.params._id), function(err,userData){
    if(err){ console.log("error")}
    else{
      const excerciseArr = []
      const count = 0
      userData.forEach((exercise)=>{
        count+=1;
        excerciseArr.push({
          description: excercise.description,
          duration: excercise.duration,
          date: excercise.date,
        })
      });
      res.json({
        username: userData.username,
        count: 1,
        _id: _req.params._id,
        log: []
      })
    }
  }
})

app.post('/api/users/:id/exercises', function(req, res){
  const id=req.params.id
  const description=req.body.description
  const duration= req.body.duration
  const date = req.body.date
  console.log(req.body)
  User.findById(id,function(err,userData){
    if(err){
      res.send("cant find user")
    }else{
      const newExercise = new Excercise({
        userId: id,
        description: description,
        duration: duration,
        date: new Date(date),
      })
      newExercise.save(function(err, data){
        if(err||!data){res.send("cant save")}else{res.json(
          {
            username: userData.username,
            description,
            duration:Number(duration),
            date: new Date(date).toDateString(), // to read the function todate string without getting confused
            _id:userData._id
          }
          

        )}
      })
    }

  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
