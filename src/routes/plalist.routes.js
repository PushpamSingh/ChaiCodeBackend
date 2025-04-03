import express from "express";
import { VeryfyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const router =express.Router();

router.route("/createplaylist").post(VeryfyJWT,createPlaylist);
router.route("/getuserplaylists/:userId").get(VeryfyJWT,getUserPlaylists);
router.route("/getplaylistbyid/:playlistId").get(VeryfyJWT,getPlaylistById);
router.route("/addvideotoplaylist/:playlistId/:videoId").post(VeryfyJWT,addVideoToPlaylist);
router.route("/removevideofromplaylist/:playlistId/:videoId").delete(VeryfyJWT,removeVideoFromPlaylist);
router.route("/deleteplaylist/:playlistId").delete(VeryfyJWT,deletePlaylist);
router.route("/updateplaylist/:playlistId").put(VeryfyJWT,updatePlaylist);

export default router;