const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
//const flash = require('connect-flash');
const {ensureAuthenticated} = require('../helpers/auth');

//Load Schema model 'idea'
require('../models/User');
const User = mongoose.model('users');

//router.use(flash());

//User Login
router.get('/login', (req, res)=>{
    res.render('users/login');
});

//User Register
router.get('/register', (req, res)=>{
    res.render('users/register');
});

//login post
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});
//register post
router.post('/register', (req, res)=>{
    var errors = [];
    if(!req.body.name){
        errors.push({text: 'Please insert your name'});
    }
    if(!req.body.email){
        errors.push({text: 'Please insert your email'});
    }
    if(req.body.password.length < 6){
        errors.push({text: 'Password must be at least 6 characters'})
    }
    if(!req.body.password){
        errors.push({text: 'Please insert your desired password'});
    }
    if(req.body.password != req.body.password2){
        errors.push({text: 'Password does not match'});
    }
    if(errors.length > 0){
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
    });}
    else{
        User.findOne({
        email: req.body.email
    }).then(user => {
        console.log(req.body.email);
        console.log(user);
        if(user){
           let error = [{text: 'Email already registered!'}];
           res.render('users/register', {
               errors: error,
               name: req.body.name,
           });
        }
        else{
           const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
            }); 
            bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(newUser.password, salt, (err, hash)=>{
                if(err) throw err;
                newUser.password = hash;
                newUser.save()
                .then(user=>{
                    req.flash('success_msg', 'Successfully registered ' + user.email+' and you may now log in!');
                    res.redirect('/users/login');
                }).catch(err=>{
                    console.log(err);
                    return;
                });
            });
          }); 
        }
    });   
    }
});

// logout user
router.get('/logout', ensureAuthenticated, (req, res) =>{
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;