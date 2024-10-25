import express from 'express';
import { handler } from '../utils/index.js';

// const insertTest = async (req: express.Request, res: express.Response) => {
//     let success = false;

//     try {
//         const idUser = await db.insert(users).values({
//             id: 'some-id',
//             name: 'test',
//             email: 'test@gmail.com',
//             emailVerified: true,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//         });

//         return res.status(200).json({
//             message: 'User inserted successfully' + idUser,
//         });
//     } catch (error) {
//         console.log('Error inserting idUser', error);

//         return res.status(500).json({
//             message: 'Error inserting user'
//         });
//     }
// };

export const test = handler(async (req: express.Request, res: express.Response) => {
    res.status(200).json({
        message: 'Hello World!',
    });
});