import xarray as xr
import numpy as np
import math
import netCDF4 as nc
# Open the NetCDF dataset
ds = xr.open_dataset("./data/temp_data_small.nc")

# Define latitude and longitude bounds
# lon_min, lon_max = 4.2900633, 4.8576905   # Longitude bounds
# lat_min, lat_max = 51.9966238, 52.4723658  # Latitude bounds
def get_four_points(lat, lon, distance_matrix): 
    flat_indices = np.argsort(distance_matrix, axis=None)[:10]

    # Convert flat indices back to 2D indices
    row_indices, col_indices = np.unravel_index(flat_indices, distance_matrix.shape)
    # Combine row and column indices into a list of tuples
    smallest_indices = list(zip(row_indices, col_indices))
    i = 0
    lats_closest, lons_closest = set(), set() 
    while len(lats_closest) < 2 or len(lons_closest) < 2: 
        x ,y  = smallest_indices[i][0], smallest_indices[i][1]
        if len(lats_closest) < 2: 
            lats_closest.add(x)
        if len(lons_closest) < 2:
            lons_closest.add(y)
        i += 1
    lats_closest = list(lats_closest)
    lons_closest = list(lons_closest)  
    return [np.array([lats_closest[0], lons_closest[0]]), np.array([lats_closest[0], lons_closest[1]]), np.array([lats_closest[1], lons_closest[0]]), np.array([lats_closest[1], lons_closest[1]])]


def interpolate(lat, lon, date):
    len_lat = len(ds["lat"])
    len_lon = len(ds["lat"][0])
    distance_from_x = np.zeros(shape=ds["lat"].shape)

    for x in range(len(distance_from_x)): 
        for y in range(len(distance_from_x[x])): 
            distance_from_x[x][y] = math.sqrt((ds["lat"].values[x][y] - lat)**2 + (ds["lon"].values[x][y] - lon)**2)

    bottom_left_indices, bottom_right_indices, top_left_indices, top_right_indices = get_four_points(lat, lon, distance_from_x)
    # flat_indices = np.argsort(distance_from_x, axis=None)[0]

    # # Convert flat indices back to 2D indices
    # nearest_coords = np.unravel_index(flat_indices, distance_from_x.shape)
    # lat_shift, lon_shift  = 0 , 0
    
    # if lat >= ds["lat"].values[nearest_coords]: 
    #     lat_shift = np.array([1,0]) 
    # else: 
    #     lat_shift = np.array([-1,0]) 
    # if lon >= ds["lon"].values[nearest_coords]: 
    #     lon_shift = np.array([0,1]) 
    # else: 
    #     lon_shift = np.array([0,-1]) 
    # nearest_coords = np.array(list(nearest_coords))
    # smallest_indices = [nearest_coords.tolist(), (nearest_coords + lat_shift).tolist(),(nearest_coords + lon_shift).tolist(),(nearest_coords  + lat_shift+ lon_shift).tolist()]

    # # Combine row and column indices into a list of tuples
    # smallest_indices = sorted(smallest_indices)
    # bottom_left_indices = np.array(smallest_indices[0])
    # bottom_right_indices = np.array(smallest_indices[1])
    # top_left_indices = np.array(smallest_indices[2])
    # top_right_indices = np.array(smallest_indices[3])



    bottom_left_coords = np.array([ds["lat"].values[bottom_left_indices[0]][bottom_left_indices[1]], ds["lon"].values[bottom_left_indices[0]][bottom_left_indices[1]]])
    bottom_right_coords = np.array([ds["lat"].values[bottom_right_indices[0]][bottom_right_indices[1]], ds["lon"].values[bottom_right_indices[0]][bottom_right_indices[1]]])
    top_left_coords = np.array([ds["lat"].values[top_left_indices[0]][top_left_indices[1]], ds["lon"].values[top_left_indices[0]][top_left_indices[1]]])
    top_right_coords = np.array([ds["lat"].values[top_right_indices[0]][top_right_indices[1]], ds["lon"].values[top_right_indices[0]][top_right_indices[1]]])
    right_diff = bottom_right_coords - bottom_left_coords
    top_diff = top_left_coords - bottom_left_coords

    A = np.array([top_diff, right_diff])
    b = np.array([lat - bottom_left_coords[0], lon - bottom_left_coords[1]])
    ratios = np.linalg.solve(A.T,b)

    bottom_left_value = ds["tas"].values[date][bottom_left_indices[0],bottom_left_indices[1]]
    bottom_right_value = ds["tas"].values[date][bottom_right_indices[0],bottom_right_indices[1]]
    top_left_value = ds["tas"].values[date][top_left_indices[0],top_left_indices[1]]
    top_right_value = ds["tas"].values[date][top_right_indices[0],top_right_indices[1]]
    x_0 = (1 - ratios[0])* bottom_left_value + ratios[0] * top_left_value
    x_1  = (1 - ratios[0]) * bottom_right_value + ratios[0] * top_right_value

    x = (1 - ratios[1]) * x_0 + ratios[1] * x_1
    if x < 0: 
        return 0
    return x
precip = []
time = ds["time"].values[:50]
lats = np.arange(51.99, 52.48, 0.04)
lons = np.arange(4.29, 4.86, 0.04)
for date in range(len(time)): 
    time_stamp = []
    for lat in lats: 
        row = []
        for lon in lons: 
            row.append(interpolate(lat, lon, date))
        time_stamp.append(row)
    precip.append(time_stamp)
precip_da = xr.DataArray(
    precip,
    dims=["time", "lat", "lon"],
    coords={"time": time, "lat": lats, "lon": lons},
    name="temp"
)

ds = xr.Dataset({"temp": precip_da})


ds.to_netcdf("temp_data_xr.nc")
