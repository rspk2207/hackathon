const express = require('express');
const path = require('path');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
mongoose.connect('mongodb://Localhost:27017/hackathon',{ useNewUrlParser: true, useUnifiedTopology: true});


const app = express();

require('./models/passport')(passport);
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: "Welcome to your workspace",
    resave: true,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');
app.get('/',(req, res) => {
    res.render('index');
});

app.get('/signup',(req,res) =>{
    res.render('signup');
});
app.get('/signin',(req,res) =>{
    res.render('signin');
});
app.post('/signup',async (req,res) =>{
    let errors = [];
    let rname= req.body.name; 
    let rmail= req.body.email; 
    let rpassword= req.body.password;
    let rsem = req.body.sem;
    console.log(rmail,rname,rpassword);
    console.log(rmail.includes('@nitt.edu'));
    if(!rname || !rmail || !rpassword || !rsem)
    {
        errors.push({msg: 'please fill in all fields'});
        res.redirect('/signup');
    }
    if(rmail.includes('@nitt.edu') == false)
    {
        errors.push({msg: 'email must contain @nitt.edu'});
        res.redirect('/signup');
    }
    if(rsem>8)
    {
        errors.push({msg: 'invalid sem number'});
        res.redirect('/signup');
    }
    if(errors.length>0)
    {
        res.render('signup',errors,rname,rusername,rdob,rphno,rmail,rpassword);
    }
    else
    {
        await User.findOne({email: rmail})
            .then( async (user)=>{
            if(user)
            res.render('signup',errors,rname,rusername,rdob,rphno,rmail,rpassword);
            else
            {
                let newUser = new User({
                    name: rname,
                    email: rmail,
                    password: rpassword,
                    sem: rsem,
                    book: []
                });

                await bcrypt.genSalt(10, async (err,salt)=>{
                    bcrypt.hash(newUser.password, salt, async (err, hash) => {
                        if (err){
                        console.log(newUser.password);
                        console.log(salt);
                        console.log(err);
                        }
                        else{
                        newUser.password = hash;
                        await newUser.save()
                            .then(async (user) => {
                                res.redirect('/signin');
                            })
                            .catch(err => console.log(err));
                    }})
                })
            }
        })
        .catch(err=>console.log(err));
    }
});
app.post('/signin', async (req,res,next) =>{
    await passport.authenticate("local", {
          successRedirect: '/sembook',
          failureRedirect: '/signin'
    })(req,res,next);
});

app.get("/signout", function (req, res) {
    req.logout();
    res.redirect("/");
});
function loggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/signin");
}
app.get('/sembook',loggedIn,(req,res)=>{
    console.log(req.user.book);
    if((req.user.book).length == 0)
   {
       for(let i=0;i<8;i++)
       {
           var values = {pageno: 0, content: []}
           req.user.book.push(values);
           console.log(values);
       }
       req.user.markModified('book');
       req.user.save();
   }
   res.render('sembook',{user: req.user});
});

app.get('/sembook/:k/book',loggedIn,(req,res)=>{
    let us = JSON.stringify(req.user);
    res.render('book',{user: req.user,sem:req.params.k, data: us});
})
app.get('/forms',loggedIn,(req,res)=>{
    var count = parseInt(window.localStorage.getItem("count"));
    var sem = parseInt(window.localStorage.getItem("sem"));
    for(let i=0;i<count;i++)
    {
        var data = window.localStorage.getItem("data"+i); 
        req.user.book[sem-1].content.push(data);
    }
    req.user.book[sem-1].pageno = count;
    req.user.markModified('book');
    req.user.save();
    res.redirect('/sembook');
})
app.listen(3000, () => {
    console.log('started on port 3000');
});