const express = require("express");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = require("../models/User");
const verifyToken = require("../authentication/jwtVerification");

const route = express.Router();

route.post('/register', async(req, res) => {
    let errors = {};
    try {
        const {username, password} = req.body;
        const schema = Joi.object({
            username: Joi.string().alphanum().min(5).max(30).required(),
            password: Joi.string().alphanum().min(6).max(20).required().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        });

        const schemaError = schema.validate({username, password}).error;
        if(schemaError) {
            errors = {
                key: schemaError.details[0].context.key, 
                message: schemaError.message.replace(/[\\|"]/g, "")
            }
            throw new Error();
        }
        else {
            const checkIfUserExist = await User.find({ username });
            if(checkIfUserExist.length) {
                console.log(checkIfUserExist)
                errors = {
                    key: "username",
                    message: "that username is already taken, please enter another one"
                }

                throw new Error("bad request");
            } else {
                const hashedPassword = await argon2.hash(password);
                const newUser = await new User({username, password: hashedPassword}).save();
                res.status(201).json(newUser);
            }
        }
    } catch (error) {
        res.status(400).json(errors);
    }
});

route.post("/login", async(req, res) => {
    let errors = {};
    let statusCode;
    try {
        const {username, password} = req.body;
        if(!username) {
            statusCode = 400;
            errors = { key: "username", message: "Please enter your username" };
            throw new Error("Please enter your username");
        } else {
            const user = await User.findOne({username});
            if(!user) {
                statusCode = 404;
                errors = { key: "username", message: "That username is not registered" };
                throw new Error("That username is not registered")
            } else {
                if(!password) {
                    statusCode = 400;
                    errors = { key: "password", message: "Please enter your password" };
                    throw new Error("Please enter your password");
                } else {
                    const verifyPassword = await argon2.verify(user.password, password);
                    if(!verifyPassword) {
                        statusCode = 404;
                        errors = { key: "password", message: "password do not match" };
                        throw new Error("password do not match");
                    } else {
                        const token = jwt.sign({...user}, "secretkey", { expiresIn: "2h"});
                        res.status(200).json({ user: user, token });
                    }
                }
            }
        }
    } catch (error) {
        res.status(400).json(error.message)
    }
});


route.get("/dashboard", verifyToken, async(req, res) => {
    res.status(200).json(req.user);
});

module.exports = route;