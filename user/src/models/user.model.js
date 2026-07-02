import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'Username must be unique']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email must be unique'],
    },
    password: { 
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    }
});

const userModel = mongoose.model('user',userSchema);

export default userModel;