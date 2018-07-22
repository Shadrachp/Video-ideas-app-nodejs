const express = require('express');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

//Map global promise - remove warning
mongoose.Promise = global.Promise;

//Connect to mongoose
mongoose.connect('mongodb://localhost/videa-dev')
 .then(()=>console.log('MongoDB Connected...'))
 .catch(err => console.log(err));  


//Load Schema model 'idea'
require('./models/Idea');
const Idea = mongoose.model('ideas');

//Handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//method-override middleware
app.use(methodOverride('_method'));

//Express session middleware
app.use(session({
    secret: 'supersecret',
    resave: true,
    saveUninitialized: true,
//    cookie: {secure: true}
}));

app.use(flash());

//Global Variables
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    
    res.locals.error_msg = req.flash('error_msg');
    
    res.locals.error = req.flash('error');
    next();
})


////How middleware works
//app.use((req, res, next)=>{
//    //To be used for session 
//    req.name = 'Shadrach Peñano'; //change later to get name from cookie
//    next();
//});

//Index Route
app.get('/', (req, res)=>{
    const title = 'Welcome';
    res.render('index', {
        title
    });
});

//Idea index page
app.get('/ideas', (req, res)=>{
    Idea.find({})
    .sort({date:'desc'})
    .then(ideas =>{
        res.render('ideas/index', {
            ideas:ideas
        });
    })
    
})

//Add Idea
app.get('/ideas/add', (req, res)=>{
    res.render('ideas/add');
})

//Edit Idea
app.get('/ideas/edit/:id', (req, res)=>{
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea =>{
        res.render('ideas/edit', {
            idea:idea
        });
    });
})

//Process Form
app.post('/ideas', (req, res)=>{
    let errors = [];
    if(!req.body.title)
        errors.push({text:'Please add a title'});
    if(!req.body.details)
        errors.push({
            text: 'Please add some details'
        })
    
    if(errors.length>0){
        res.render('ideas/add',{
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    }else{
        const newUser ={
            title: req.body.title,
            details: req.body.details
        }
        new Idea(newUser).save().then(idea=>{
            req.flash('success_msg', 'Successfully added ' +
                     idea.title + '!');
            res.redirect('/ideas');
        })
    }
})
//edit form process (editing the db)
app.put('/ideas/:id', (req, res)=>{
    Idea.findOne({
       _id: req.params.id
    }).then(idea =>{
        idea.title = req.body.title;
        idea.details = req.body.details;
//        idea.date = Date.now;
        
        idea.save()
        .then(idea => {
            res.redirect('/ideas')
        });
    });
});

app.delete('/ideas/:id', (req, res)=>{
//    if(confirm("Are you sure you want to delete the video idea?") == true){
        Idea.remove({
            _id: req.params.id
        }).then(()=>{
            req.flash('success_msg', 'Video Idea deleted!');
            res.redirect('/ideas');
        });
//    }else{
        
//    }
});

//About Route
app.get('/about', (req,res)=>{
    res.render('about');
});

const port = 3000;

app.listen(port, ()=>{
    console.log(`Server started on port ${port}`);
});