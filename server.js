const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require("colors");
const fileUpload  = require('express-fileupload');

// express error handler.
const errorHandler = require("./middleware/errors");

// database 
const connectDB = require("./config/db");

// Load env vars 
dotenv.config({path : './config/config.env'});

//Connect to database
connectDB(); 


// Route files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
// const fileUpload = require('express-fileupload');


const app = express();
// Body Parser
app.use(express.json());

// Dev loggin middleware.
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// File uploading
app.use(fileUpload());

// Set Static folder
app.use(express.static(path.join(__dirname, 'public')));


// Mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);




// calling back error handler. you have to remember it's a middle ware.and middleware need to be call after calling routes , that;s why it's on the bottom of everything..
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`App listening on port ${process.env.NODE_ENV} and port on ${PORT} !`.yellow);
});


// Handle unhandled promise rejection.
process.on('unhandledRejection', (err, promise)=>{
    console.log(`Error: ${err.message}`.white.bold);
    // Close server and exit process
    server.close(()=> process.exit(1));
})