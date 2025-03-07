const mongoose = require("mongoose");

const connectionDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL)
        
        console.log("mongoDB connected ");

    } catch (error) {
        console.log(" mongoDB connection error ", error.message);
        process.exit();
    }
}

module.exports = connectionDB