// Import ApiError class
import { ApiError } from '../utils/ApiError.js';

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error(err); // Log the error for debugging purposes

    // Default error response
    const errorResponse = {
        status: 'error',
        message: 'Internal Server Error'
    };

    // If the error is an instance of ApiError, customize the response
    if (err instanceof ApiError) {
        errorResponse.message = err.message;
        if (err.errors && err.errors.length > 0) {
            errorResponse.errors = err.errors;
        }
        res.status(err.statusCode).json(errorResponse);
    } else {
        // Send the default error response for other types of errors
        res.status(500).json(errorResponse);
    }
};
