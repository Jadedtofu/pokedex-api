// console.log('hello');
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const POKEDEX = require('./pokedex.json');
// console.log(process.env.API_TOKEN);

const app = express();
// app.use(morgan('dev'));  // change to short or tiny for deployment
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());
// app.use((req, res) => {
//   res.send('Hey you!');
// });

app.use(function validateBearerToken(req, res, next) {
    // const bearerToken = req.get('Authorization').split(' ')[1];
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');
    // console.log('validate bearer token middleware');

        // we want to make sure having no token and having wrong token sends same error response
    if ((!authToken || authToken.split(' ')[1]) !== apiToken) {  // 401 is unauthorized request code
        return res.status(401).json({error: 'Unauthorized request'});
    }
    // move to next middleware
    next(); // we need to invoke or the request will hang until timeout
});

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`];

// function handleGetTypes(req, res) {  // modular named callback function to be used below
//     res.json(validTypes);
// }
app.get('/types', function handleGetTypes(req, res) {
    res.json(validTypes);
});

// function handleGetPokemon(req, res) {
//     res.send('Hello, Pokemon!');  // test that it works
// }
app.get('/pokemon', function handleGetPokemon(req, res) {
    let response = POKEDEX.pokemon;

    // filter pokemon by name if name query param exists:
    if (req.query.name) {  // case insensitive search:
        response = response.filter(pokemon =>
            pokemon.name.toLowerCase().includes(req.query.name.toLowerCase())
        );
    }

    // filter pokemon by type if type query param exists:
    if (req.query.type) {
        response = response.filter(pokemon =>
            pokemon.type.includes(req.query.type)
        );
    }
    res.json(response);  // return response
});

// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
    let response;  // declaring response variable
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response);
  });

// const PORT = 8000;
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
//   console.log(`Server listening at http://localhost:${PORT}`);
});
