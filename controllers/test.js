import express from 'express';
import asyncHandler from 'express-async-handler';

import db from '../services/database.js';
import users from '../schema/users.js';

const insertTest = async (req, res) => {
    let success = false;

    try {
        const idUser = await db.insert(users).values({
            email: 'test@gmail.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'admin'
        }).$returningId();

        return res.status(200).json({
            message: 'User inserted successfully' + idUser,
        });
    } catch (error) {
        console.log('Error inserting idUser', error);

        return res.status(500).json({
            message: 'Error inserting user'
        });
    }
};

export const test = asyncHandler(async (req, res) => {
    await insertTest(req, res);

    return res.status(200).json({
        message: 'Hello World'
    });
});