import { Router } from "express";
import { get_mvt_xyz } from "../controller/tiles.controller.js";


const tile_route = Router();

tile_route.get("/parcel/by-coords/:z/:x/:y.mvt", get_mvt_xyz);
export default tile_route;

