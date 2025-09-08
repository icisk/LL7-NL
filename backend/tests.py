import os
import xarray as xr
import numpy as np
import time
import timeit


precip_def_forecast_path = 'https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/netherlands/knmi_obs_forecast.zarr'
ds = xr.open_zarr(precip_def_forecast_path) #1.1
weekly = ds['time'].resample(time='1W').max() #19.2
time = weekly.time.values[:-1]
weeks = np.array([t.astype('datetime64[W]').item().isocalendar()[1] for t in time])
months = np.array([t.astype('datetime64[M]').item().month for t in time])


start = os.times().elapsed

precip_def_forecast_path = 'https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/netherlands/knmi_obs_forecast.zarr'
mask_path = '/work/PROJEKTE/ICISK/csmockups/LL7_Netherlands/app/backend/data/rijn_mask.nc'
rj_mask = xr.open_dataset(mask_path)
ds = xr.open_zarr(precip_def_forecast_path) #1.1
weekly = ds['time'].resample(time='1W').max() #19.2
time = weekly.time.values[:-1]
weeks = np.array([t.astype('datetime64[W]').item().isocalendar()[1] for t in time])
months = np.array([t.astype('datetime64[M]').item().month for t in time])
# vals_old = [ds['p_def_q50'].where(rj_mask['mask'].where(rj_mask['mask'] == 666).values).sel(time=t).max().values for t in time]
mask_vals = rj_mask['mask'].where(rj_mask['mask'] == 666).values

p_def_q50_data = ds['p_def_q50'].values
vals = [np.nanmax(np.where(mask_vals, p_def_q50_data[ds['time'] == t], np.nan)) for t in time]
vals_real = [ds['p_def_q50'].sel(time=t).where(mask_vals).max().values for t in time]
end = os.times().elapsed

print(f"Execution time: {end - start:.6f} seconds")