const asyncHandler = (requestHandler) => {
    return (req, res, next)=> {
        Promise.resolve(requestHandler(req, res, next)).then((err) => next(err))
    }
}

export {asyncHandler}