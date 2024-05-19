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
        return res.status(500).json({success: false, message: "Something went wrong while generating referesh and access token", error})
    }
}

const registerUser = asyncHandler( async (req, res, next) => {
  try {
    const {fullName, email, username, password } = req.body;
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        return res.status(400).json({success: false, message: "All fields are required"})
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        return res.status(409).json({success: false, message: "User with email or username already exists"})
    }
     console.log(req.files);

    const avatarLocalPath = req?.files?.avatar[0]?.path;   
    if (!avatarLocalPath) {
        return res.status(400).json({success: false, message: "Avatar file is required"})
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
        return res.status(400).json({success: false, message: "Avatar file is required"})
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
        return res.status(500).json({success: false, message:  "Something went wrong while registering the user"})
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
  } catch (error) {
    return res.status(500).json({success: false, message:"Internal server error:", error})
  }

} )

const loginUser = asyncHandler(async (req, res) =>{
  try {
    const {email, username, password} = req.body;
    if (!username && !email) {
        return res.status(400).json({success: false, message: "username or email is required"})
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if (!user) {
        return res.status(404).json({success: false, message: "User does not exist"})
    }

   const isPasswordValid = await user.isPasswordCorrect(password)
   if (!isPasswordValid) {
    return res.status(401).json({success: false, message: "Invalid user credentials"})
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
  } catch (error) {
    return res.status(500).json({success: false, message:"Internal server error:", error})
  }

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

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        return res.status(401).json({success: false, message:"unauthorized request"})
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            return res.status(401).json({success: false, message:"Invalid refresh token"})
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json({success: false, message:"Refresh token is expired or used"})
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        return res.status(401).json({success: false, message:"Invalid old password"})
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails
}