const advancedResults = (model, populate) => async(req, res, next)=>{
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
    query = model.find(JSON.parse(queryStr));
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
    const total = await model.countDocuments(); //with mongoose count how many document here...

    query = query.skip(startIndex).limit(limit);

    if(populate){
        query = query.populate(populate);
    }

    // Executing query..
    const results = await query;

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


    res.advancedResults = {
        success : true,
        count : results.length,
        pagination,
        data : results
    }

    next();

}

module.exports = advancedResults;