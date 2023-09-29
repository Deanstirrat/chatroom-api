var express = require('express');
var router = express.Router();
const room_controller = require('../controllers/roomController');


//GET all rooms
router.get('/', room_controller.all_rooms_get);

//create a room
router.post('/', room_controller.room_create_post);

//Get a room
router.get('/:roomId', room_controller.room_get);

//crea a message in room
router.post('/:roomId', room_controller.message_create_post);


module.exports = router;