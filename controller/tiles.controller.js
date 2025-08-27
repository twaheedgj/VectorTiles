import  pool  from "./../database/postgres.js";
export const get_mvt_xyz = async (req, res, next) => {
  const z = Number(req.params.z), x = Number(req.params.x), y = Number(req.params.y);
  const lat = Number(req.query.lat), lon = Number(req.query.lon);
  if (![z,x,y].every(Number.isInteger) || isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ error: "Invalid z/x/y or lat/lon" });
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ error: "lat in [-90,90], lon in [-180,180]" });
  }

  const extent = Number(req.query.extent ?? 2048);
  const pad_m = Number(req.query.pad_m ?? 60);
  const neighbor_buffer_m = Number(req.query.neighbor_buffer_m ?? 150);

  const sql = `
    WITH pt AS (
      SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326) AS g4326
    ),
    tile AS (
      SELECT ST_TileEnvelope($3,$4,$5) AS g
    ),
    t AS (  -- subject parcel from point
      SELECT p.gid, ST_Transform(COALESCE(p.single_geom,p.geom),3857) AS g,
             p.prop_id, p.county
      FROM parcels p, pt
      WHERE ST_Contains(p.geom, pt.g4326)
      LIMIT 1
    ),
    win AS ( -- subject window clipped to current tile
      SELECT ST_Intersection(ST_Expand(ST_Envelope(t.g), $6)::geometry(Polygon,3857), tile.g) AS g
      FROM t, tile
    ),
    cand AS ( -- neighbors near subject
      SELECT n.gid, ST_Transform(COALESCE(n.single_geom,n.geom),3857) AS g,
             n.prop_id, n.county
      FROM parcels n, t
      WHERE ST_DWithin(ST_Transform(COALESCE(n.single_geom,n.geom),3857), t.g, $7)
    ),
    feats AS (
      SELECT t.gid, t.prop_id, t.county, 'subject'::text AS role,
             ST_AsMVTGeom(t.g, win.g, $8, 64, TRUE) AS geom
      FROM t, win
      WHERE ST_Intersects(t.g, win.g)
      UNION ALL
      SELECT c.gid, c.prop_id, c.county, 'neighbor'::text AS role,
             ST_AsMVTGeom(c.g, win.g, $8, 64, TRUE) AS geom
      FROM cand c, win, t
      WHERE c.gid <> t.gid AND ST_Intersects(c.g, win.g)
    )
    SELECT ST_AsMVT(feats, 'parcels', $8, 'geom') AS mvt
    FROM feats;
  `;

  let client;
  try {
    client = await pool.connect();
    const r = await client.query(sql, [lon, lat, z, x, y, pad_m, neighbor_buffer_m, extent]);
    const mvt = r.rows?.[0]?.mvt;
    if (!mvt) return res.status(204).send();
    res.setHeader("Content-Type","application/vnd.mapbox-vector-tile");
    res.setHeader("Cache-Control","public, max-age=3600, immutable");
    res.send(mvt);
  } catch (e) { next(e); } finally { if (client) client.release(); }
};
