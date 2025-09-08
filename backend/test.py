import xarray as xr
import netCDF4
import numpy as np

ds = xr.open_dataset("./temp_data_xr.nc")
print(ds["temp"].values)
# lat_min, lat_max = 1.924, 2.586   # Latitude bounds
# lon_min, lon_max = -8.465, -7.915  # Longitude bounds

# # Subsetting the data using .sel() function for latitude and longitude
# subset_ds = ds.sel(rlat=slice(lat_min, lat_max), rlon=slice(lon_min, lon_max))

# # Step 3: Save the subset to a new NetCDF file
# output_file = 'subset_file_temp.nc'  # Name for the smaller file
# subset_ds.to_netcdf(output_file)

# # Optionally, close the datasets to free up memory
# ds.close()
# subset_ds.close()

ds = xr.open_dataset("./data/subset_file_temp.nc")

temp_kelvin = ds['tas']

# Convert temperature from Kelvin to Celsius
temp_celsius = temp_kelvin - 273.15

# Replace the original temperature data with the Celsius data
ds['tas'] = temp_celsius

# Optionally, save the modified dataset to a new NetCDF file
ds.to_netcdf("temp_data_small.nc")

# Close the dataset
ds.close()
