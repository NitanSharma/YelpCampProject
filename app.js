const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground')
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema } = require('./schemas.js');

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/YelpCamp');
    console.log("CONNECTING... MONGO")
}
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req,res) => {
    res.render('home.ejs')
})

app.get('/campgrounds', catchAsync( async (req,res,next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', {campgrounds})   
}))

// CampGround New and Create
app.use(express.urlencoded({ extended: true }));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})
app.post('/campgrounds', validateCampground,catchAsync( async (req, res,next) => {   
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)   
}))

// Show Particular Campground Details
app.get('/campgrounds/:id', catchAsync( async (req,res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground});
}))

// Edit and Update
app.use(methodOverride('_method'));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))
app.put('/campgrounds/:id',validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}));

// Delete
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.all('*' , (req,res,next) => {
    next(new ExpressError('Page not found', 404))
})
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('listening on port 3000!!!!');
})