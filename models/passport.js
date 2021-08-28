const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./user');

module.exports = async function(passport)
{
    passport.use(new localStrategy({usernameField: 'email'},async (lmail,lpassword,done)=>{
        await User.findOne({email: lmail})
        .then(async (user) =>{
            if(!user)
            {
                console.log(lmail,lpassword);
                return done(null, false,{message: 'email not registered not registered'});
            }
            bcrypt.compare(lpassword, user.password, (err, match) => {
                if (err)
                    console.log(lpassword);
                    console.log(user.password);
                    console.log(err);

                if (match) {
                    return done(null, user);
                }

                else {
                    return done(null, false, { message: 'incorrect password' });
                }
            });
        })
        .catch(err=>console.log(err));
    }));
    
    await passport.serializeUser((user,done)=>{
        done(null, user.id);
    });

    await passport.deserializeUser((id,done)=>{
        User.findById(id,(err,user)=>{
            done(err,user);
        });
    });
}