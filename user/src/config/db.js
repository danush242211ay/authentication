import mongoose from "mongoose";
import config from "./config.js";
import dns from 'dns';

dns.setServers([
    '8.8.8.8',
    '8.8.4.4'
])

async function connectDB() {
    await mongoose.connect(config.MONGO_URI)
    console.log("connect to DB");
}

export default connectDB;