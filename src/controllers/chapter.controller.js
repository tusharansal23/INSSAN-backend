import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Chapter from "../models/chapter.model.js";

const createChapter = asyncHandler(async (req, res, next) => {
  const {chapter, chairman, secretary} = req.body
  if(!chapter || !chairman || !secretary){
    return res.status(400).json({success: false, message:"All fields are required!"})
  };
  const savedChapter = await Chapter.create(req.body);
  if(!savedChapter) return res.status(500).json({success: false, message:"Something went wrong"})
  return res.status(201).json(new ApiResponse(201, savedChapter, "Chapter saved successfully!"));
});

const getChapter = async ( req, res ) => {
  const chapters = await Chapter.find().sort({createdAt:1})
  if( chapters.length <= 0){
    return res.status(404).json({success: false, message:"Chapter is not created yet"})
  };
  return res.status(200).json(new ApiResponse(200, chapters, "chapter fetched successfully"))
};

const updateChapter = asyncHandler(async(req, res, next)=>{
  const {chapter, chairman, secretary} = req.body;
  const {chapterId} = req.params
  let query = {};
  if(chapter){
    query.chapter = chapter
  }else if (chairman){
    query.chairman = chairman
  }else if(secretary){
    query.secretary = secretary
  }else{
    return res.status(400).json({success: false, message:"Atleast one field is required to update"})
  };
  console.log(query)
  const updatedChapter = await Chapter.findOneAndUpdate({_id: chapterId}, {$set:query}, {new: true});
  return res.status(201).json(new ApiResponse(201, updatedChapter, "Chapter updated successfully!"))
});

const deleteChapter = asyncHandler(async( req, res, next) => {
  const {chapterId} = req.params
  await Chapter.findOneAndDelete({_id: chapterId});
  return res.status(200).json(new ApiResponse(200, {}, "Chapter deleted successfully!"))
})

export {
    createChapter,
    getChapter,
    updateChapter,
    deleteChapter
}