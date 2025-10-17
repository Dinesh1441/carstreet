import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const allUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({
        status: "success",
        data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const addUser = async (req, res) => {
  try {
    const { username, email, password, role, status } = req.body;


    if (!username || !email || !password || !role || !status) {
      return res.status(400).json({
        status: "fail",
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User with this email already exists"
      });
    }

    // Hash the password before saving
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      username,
      email,
      passwordHash: hashedPassword, // Use the hashed password
      role,
      profileImage : req.file ? `/uploads/user/${req.file.filename}` : null,
      status
    });
    
    await newUser.save(); 
    
    res.status(201).json({
      status: "success",
      data: newUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, role, status, password } = req.body;

        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                status: "fail",
                message: "User not found"
            });
        }

        const checkemail = await User.findOne({ email });
        if (checkemail && checkemail._id.toString() !== id) {
            return res.status(400).json({
                status: "fail",
                message: "Email is already in use"
            });
        }

        // Validate input (password is optional)
        if (!username || !email || !role || !status) {
            return res.status(400).json({
                status: "fail",
                message: "All fields except password are required"
            });
        }


        

        // Prepare update data
        const updateData = {
            username,
            email,
            role,
            status,
            profileImage : req.file ? `/uploads/user/${req.file.filename}` : existingUser.profileImage,
        };

        // Only hash and add password if it's provided
        if (password) {
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateData.passwordHash = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true } // new: true returns updated document, runValidators: true runs schema validation
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: "fail",
                message: "User not found"
            });
        }

        res.json({
            status: "success",
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-passwordHash'); // Exclude passwordHash from the result
        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "User not found"
            });
        }
        res.json({
            status: "success",
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({
                status: "fail",
                message: "User not found"
            });
        }

        res.json({
            status: "success",
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Token generation function
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now() / 1000) // issued at time
        },
        JWT_SECRET,
        { 
            expiresIn: '7d',
            algorithm: 'HS256'
        }
    );
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email }).select('+passwordHash');
        if (!user) {
            return res.status(401).json({
                status: "fail",
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({
                status: "fail",
                message: "Invalid email or password"
            });
        }

        if (user.status !== 'Active') {
            return res.status(403).json({
                status: "fail",
                message: "User account is not active"
            });
        }

        // Generate JWT token
        const token = generateToken(user);

        // Set token in HTTP-only cookie (optional but recommended)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Remove sensitive data from response
        const userResponse = {
            id: user._id,
            email: user.email,
            role: user.role,
            username: user.username,
            status: user.status,
            profileImage: user.profileImage,
            // add other non-sensitive fields
        };

        res.status(200).json({
            status: "success",
            message: "Login successful",
            data: {
                user: userResponse,
                token, // Still sending token in response for clients that prefer it
                expiresIn: '7d'
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            status: "error",
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "User not found"
            });
        }   
        res.json({
            status: "success",
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
};

