var express = require('express'),
    app = express(),
    bodyParser = require("body-parser"),
    //fs = require('fs'),
    mongoose = require('mongoose'),
    multer = require('multer'),
    storage = multer.diskStorage({
       destination: function(req, file, cb){
        cb(null, "uploads/");
       },
       filename: function(req, file, cb){
        cb(null, new Date().toISOString()+file.originalname);
       } 
    });

const upload = multer({
    storage: storage,
    limits:{
        fileSize: 1024*1024*5
    },
    fileFilter: FF
});

var FF = function(req, res, cb){
    if(req.file.mimetype === "image/jpeg" || req.file.mimetype === "image/png")
        cb(null, true);
    else
        cb(null, false);    
};

//Connecting to our mongoose Database    
var mongoDB = "mongodb://localhost/ImageRepo";    
mongoose.connect(mongoDB, {userNewUrlParser: true});

//Defining Schema
var Schema = mongoose.Schema;
var ImageSchema = new Schema ({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type: String, required: true},
    image: {type: String, required: true}
});
var Image = mongoose.model('Image', ImageSchema);

//setting up view engine
app.set("view engine", "ejs");

//middleware
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));

//routes
//landing page
app.get("/", function(req, res){
    res.render("landing");
});

//displays all images
app.get("/image", function(req, res){
    Image.find({}, function(err, results){
        if(err)
        {
            console.log(err);
        }
        else
            res.render("view", {items: results});
    });
    
});

//shows form for uploading new image
app.get("/image/new", function(req, res){
    res.render("upload");
});

//creates a new image
app.post("/image", upload.single("image"), function(req, res){
    console.log(typeof(req.file.mimetype));
    const image = new Image({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        image: req.file.path
    });
    image.save().then(function(result){console.log(result);});
    res.redirect("/image");
});

//does not show edit update or destroy

app.listen(8000, function(){
    console.log("server running on localhost.....port 8000");
});