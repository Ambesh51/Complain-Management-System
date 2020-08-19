//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require("mongoose");
const md5=require("md5");//level 3
//const _ = require("lodash");
let posts=[];
//var count=1;//let collegePosts[];
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//login schema

mongoose.connect("mongodb://localhost:27017/projectDB",{ useNewUrlParser:true});
//login schema
const userSchema=new mongoose.Schema({
email:String,
password:String
});

const loginS=mongoose.model("loginS",userSchema);//student collection for login crential
//for register
app.post("/registerStd",function(req,res){
const newUser=new loginS({
email:req.body.username,
password:md5(req.body.password)

});
newUser.save(function(err){
if(err)
{
  console.log(err);
}else{
  res.render("logout");
}
  });

});
//for login
app.post("/loginStd", function(req, res){
    const user=req.body.username;
  const pass=md5(req.body.password);
  
  loginS.findOne({email: user}, (err, userData) => {
    console.log(err)
    // console.log(userData)
    if(err){
      // res.send('Something Went Wrong')
        res.render('loginStd', {msg: 'Username Password Does Not Match', error: true});
    }else{
      if(userData !== null && userData.password === pass){
        // handle successfully login
        //res.send('login success')
        res.render("student");
      }else{
        res.render('loginStd', {msg: 'Username Password Does Not Match', error: true});
      }
    }
  })
  });
//login and register end
//compose schema for  hostel complain
const hostelSchema={
  name:String,
  hostel_no:String,
  room_no:String,
  content:String,
  year:Number,
  replyHostel:Array,
};
//reply schema
const replySchema={
  
teacher_name:String,
desc:String,
total:Number  //for count 
};
//compose schema for  college complain
const collegeSchema={
  name:String,
  title:String,
  content:String,
  branch:String,
  section:String,
  year:Number,
  reply: Array,
};

const teacherSchema={
  name:String,
  title:String,
  content:String,
  branch:String,
  year:Number,
  section:String
};
 const suggestionSchema={
   name:String,
  title:String,
  content:String,
  branch:String,
  year:Number,
  section:String
 };
const Hostel=mongoose.model("Hostel",hostelSchema); //Complain collection name
 const College=mongoose.model("College",collegeSchema); //Complain collection name
 const Teacher=mongoose.model("Teacher",teacherSchema);//complain Teacher name
 const Suggestion=mongoose.model("Suggestion",suggestionSchema);
 const Feedback=mongoose.model("Feedback",replySchema);//feedback or reply
//compose page post
app.post("/composeStd",function(req,res){
const post={
   name:req.body.postName,
  hostel_no:req.body.postHostel,
  room_no:req.body.postRoom,
  content:req.body.postContent,
  year:req.body.year,
  replyHostel: []
};
var value=req.body.year;
//console.log(value);
const hostel =new Hostel({
  name:post.name,
hostel_no:post.hostel_no,
room_no:post.room_no,
content:post.content,
year:post.year,
replyHostel: []
});
hostel.save();
res.redirect("homeStd");
});
//post for composeClg
app.post("/composeClg",function(req,res){
const clg={
   name:req.body.postName,
   title:req.body.postTitle,
  content:req.body.postContent,
 branch:req.body.branch,
 section:req.body.section,
  year:req.body.year,
  reply: []
};
const college =new College({
  name:clg.name,
  title:clg.title,
content:clg.content,
branch:clg.branch,
section:clg.section,
year:clg.year,
reply: []
});
college.save(); 
res.redirect("collegeStd");
//res.redirect("showStdComplain");
});
// post for reply
app.get("/feedback/:id", async (req,res) => {
  // res.send(req.params.id);
  const {id} = req.params;
  if(id.length < 12){
    res.status(401).send('Wrong Req')
  } 
  College.findOne({_id: id}, (err, doc) => {
    if(err){

      res.send('Wrong Path')
    }else{
    //   if(!err){
    //   res.redirect("/showStdComplain");
    // }
      const reply = doc.reply.length > 0 ? doc.reply[0] : {};
      
      res.render("feedback", {doc, reply});
       
    }
  })
  
});

app.post("/feedback/:id",async function(req,res){
  const {id} = req.params;
  //res.send(id);
  const {teacherName, replyMessage} = req.body;
  College.findOne({_id: id},  async (err, doc) => {
    if(err){
      res.send('Wrong Path')
    }else{
      const newDoc =  await College.findOneAndUpdate({_id: id}, {reply: [{teacherName, replyMessage}]}, {new: true});
      // case handle save after 
      res.redirect(`/showStdComplain?#id-${id}`);
    }
  });

});
//get for feedHostel (reply)
app.get("/feedHostel/:id", async (req,res) => {
  // res.send(req.params.id);
  const {id} = req.params;
  if(id.length < 12){
    res.status(401).send('Wrong Req')
  } 
  Hostel.findOne({_id: id}, (err, doc) => {
    if(err){

      res.send('Wrong Path')
    }else{
    //   if(!err){
    //   res.redirect("/showStdComplain");
    // }
      const reply2 = doc.replyHostel.length > 0 ? doc.replyHostel[0] : {};
      res.render("feedHostel", {doc, reply2});
    }
  })
  
});
//post for feedHostel
app.post("/feedHostel/:id",async function(req,res){
  const {id} = req.params;
  //res.send(id);
  const {teacherName, replyMessage} = req.body;
  Hostel.findOne({_id: id},  async (err, doc) => {
    if(err){
      res.send('Wrong Path')
    }else{
      const newDoc =  await Hostel.findOneAndUpdate({_id: id}, {replyHostel: [{teacherName, replyMessage}]}, {new: true});
      // case handle save after 
      res.redirect(`/showStdHostelComplain?#id-${id}`);
    }

  });

});



app.post("/composeTch",function(req,res){
const tchr={
  name:req.body.postName,
  title:req.body.postTitle,
 content:req.body.postContent,
 branch:req.body.branch,
 section:req.body.section,
 year:req.body.year
};
var value=req.body.complain;
//console.log(value);
if (value=== "complain") {
  const teacher =new Teacher({
    name:tchr.name,
    title:tchr.title,
  content:tchr.content,
  branch:tchr.branch,
  section:tchr.section,
  year:tchr.year
  });
  teacher.save();
  res.redirect("homeTch");
}
else {
  const suggestion =new Suggestion({
    name:tchr.name,
    title:tchr.title,
  content:tchr.content,
  branch:tchr.branch,
  section:tchr.section,
  year:tchr.year
  });
  suggestion.save();
  res.redirect("suggestionTch");
}
});
// login tch
const teacherlogin=new mongoose.Schema({
email:String,
password:String
});

const loginTcher=mongoose.model("loginTcher",teacherlogin);//loginTch collection for login crential
app.post("/registerTch",function(req,res){
const newUser2=new loginTcher({
email:req.body.username,
password:md5(req.body.password)

});
newUser2.save(function(err){
if(err)
{
  console.log(err);
}else{
  res.render("logout");
}
  });

});
//for login
app.post("/loginTch", function(req, res){
    const user=req.body.username;
  const pass=md5(req.body.password);
  
  loginTcher.findOne({email: user}, (err, userData) => {
    console.log(err)
    // console.log(userData)
    if(err){
      // res.send('Something Went Wrong')
        res.render('loginTch', {msg: 'Username Password Does Not Match', error: true});
    }else{
      if(userData !== null && userData.password === pass){
        // handle successfully login
        //res.send('login success')
        //res.render("homeTch");
      Teacher.find({},function(err,teachers){   //before any method of moongoose we use document variable
  posts=teachers;
res.render("homeTch",{
          posts:posts   });
          });
      }else{
        res.render('loginTch', {msg: 'Username Password Does Not Match', error: true});
      }
    }
  })
  });

/*const tch={
   email:"kal@gmail.com",
   password:"123456"
  
};
const teacher =new loginTch({
  email  :tch.email, 
  password:tch.password            
});
teacher.save();
// post login tch
app.post("/loginTch", function(req, res){
    const user=req.body.username;
  const pass=(req.body.password);
  loginTch.findOne({email:user},function(err,foundUser){
  if(err){console.log(err);
  }
  else{

        if (foundUser) {
                if (foundUser.password===pass) {
                 // res.render("homeTch");
                 Teacher.find({},function(err,teachers){   //before any method of moongoose we use document variable
  posts=teachers;
res.render("homeTch",{
          posts:posts   });
          });
                                   }
                                     }
 } 
  });
  });*/

  app.get("/composeTch", function(req, res){
    res.render("composeTch");
  })

app.get("/homeStd",function(req,res){
  Hostel.find({},function(err,hostels){   //before any method of moongoose we use document variable
  posts=hostels;
res.render("homeStd",{
          posts:posts   });

});
});
app.get("/collegeStd",function(req,res){
  College.find({},function(err,colleges){   //before any method of moongoose we use document variable
  posts=colleges;
res.render("collegeStd",{
          posts:posts   });

});
});

app.get("/showStdComplain",function(req,res){
  College.find({},function(err,colleges){   //before any method of moongoose we use document variable
  posts=colleges;
res.render("showStdComplain",{
          posts:posts   });

});

});
//show hostel complain teacher
app.get("/showStdHostelComplain",function(req,res){
  Hostel.find({},function(err,hostels){   //before any method of moongoose we use document variable
  posts=hostels;
res.render("showStdHostelComplain",{
          posts:posts   });

});

});

app.get("/composeClg",function(req,res){
res.render("composeClg");
});

app.get("/",function(req,res){
res.render("home");
});

app.get("/student",function(req,res){
res.render("student");
});

app.get("/loginStd",function(req,res){
res.render("loginStd", {error: false, msg: ''});
});

app.get("/registerStd",function(req,res){
res.render("registerStd");
});

app.get("/loginTch",function(req,res){
res.render("loginTch", {error: false, msg: ''});
});


app.get("/registerTch",function(req,res){
res.render("registerTch");
});

app.get("/submit",function(req,res){
res.render("submit");
});


app.get("/logout",function(req,res){
res.render("logout");
res.redirect("/");
});

app.get("/composeStd",function(req,res){
res.render("composeStd");
});

app.get("/composeClg",function(req,res){
res.render("composeClg");
});

app.get("/homeTch", function(req, res){

  Teacher.find({},function(err,teachers){   //before any method of moongoose we use document variable
  posts=teachers;
res.render("homeTch",{
          posts:posts   });

});
});

app.get("/suggestionTch", function(req,res){

  Suggestion.find({},function(err,suggestions){   //before any method of moongoose we use document variable
  posts=suggestions;
res.render("suggestionTch",{
          posts:posts   });

});
});

//app.get("/feedback",function(req,res){
//res.render("feedback");

//});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

