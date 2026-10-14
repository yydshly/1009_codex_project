// Inputs are geographic coordinates; DEM samples retain physical metres.
// Hand-drawn locating footprint, not an administrative boundary dataset.
export const locatingFootprint=[[79,35],[77,36],[74,37],[73.6,39.5],[76,41],[79.8,42],[80.7,45],[82.3,45.3],[82.5,47],[85,47],[86,48.5],[88.1,49],[90.3,47.6],[90.7,46.2],[93.7,45],[95.3,44.3],[96,42.7],[93.5,40.2],[91,39],[90,36.5],[85,35.5]];
export function inLocatingFootprint(lon,lat) {
  let inside=false;
  for(let i=0,j=locatingFootprint.length-1;i<locatingFootprint.length;j=i++){
    const a=locatingFootprint[i],b=locatingFootprint[j];
    if((a[1]>lat)!==(b[1]>lat)&&lon<(b[0]-a[0])*(lat-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
export function sampleElevation(dem, lon, lat) {
  const [west, south, east, north] = dem.bounds;
  const x = Math.max(0, Math.min(dem.cols - 1, (lon - west) / (east - west) * (dem.cols - 1)));
  const y = Math.max(0, Math.min(dem.rows - 1, (north - lat) / (north - south) * (dem.rows - 1)));
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, dem.cols - 1), y1 = Math.min(y0 + 1, dem.rows - 1);
  const fx = x - x0, fy = y - y0;
  const a = dem.heights[y0 * dem.cols + x0] * (1 - fx) + dem.heights[y0 * dem.cols + x1] * fx;
  const b = dem.heights[y1 * dem.cols + x0] * (1 - fx) + dem.heights[y1 * dem.cols + x1] * fx;
  return a * (1 - fy) + b * fy;
}

export function terrainDimensions(dem, width = 16) {
  const [west, south, east, north] = dem.bounds;
  const widthMetres = (east - west) * Math.cos((north + south) / 2 * Math.PI / 180) * 111320;
  const depth = (north - south) * 111320 / widthMetres * width;
  return { width, depth, widthMetres, origin: dem.min };
}

export function terrainPoint(dem, lon, lat, exaggeration, dimensions = terrainDimensions(dem)) {
  const [west, south, east, north] = dem.bounds;
  return [(lon - west) / (east - west) * dimensions.width - dimensions.width / 2,
    (sampleElevation(dem, lon, lat) - dimensions.origin) / dimensions.widthMetres * dimensions.width * exaggeration,
    (north - lat) / (north - south) * dimensions.depth - dimensions.depth / 2];
}
