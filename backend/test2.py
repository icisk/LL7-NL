import xarray as xr
import json 
import datetime
import numpy as np

def fetch_json_data(path, data_name):
    data = xr.open_dataset(path)
    values = data[data_name].values
    values[np.isnan(values)] = -1
    values = values.tolist()
    timestamps = data["valid_time"].values.astype('datetime64[D]').astype(str)
    # print(len(values))
    layers = [(ts, value) for ts, value in zip(timestamps, values[0])]
    return json.dumps(layers)

print(fetch_json_data("./data/t2m_ts.nc", "t2m"))