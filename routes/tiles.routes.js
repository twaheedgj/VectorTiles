import { Router } from "express";
import { get_mvt_xyz,get_parcel_mvt } from "../controller/tiles.controller.js";


const tile_route = Router();

tile_route.get("/parcel/by-coords/:z/:x/:y.mvt", get_mvt_xyz);
tile_route.get("/parcel/:z/:x/:y.mvt", get_parcel_mvt);
export default tile_route;

