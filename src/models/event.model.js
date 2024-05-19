import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    eventName: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String
    },
    date: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    venue: {
      type: String,
      required: true
    },
    speakers: [{
      name: {
        type: String,
        required: true
      },
      credentials: {
        type: String
      }
    }],
    contactPersons: [{
      name: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      }
    }],
    email: {
      type: String
    },
    website: {
      type: String
    }
  });

  const Event = mongoose.model('Event', eventSchema);
  export default Event;