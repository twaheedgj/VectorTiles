import { Router } from "express";
import { get_mvt_xyz,get_parcel_mvt ,get_ponds_mvt, get_streams_mvt,get_wetlands_mvt,get_waterbodies_mvt,get_sea_ocean_mvt} from "../controller/tiles.controller.js";


const tile_route = Router();

tile_route.get("/parcel/by-coords/:z/:x/:y.mvt", get_mvt_xyz);
tile_route.get("/parcels/:z/:x/:y.mvt", get_parcel_mvt);
tile_route.get("/ponds/:z/:x/:y.mvt", get_ponds_mvt);
tile_route.get("/streams/:z/:x/:y.mvt", get_streams_mvt);
tile_route.get("/wetlands/:z/:x/:y.mvt", get_wetlands_mvt);
tile_route.get("/water-bodies/:z/:x/:y.mvt", get_waterbodies_mvt);
tile_route.get("/sea-ocean/:z/:x/:y.mvt", get_sea_ocean_mvt);
export default tile_route;

