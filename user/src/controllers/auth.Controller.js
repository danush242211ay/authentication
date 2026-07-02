import userModel from '../models/user.model.js';
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import config  from '../config/config.js';


export async function userRegister(req,res){

    const {username , email , password} =req.body;

    const isAlreadyExists = await userModel.findOne({
        $or : [
            {username},
            {email}
        ]
    })

    if(isAlreadyExists){
        return res.status(400).json({ message : "Username or email already exists"})
    }

    const hashedPassword = await crypto.createHash('sha256').update(password).digest('hex')

    const user = await userModel.create({
        username,
        email,
        password : hashedPassword
    })

    const token = jwt.sign({id:user._id},config.JWT_SECRET,{expiresIn : "1d"});

    res.status(201).json({
        message : "User created successfully",
        user : {
            username : user.username,
            email : user.email
        },
        token
    })

}

export async function getMe(req,res){

    const token = req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({message : "token not found"});
    }

    const decoded = jwt.verify(token, config.JWT_SECRET)

    console.log(decoded)
}
