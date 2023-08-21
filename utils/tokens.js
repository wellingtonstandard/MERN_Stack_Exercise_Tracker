const jwt  = require("jsonwebtoken");

const createAccessToken = (id) => {
    return jwt.sign({id}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 0. * 60
    });
};

const createRefreshToken = (id) => {
    return jwt.sign({id}, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d"
    });
};

const sendAccessToken = (req, res, accesstoken) => {
    res.json({
        accesstoken,
        message: "Sign in Successful 🥳",
        type: "success",
    })
}

const sendRefreshToken = (res, refreshtoken) => {
    res.cookie("refreshtoken", refreshtoken, {
        httpOnly: true
    });
};

module.exports = {
    createAccessToken,
    createRefreshToken,
    sendAccessToken,
    sendRefreshToken,
};