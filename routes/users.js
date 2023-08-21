const { jwt, verify } = require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const WorkoutDetails = require('../models/workoutDetails');
const User = require('../models/user');
const { hash, compare } = require("bcryptjs");
const { protected } = require("../utils/protected");
const Temp  = require("../models/temp");
const {
    createAccessToken,
    createRefreshToken,
    sendAccessToken,
    sendRefreshToken
} = require("../utils/tokens");


// Register New User
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, userName, email, password } = req.body;

        if (!firstName){
            return res.json({
                type: "error",
                message: "first name is required!"
            })
        }

        const user = await User.findOne({email});

        if (user) {
            return res.json({
            message: "user already exists! Try logging in.",
            type: "warning"
            });
        }

        const passwordHash = await hash(req.body.password, 10);
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username,
            email: req.body.email,
            password: passwordHash,
        });

        await newUser.save();
        res.json({
        message: "user created successfully, now login!",
        type: "success",
        })
    }    catch (error) {
        res.json({
            type: "error",
            message: "error creating user!",
            error,
        });
    }
});



// Login New User
router.post('/login', async (req, res) => {
    try {
    const {username, password} = req.body;

    const user = await User.findOne({username});

    //user does not exist
    if(!user)
        return res.json({
            message: "User does not exist 😢",
            type: "error",
        });

    const isMatch = await compare(password, user.password);

    //incorrect password
    if (!isMatch)
        return res.json({
            message: "password is incorrect",
            type: "error",
        });

    const accessToken = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    user.refreshtoken = refreshToken;
    await user.save();

    sendRefreshToken(res, refreshToken);
    sendAccessToken(req, res, accessToken);


    } catch (error) {
        res.json({
            type:"error",
            message: "error signing in",
            error
        });
     }
 });

router.post("/logout", async (req, res) => {
    res.clearCookie("access_token");

    return res.json({
        message: "Logged Out Successfully",
        type: "success",
    })
})


// Refresh Token Endpoint

router.post("/refresh_token", async (req, res) => {
  try {
    const { refreshtoken } = req.cookies;
    // if we don't have a refresh token, return error
    if (!refreshtoken)
      return res.status(500).json({
        message: "No refresh token! 🤔",
        type: "error",
      });
    // if we have a refresh token, you have to verify it
        let id;
        try {
          id = verify(refreshtoken, process.env.REFRESH_TOKEN_SECRET).id;
        } catch (error) {
          return res.status(500).json({
            message: "Invalid refresh token! 🤔",
            type: "error",
          });
        }
        // if the refresh token is invalid, return error
        if (!id)
          return res.status(500).json({
            message: "Invalid refresh token! 🤔",
            type: "error",
          });
        // if the refresh token is valid, check if the user exists
        const user = await User.findById(id);
        // if the user doesn't exist, return error
        if (!user)
          return res.status(500).json({
            message: "User doesn't exist! 😢",
            type: "error",
          });
        // if the user exists, check if the refresh token is correct. return error if it is incorrect.
        if (user.refreshtoken !== refreshtoken)
          return res.status(500).json({
            message: "Invalid refresh token! 🤔",
            type: "error",
          });
        // if the refresh token is correct, create the new tokens
        const accessToken = createAccessToken(user._id);
        const refreshToken = createRefreshToken(user._id);
        // update the refresh token in the database
        user.refreshtoken = refreshToken;
        // send the new tokes as response
        sendRefreshToken(res, refreshToken);
        return res.json({
          message: "Refreshed successfully! 🤗",
          type: "success",
          accessToken,
    });
  } catch (error) {
    res.status(500).json({
      type: "error",
      message: "Error refreshing token!",
      error,
    });
  }
});




router.get("/protected", protected, async (req, res) => {
  try {
    // if user exists in the request, send the data
    if (req.user)
      return res.json({
        message: "You are logged in! 🤗",
        type: "success",
        user: req.user,
      });
    // if user doesn't exist, return error
    return res.status(500).json({
      message: "You are not logged in! 😢",
      type: "error",
    });
  } catch (error) {
    res.status(500).json({
      type: "error",
      message: "Error getting protected route!",
      error,
    });
  }
});

router.post('/inputWorkout', async (req, res) => {
    try{
        const {username, date, title, movement, sets, reps, rest, notes} = req.body;

        const newWorkout = new WorkoutDetails({
            username: req.body.username,
            date: req.body.date,
            title: req.body.title,
            movement: req.body.movement,
            sets: req.body.sets,
            reps: req.body.reps,
            rest: req.body.rest,
            notes: req.body.notes,
        });

        await newWorkout.save();
        res.json({
        message: "workout data stored successfully",
        type: "success",

        })
    } catch (error){
        res.json({
            type: "error",
            message: "error submitting workout data",
            error,
        });
    }
})

router.post('/workoutData', async (req, res) => {
    try {
        const {username} = req.body
        const workoutData = await WorkoutDetails.find({username});

        if (workoutData){
            res.json({
               workoutData
            })
        } else{
            res.json({
                type: "error",
                message: "there is no workout data for user " + username
            })
        }
//        const date = workoutData.date;
//        const title = workoutData.title;
//        const movement = workoutData.movement;
//        const sets = workoutData.sets;
//        const reps = workoutData.reps;
//        const rest = workoutData.rest;
//        const notes = workoutData.notes;

//         res.json({
//            type: "success",
//            message: "made it here",
//            user,
//            workoutData
//            date: date,
//            title: title,
//            movement: movement,
//            sets: sets,
//            reps: reps,
//            rest: rest,
//            notes: notes
    } catch (err){
        res.json({
            type: "error",
            message: "unable to retrieve workout data"
        })
    }
})


module.exports = router;