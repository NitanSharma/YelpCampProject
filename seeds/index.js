const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities')
const {places , descriptors} = require('./seedHelpers')

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/YelpCamp');
    console.log("CONNECTING... MONGO")
}

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20)+10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: `https://picsum.photos/400?random=${Math.random()}`,
            description: 'orem, ipsum dolor sit amet consectetur adipisicing elit. Quaerat quam, omnis inventore minus neque corporis animi tempore voluptates iste necessitatibus esse officiis iure, nulla saepe! Nob',
            price
        })
        await camp.save();
    }
}


seedDB().then(() => {
    mongoose.connection.close();
})