import { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { Playlist } from "../models/playlists.model.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    try {
        const {name, description} = req.body
        const userId=req.user._id;
        //TODO: create playlist
        //? validate that given name and descriptin are not empty
        if(!(name || description)){
            throw new ApiError(400,"name or description is required")
        }
        //? create an object and entry in database
        const playList=await Playlist.create({
            name,
            description,
            owner:userId
        })
        if(!playList){
            throw new ApiError(502,"Failed to create play list")
        }
    
        return res.status(201)
        .json(
            new ApiResponce(
                200,
                playList,
                "play list created successfuly"
            )
        )
    } catch (error) {
        console.log("Error in create playlist: ",error);
        throw new ApiError(500,"Internal server Error !!! while creating playlist")
    }

})

const getUserPlaylists = asyncHandler(async (req, res) => {
   try {
     const {userId} = req.params
     //TODO: get user playlists
     if(!isValidObjectId(userId)){
         throw new ApiError(400,"Invalid user Id")
     }
     const playList=await Playlist.find({owner:userId});
 
     if(!playList){
         throw new ApiError(404,"playlist is empty")
     }
     return res.status(200)
     .json(
         new ApiResponce(
             200,
             playList,
             "playList fetched successfuly"
         )
     )
   } catch (error) {
        console.log("Error in get User playList: ",error);
        throw new ApiError(500,"Internal server Error !!! while getting user playlist")
   }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    try {
        const {playlistId} = req.params
        //TODO: get playlist by id
        if(!isValidObjectId(playlistId)){
            throw new ApiError(400,"Invalid playlist Id")
        }
    
        const playList=await Playlist.findById(playlistId);
    
        if(!playList){
            throw new ApiError(404,"playlist not found");
        }
        return res.status(200)
        .json(
            new ApiResponce(
                200,
                {
                playListVideoCount:playList.videos?.length,
                playList
                },
                "playlist fetched successfuly"
            )
        )
    } catch (error) {
        console.log("Error in get User playList by id: ",error);
        throw new ApiError(500,"Internal server Error !!! while getting user playlist by id")
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
   try {
     const {playlistId, videoId} = req.params
     if(!isValidObjectId(playlistId)){
         throw new ApiError(400,"Invalid playList id")
     }
     if(!isValidObjectId(videoId)){
         throw new ApiError(400,"Invalid video Id")
     }
    //? validate that user can only add in it's own playlist
    const isUserPlaList=await Playlist.findById(playlistId);

    if(!isUserPlaList){
        throw new ApiError(404,"Playlist not found");
    }
    if(isUserPlaList.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(401,"You can only add in your own playlist")
    }


     //? find the play list and add the video
     const playList=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push:{videos:videoId}
        },
        {
            new:true
        }
    
    );
     if(!playList){
         throw new ApiError(404,"play list not found");
     }
     return res.status(200)
     .json(
         new ApiResponce(
             200,
             playList,
             "video added succesfuly"
         )
     )
   } catch (error) {
    console.log("Error in adding video in playList: ",error);
    throw new ApiError(500,"Internal Server Error !! while adding video in play list")
   }

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
   try {
     const {playlistId, videoId} = req.params
     // TODO: remove video from playlist
     if(!isValidObjectId(playlistId)){
         throw new ApiError(400,"Invalid playList id")
     }
 
     if(!isValidObjectId(videoId)){
         throw new ApiError(400,"Invalid video Id")
     }
      //? validate that user can only remove in it's own playlist
      const isUserPlaList=await Playlist.findById(playlistId);
 
      if(!isUserPlaList){
          throw new ApiError(404,"Playlist not found");
      }
      if(isUserPlaList.owner.toString()!==req.user?._id.toString()){
          throw new ApiError(401,"You can only remove in your own playlist")
      }
 
      //? find the play list and remove the video
      const playList=await Playlist.findByIdAndUpdate(
         playlistId,
         {
             $pull:{videos:videoId}
         },
         {
             new:true
         }
     );
      if(!playList){
          throw new ApiError(404,"play list not found");
      }

      return res.status(200)
      .json(
        new ApiResponce(
            200,
            playList,
            "Video remove from playList"
        )
      )
   } catch (error) {
    console.log("Error in removind video in playList: ",error);
    throw new ApiError(500,"Internal Server Error !! while removind video in playlist")
   }

})

const deletePlaylist = asyncHandler(async (req, res) => {
    try {
            const {playlistId} = req.params
            // TODO: delete playlist
            if(!isValidObjectId(playlistId)){
                throw new ApiError(400,"invalid playlist id");
            }
    
            //? validate that user can only delete it's own playList
            const isUserPlaList= await Playlist.findById(playlistId);
    
            if(!isUserPlaList){
                throw new ApiError(404,"PlayList not found");
            }
            if(isUserPlaList.owner.toString()!==req.user._id.toString()){
                throw new ApiError(401,"You can only delete your own playList")
            }
            
            //? find and delete the playlist
            const playList= await Playlist.findByIdAndDelete(playlistId,{new:true});
    
            if(!playList){
                throw new ApiError(502,"Failed to delete PlayList");
            }
    
            return res.status(200)
            .json(
                new ApiResponce(
                    200,
                    playList,
                    "PlayList Deleted Successfuly"
                )
            )
        } catch (error) {
            console.log("Error in deleting playList: ",error);
            throw new ApiError(500,"Internal Server Error !! while deleting playlist")
        }
})

const updatePlaylist = asyncHandler(async (req, res) => {
  try {
      const {playlistId} = req.params
      const {name, description} = req.body
      //TODO: update playlist
      if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"invalid playlist Id");
      }
      if(!(name || description)){
        throw new ApiError(400,"name or description are required");
      }

      //? validate user can only update it's own playList
      const isUserPlaList=await Playlist.findById(playlistId);
      if(!isUserPlaList){
        throw new ApiError(404,"playList not found");
      }
      if(isUserPlaList.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(401,"you can only update your own playList");
      }

      //? find and update playList
      const playList= await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description
        },
        {
            new:true
        }
    );

    if(!playList){
        throw new ApiError(500,"Filed to update playList")
    }
    return res.status(200)
    .json(
        new ApiResponce(
            200,
            playList,
            "playList updated successfuly"
        )
    )
  } catch (error) {
    console.log("Error in updating playList: ",error);
    throw new ApiError(500,"Internal Server Error !! while updating playlist")
  }

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}