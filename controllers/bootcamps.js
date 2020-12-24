const ErrorResponse = require('./../utils/errorResponse');
const asyncHandler = require("./../middleware/async");
const geocoder = require('../utils/geocoder');
const Bootcamp = require('./../models/Bootcamp');



// @desc   Get all bootcamps
// @route  GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query;

    // Copy req.query || it's called spread operater... to catch manyquery all at a time. 
    const reqQuery = {...req.query};

    // Fields to exclude
    const removeFields = ['select','sort', 'page', 'limit'];

    // Loop over removedFields and delete them from reqQuery. 
    removeFields.forEach(param => delete reqQuery[param]);


    // Create query String && create operator
    // stringfy make json data to -> string. for menupolate $ sign  
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // JSON.parse modifiy string to ->  json data.
    query = Bootcamp.find(JSON.parse(queryStr));
    // console.log(queryStr);

    // Select Fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
        console.log(fields);
    }

    // Sort 
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    }else{
        query = query.sort('-createdAt');
    }

    // Pagination
    // @parseInt is a js operator. it takes 2 peramitter. it make string to -> number. 
    const page  = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25; //25 is limit you can change it as you like. per page 25 post.
    const startIndex = (page - 1 ) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments(); //with mongoose count how many document here...

    query = query.skip(startIndex).limit(limit);

    // Executing query..
    const bootcamps = await query;

    // Pagination result
    // next pagination
    const pagination = {};

    if(endIndex < total){
        pagination.next = {
            page : page + 1,
            limit
        }    
    }

    // prev pagination.
    if(startIndex > 0){
        pagination.prev = {
            page : page - 1,
            limit
        }
    }

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        pagination : pagination,
        data: bootcamps
    })
});


// @desc   Get a single bootcamp
// @route  GET /api/v1/bootcamps/:id
// @access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: bootcamp
    });
})


// @desc   Create new bootcamp
// @route  POST /api/v1/bootcamps/
// @access Privet
exports.createBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        success: true,
        data: bootcamp
    });

});



// @desc   Update  bootcamp
// @route  PUT /api/v1/bootcamps/:id
// @access Privet
exports.updateBootcamp = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({
        success: true,
        data: bootcamp
    })

});


// @desc   Delete a  bootcamp
// @route  Delete /api/v1/bootcamps/:id
// @access Privet
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {


    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: {}
    })


});


// @desc   Get bootcamps with a radious
// @route  GET /api/v1/bootcamps/radious/:zipcode/:distance
// @access Privet
exports.getBootcampsInRadious = asyncHandler(async (req, res, next) => {

    const {
        zipcode,
        distance
    } = req.params;

    // Get Lat/lng from geocoder.
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radious using radious
    // Divide dist  by radious of Earth
    // Earth Radius= 3,963 mi / 6378.1 km
    const radius = distance / 3963;
    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [lng, lat], radius
                ]
            }
        }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});