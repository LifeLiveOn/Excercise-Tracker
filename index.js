const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
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
     username: req.body.username
  })
  newUser.save(function(err, data){
    if(err||!data){
      res.send("There was an unexpected error when creating user")
    }
    else{
      res.json(data);
    }
  })
})


app.post('/api/users/:id', function(req, res){
  const id=req.params.id
  const {description,duration,date} = req.body
  User.findById(id,function(err,userData){
    if(err){
      res.send("cant find user")
    }else{
      const newExercise = new Exercise({
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
            duration,
            date: date.toDateString(),
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
