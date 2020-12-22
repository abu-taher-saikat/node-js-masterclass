const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');


// Load env vars 
dotenv.config({path : './config/config.env'});
// Route files
const bootcamps = require("./routes/bootcamps");


const app = express();



// Dev loggin middleware.
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}



// Mount routes
app.use('/api/v1/bootcamps', bootcamps);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App listening on port ${process.env.NODE_ENV} and port on ${PORT} !`);
});