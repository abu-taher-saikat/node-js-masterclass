const ErrorResponse = require('./../utils/errorResponse');
const asyncHandler = require("./../middleware/async");
const geocoder = require('../utils/geocoder');
const Bootcamp = require('./../models/Bootcamp');
const path = require('path');



// @desc   Get all bootcamps
// @route  GET /api/v1/bootcamps
// @access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {

    res.status(200).json(res.advancedResults)
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
    // Add use to body to req.body
    req.body.user = req.user.id;

    // Check for published bootcamps
    const publishedBootcamp = await Bootcamp.findOne({ user : req.user.id});

    // If the user is not ad admin, thry can only add one bootcamp
    if(publishedBootcamp && req.user.role !== 'admin'){
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a bootcamp`, 400));
    }

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

    let bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    // Make suer user is bootcamp owner.
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 404));
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new : true,
        runValidators : true
    });

    res.status(200).json({
        success: true,
        data: bootcamp
    })

});


// @desc   Delete a  bootcamp
// @route  Delete /api/v1/bootcamps/:id
// @access Privet
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    
    // Make suer user is bootcamp owner.
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 404));
    }

    bootcamp.remove();

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



// @desc   Upload photo for bootcamp
// @route  PUT /api/v1/bootcamps/:id/photo
// @access Privet
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }
    
    // Make suer user is bootcamp owner.
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 404));
    }

    if(!req.files){
        return next ( 
            new ErrorResponse(`Please upload a file`, 400)
        );
    }

    // res.status(200).json({
    //     success: true,
    // });
    console.log(req.files.file);

    const file = req.files.file;

    // Make suer the image is a photo
    if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check filesize
    if(file.size > process.env.MAX_FILE_UPLOAD){
        return next(new ErrorResponse(`Please upload an image less han ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err=> {
        if(err){
            console.log(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            success : true,
            data : file.name
        })
    });
    

});
