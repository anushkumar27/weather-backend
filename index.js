const express = require('express')
const crypto = require('crypto')
var bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express()
const port = 3000
const BASE_PATH = "/v1/"
/**
 * Note: This secret is used for local development and testing. In production the secret is injected as environment variable.
 */
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'cd47d09523b2a3e304209f8aeb63c06c5d8ece4bf36d6df1bf72b2d98d080536'

const corvallisWeather = {
    "coord": {
        "lon": -123.262,
        "lat": 44.5646
    },
    "weather": [
        {
            "id": 804,
            "main": "Clouds",
            "description": "overcast clouds",
            "icon": "04d"
        }
    ],
    "base": "stations",
    "main": {
        "temp": 282.37,
        "feels_like": 282.09,
        "temp_min": 281.16,
        "temp_max": 283.41,
        "pressure": 1020,
        "humidity": 78
    },
    "visibility": 10000,
    "wind": {
        "speed": 1.34,
        "deg": 135,
        "gust": 2.24
    },
    "clouds": {
        "all": 100
    },
    "dt": 1642095101,
    "sys": {
        "type": 2,
        "id": 2040223,
        "country": "US",
        "sunrise": 1642088828,
        "sunset": 1642121762
    },
    "timezone": -28800,
    "id": 5720727,
    "name": "Corvallis",
    "cod": 200
}

// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    const allowedOrigins = ['https://editor.swagger.io', 'https://hoppscotch.io', 'http://ec2-34-217-113-76.us-west-2.compute.amazonaws.com'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.get(BASE_PATH + 'weather', (req, res) => {
    let token = getBearerToken(req);
    if (!token) {
        res.status(400)
        res.send({ "type": "error", "message": "Authorization Token Missing" })
    } else if (!validateToken(token)) {
        res.status(401)
        res.send({ "type": "error", "message": "Invalid Authorization Token" })
    } else {
        res.status(200)
        res.json(corvallisWeather)
    }
})

app.get(BASE_PATH + 'hello', (req, res) => {
    let token = getBearerToken(req);
    if (!token) {
        res.status(400)
        res.send({ "type": "error", "message": "Authorization Token Missing" })
    } else if (!validateToken(token)) {
        res.status(401)
        res.send({ "type": "error", "message": "Invalid Authorization Token" })
    } else {
        res.status(200)
        res.send({ "message": "Hello World!" })
    }
})

app.post(BASE_PATH + 'auth', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var expiresIn = new Date(new Date().getTime() + 3600000).toJSON()
    res.setHeader("content-type", "application/json")

    if (username == undefined || password == undefined || username.length == 0 || password.length == 0) {
        res.status(400)
        res.send({
            "type": "error",
            "message": "Invalid Input"
        })
    } else {
        res.send({
            "access-token": jwt.sign({"username": username}, TOKEN_SECRET, { expiresIn: '1h' }),
            "expires": expiresIn
        }
        )
    }
})

/**
 * This function is responsible to validate the auth token 
 * @param {String} token 
 * @returns boolean
 * True: If the token is a valid JWT token
 * False: If the token is invalid or expired
 * 
 */
function validateToken(token) {
    try {
        jwt.verify(token, TOKEN_SECRET);
        return true;
    } catch (err) {
        console.log("JWT verification failed: " + err.message)
        return false;
    }
}

/**
 * This fucntion is responsible to extract the token from the HTTP headers 
 * @param req 
 * @returns 
 *  undefined: If token is not found
 *  string: Token
 */
function getBearerToken(req) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return undefined;
    }
    return token;
}


app.listen(port, () => {
    console.log(`API Mocker app listening at http://localhost:${port}`)
})
