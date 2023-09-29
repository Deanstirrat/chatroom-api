const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const {Room, Message } = require('../models/room');
const { ObjectId } = require('mongodb');

//GET all rooms
exports.all_rooms_get = asyncHandler(async (req, res, next) => {
    try {
    const rooms = await Room.find().sort({name: 1});
    res.json(rooms);
    } catch(error){
        console.log(error);
        res.status(500).send('Error fetching rooms');
    }
})

//GET room
exports.room_get = asyncHandler(async (req, res, next) => {
    const room = await Room.findById(req.params.roomId).populate('messages.postedBy');
    res.json(room);
})

//POST create room
exports.room_create_post = [
    body("name")
    .trim()
    .isLength({ min: 1 })
    .withMessage('name must not be blank')
    .escape(),

    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.json(errors);
    
        try {
            const name = req.body.name;
            //check if room name exists
            const nameExists = await Room.findOne({ name });
            if(nameExists) return res.status(409).json({ error: 'Room with this name already exists' });

            //create new room
            const room = new Room({ name: req.body.name, messages: [], creator: new ObjectId(req.userId) });
            await room.save();

            res.status(201).send('Room created successfully');
    
        } catch (error) {
            console.log(error);
            res.status(500).send('Error creating room');
        }
    },
]


//POST create message
exports.message_create_post = [
    body("message")
    .trim()
    .isLength({ min: 1 })
    .withMessage('message must not be blank')
    .escape(),

    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.json(errors);
    
        try {
            //create new message
            const message = new Message({ 
                message: req.body.message, 
                postedBy: new ObjectId(req.body.postedBy), 
                dateTime: Date.now(),
            });
            await message.save();

            //save message to room
            const updatedRoom = await Room.findOneAndUpdate(
                { _id: req.params.roomId },
                { $push: { messages: message } },
                { new: true }
            );

            res.status(201).send('Message created successfully');
    
        } catch (error) {
            console.log(error);
            res.status(500).send('Error creating message');
        }
    },
]