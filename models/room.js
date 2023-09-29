const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  message: { type: String, minLength:1, maxLength: 2000, required: 'message is required' },
  dateTime: { type: Date },
  postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

// Define a virtual property to format the dateTime field
MessageSchema.virtual('formattedDateTime').get(function () {
  const now = new Date();
  const messageDate = new Date(this.dateTime);

  // Calculate the time difference in milliseconds
  const timeDiff = now - messageDate;

  // Check if the message is within 24 hours
  if (timeDiff <= 24 * 60 * 60 * 1000) {
    const hours = messageDate.getHours().toString().padStart(2, '0');
    const minutes = messageDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Check if the message is within 7 days
  if (timeDiff <= 7 * 24 * 60 * 60 * 1000) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = daysOfWeek[messageDate.getDay()];
    return dayOfWeek;
  }

  // Otherwise, format as day/month
  const day = messageDate.getDate().toString().padStart(2, '0');
  const month = (messageDate.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
});

// Ensure that virtuals are included when converting to JSON
MessageSchema.set('toJSON', { virtuals: true });

const RoomSchema = new Schema({
  name: { type: String, minLength:3, maxLength: 30, required: 'room name is required' },
  messages: [MessageSchema],
  creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

//TODO virtual for getting time of last posted message so can rank rooms by last active

// Export model
module.exports = {
  Room: mongoose.model("Room", RoomSchema),
  Message: mongoose.model("Message", MessageSchema),
};
