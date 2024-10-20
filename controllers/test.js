const express = require('express');
const asyncHandler = require('express-async-handler');

exports.test = asyncHandler(async (req, res) => {
    return res.status(200).json({
        message: 'Hello World'
    });
});