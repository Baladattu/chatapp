const asyncHandler = require("express-async-handler")
const User = require("../models/user.model")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

//  create jwt token
function generateJwtToken(_id) {
    return jwt.sign({ _id: _id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d",
    });
}

const isvalidPassword = (password) => {
    let minLength = 8;
    let isCapital = /[A-Z]/.test(password[0]);
    let isSmall = /[a-z]/.test(password);
    let isNumber = /\d/.test(password);
    let isSpecial = /[!@#$%^&*()_+-[]{}<>|]{2,}/.test(password);

    if (password.lenght < minLength) {
        return res.json({ message: 'Please Enter atleast 8 characters for password' });
    }

    if (!isCapital) {
        return res.json({ message: 'Passsword should contain Capital' });
    }

    if (!isSpecial) {
        return res.json({ message: 'Password should contain Special characters' });
    }

    return true;
}
//  create new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, pic } = req.body;

        //  check if all fields are filled
        if (!name || !email || !password) {
            res.status(422).json({ error: "Please Fill All The Fields." })
        }


        let minLength = 8;
        let isCapital = /[A-Z]/.test(password[0]);
        let isSmall = /[a-z]/.test(password);
        let isNumber = /\d/.test(password);
        let isSpecial = /[!@#$%^&*()_+-[]{}<>|]/.test(password);

        if (password.lenght < minLength) {
            return res.json({ message: 'Please Enter atleast 8 characters for password' });
        }

        if (!isCapital) {
            return res.json({ message: 'Passsword should contain Capital at the start' });
        }

        if (!isSpecial) {
            return res.json({ message: 'Password should contain Special characters' });
        }

        // check if user already created
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(422).json({ error: "User Already Exist." })
        }

        //  hashed password
        const hashedPassword = await bcrypt.hash(password, 10);

        //  add user info to db
        const user = await User.create({ name, email, password: hashedPassword, pic });
        if (user) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateJwtToken(user._id),
            })
        }
        else {
            return res.status(422).json({ error: "Login Failed." })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }
}


//  signin user
const authUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    //  check if all fields are filled
    if (!email || !password) {
        res.status(422).json({ error: "Please Fill All The Fields." })
    }

    // find user 
    const user = await User.findOne({ email: email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateJwtToken(user._id),
        })
    }
    else {
        res.status(422).json({ error: "Incorrect email or password." })
    }
})


//  get list of all users
const searchUser = async (req, res) => {
    try {
        const search = req.query.search ? {
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ]
        } : {}
        const users = await User.find(search).find({ _id: { $ne: req.user._id } });
        if (users)
            res.status(200).json(users)
        else
            res.status(200).json({ message: 'No user found' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err });
    }

}

// Update user data
const updateUserData = asyncHandler(async (req, res) => {
    const { name, pic } = req.body;
    const userId = req.user._id;

    try {
        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update the user's name and/or profile picture if provided
        if (name) {
            user.name = name;
        }
        if (pic) {
            user.pic = pic;
        }

        // Save the updated user in the database
        await user.save();

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateJwtToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to update user data" });
    }
});

module.exports = { registerUser, authUser, searchUser, updateUserData };