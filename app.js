if (process.env.NODE_ENV !== 'production') {
    //if we are not running in development enviornment
    require('dotenv').config()
}
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')

//routes
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user')
const dbUrl = process.env.DB_URL;
// const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(dbUrl)
    .then(() => {
        console.log("CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO ERROR!!!!")
        console.log(err)
    })

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(mongoSanitize());

// const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,//Lazy session update
    //don't want to resave all the session on database every single time that the user refreshes the page, 
    //you can lazy update the session, by limiting a period of time.
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})


const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //If the HttpOnly flag (optional) is included in the HTTP response header, the cookie cannot be accessed through client side javascript (again if the browser supports this flag). As a result, even if a cross-site scripting (XSS) flaw exists, and a user accidentally accesses a link that exploits this flaw, the browser (primarily Internet Explorer) will not reveal the cookie to a third party.
        // secure: true,// the cookie should only be sent over HTTPS connections
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  //in milliseconds for one week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());
// app.use(helmet());

// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
//     "https://res.cloudinary.com/dbchiykkp/",
// ];
// //This is the array that needs added to
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
//     "https://cdn.jsdelivr.net",
//     "https://stackpath.bootstrapcdn.com/",
//     "https://res.cloudinary.com/dbchiykkp/"
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
//     "https://res.cloudinary.com/dbchiykkp/"
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             default-Src: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],//
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/dbchiykkp/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//             mediaSrc: ["https://res.cloudinary.com/dbchiykkp/"],
//             childSrc: ["blob:"]
//         },
//     })
// );


//must after session middleware
app.use(passport.initialize());//To use Passport in Express 
app.use(passport.session()) //If your application uses persistent login sessions 
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());//store user in session
passport.deserializeUser(User.deserializeUser());//get user out of session


//before route handlers
app.use((req, res, next) => {
    res.locals.currentUser = req.user;//{_id,username,email}
    res.locals.success = req.flash('success'); //the key is message
    res.locals.error = req.flash('error');
    next();
})

//use routes
app.use('/', userRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)
app.use('/campgrounds', campgroundRoutes);


app.get('/', (req, res) => {
    res.render('home')
});


//throw error which the path is not in aboves
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong!'
    res.status(statusCode).render('campgrounds/error', { err })

})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})

