import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // Get details from frontend
    // validation - not empty
    // check if user already exists : username, email
    // check for image, check for avatar
    // upload them to cloudinary

    const { fullname, email, username, password } = req.body
    console.log("email:", email);

    if (
        [fullname, email, username, password].some((field) =>
            field?.trim() === ""
        )
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existingUser = User.findOne({
        $or: [{ email }, { username }]
    })

    if (existingUser) {
        throw new ApiError(409, "User already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if (!avatar){
        throw new ApiError(400, "Error uploading avatar image")
    }

    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!userCreated){
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, userCreated, "User registered successfully")
    )
})

export default registerUser;