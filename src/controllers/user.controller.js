import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        return res.status(500).json({status: false, message: "Something went wrong while generating referesh and access token"})
    }
}

const registerUser = asyncHandler( async (req, res, next) => {
    const {fullName, email, username, password } = req.body;

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        return res.status(400).json({status: false, message: "All fields are required"})
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        return res.status(409).json({status: false, message: "User with email or username already exists"})
    }
    // console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;   
    if (!avatarLocalPath) {
        return res.status(400).json({status: false, message: "Avatar file is required"})
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
        return res.status(400).json({status: false, message: "Avatar file is required"})
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        return res.status(500).json({status: false, message:  "Something went wrong while registering the user"})
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler(async (req, res) =>{
    const {email, username, password} = req.body;
    if (!username && !email) {
        return res.status(400).json({status: false, message: "username or email is required"})
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        return res.status(404).json({status: true, message: "User does not exist"})
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    return res.status(401).json({status: false, message: "Invalid user credentials"})
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
});

export {
    registerUser,
    loginUser,
    logoutUser
}