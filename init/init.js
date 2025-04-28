const mongoose=require('mongoose');
const initdata=require('./data.js');
const Listing=require('../models/listing.js')

const mongoURI = 'mongodb://localhost:27017/rental_website'; 
async function main() {
  await mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));
}

const initDb=async ()=>{
    await Listing.deleteMany({});
   initdata.data = initdata.data.map((obj)=>({...obj , owner:'6807777261a45b0fe4887a8d'})); // Add owner field to each object
       await Listing.insertMany(initdata.data);
    console.log("Data initilized Successfully");
    console.log(initdata.data)
 }

main().then(() => initDb()).catch(err => console.error(err));