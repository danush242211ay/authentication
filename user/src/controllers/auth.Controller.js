import userModel from '../models/user.model.js';
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import config  from '../config/config.js';
import sessionModel from '../models/session.model.js';


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

   
    const refreshToken = jwt.sign({id:user._id},config.JWT_SECRET,{expiresIn : "7d"});
    const refreshTokenHash = await crypto.createHash('sha256').update(refreshToken).digest('hex')
    
    const session = await sessionModel.create({
        user : user._id,
        refreshTokenHash,
        ip : req.ip,
        useragent : req.headers["user-agent"]
    })

    const accessToken = jwt.sign(
        {id:user._id, sessionid : session._id}
        ,config.JWT_SECRET,{expiresIn : "15min"});

    res.cookie("refreshToken",refreshToken,{
        httpOnly : true,
        secure : true,
        sameSite : 'strict',
        maxAge : 7*24*60*60*1000
    })

    res.status(201).json({
        message : "User created successfully",
        user : {
            username : user.username,
            email : user.email
        },
        accessToken
    })

}

export async function getMe(req,res){

    const token = req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({message : "token not found"});
    }

    const decoded = jwt.verify(token, config.JWT_SECRET)

    const user = await userModel.findById(decoded.id);

    res.status(200).json({
        message : "user fected successfully",
        user :{
            username : user.username,
            email  : user.email
        }
    })
}

export async function refreshToken(req,res){

    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(401).json({ message : "refreshToken not found"});
    }
    const refreshTokenHash = await crypto.createHash('sha256').update(refreshToken).digest('hex')

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked : false
    })
    if(!session){
        return res.status(401).json({message : "session not found"
        })
    }



    const decoded = jwt.verify(refreshToken,config.JWT_SECRET);

    const accessToken = jwt.sign({id : decoded.id},config.JWT_SECRET,{expiresIn : "15m"});

    const newRefreshToken= jwt.sign({id : decoded.id},config.JWT_SECRET,{expiresIn : "7d"});
    const newrefreshTokenHash = await crypto.createHash('sha256').update(newrefreshToken).digest('hex');
    session.refreshTokenHash =newrefreshTokenHash;
    await session.save();

    res.cookie("refreshToken",newRefreshToken,{
        httpOnly : true,
        secure : true,
        sameSite : 'strict',
        maxAge : 7*24*60*60*1000
    })
    res.status(200).json({
        message: "Accesstoken created successfully",
        accessToken
    })
}

export async function logout(req,res){

    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(401).json({message : "refreshToken not found"
        })
    }
    const refreshTokenHash = await crypto.createHash('sha256').update(refreshToken).digest('hex')

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked : false
    })
    if(!session){
        return res.status(401).json({message : "session not found"
        })
    }
    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken");

    res.status(200).json({
        message : "logout successfully"
    })
}

export async function logoutAll(req, res) {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({
            message: "Refresh token not found"
        })
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

    await sessionModel.updateMany({
        user: decoded.id,
        revoked: false
    }, {
        revoked: true
    })

    res.clearCookie("refreshToken")

    res.status(200).json({
        message: "Logged out from all devices successfully"
    })

}

export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }


    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const isPasswordValid = hashedPassword === user.password;

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid email or password"
        })
    }

    const refreshToken = jwt.sign({
        id: user._id
    }, config.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        useragent: req.headers[ "user-agent" ]
    })

    const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id
    }, config.JWT_SECRET,
        {
            expiresIn: "15m"
        }
    )

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.status(200).json({
        message: "Logged in successfully",
        user: {
            username: user.username,
            email: user.email,
        },
        accessToken,
    })
}
