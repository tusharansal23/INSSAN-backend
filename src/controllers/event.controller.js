import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import  Event from './../models/event.model.js';

const createEvent = asyncHandler(async(req, res) => {
    const { eventName, date, time, venue, speakers, contactPersons, ...rest } = req.body;
    if(!eventName || !date || !time || !venue || !speakers || !contactPersons){
        return res.status(400).json({success: false, message:"Please fill all required fileds"})
    };
    const savedEvent = await Event.create(req.body);
    return res.status(201).json(new ApiResponse(201, savedEvent, "Event saved successfully!"));
});

const getEvent = asyncHandler(async(req, res) => {
    const {eventId} = req.params;
    const events = await Event.find().sort({createdAt: -1});
    if(events.length <= 0){
        return res.status(404).json({success: false, message:"Event is not created yet"})
    };
    return res.status(200).json(new ApiResponse(200, events, "Event fetched successfully!"));
});

export {
     createEvent,
     getEvent
}
