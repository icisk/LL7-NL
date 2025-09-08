import datetime
import json
import logging
import os
from functools import lru_cache

import numpy as np
import pandas as pd
import requests
import xarray as xr

logging.basicConfig(filename='/dev/stdout', level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

@lru_cache(maxsize=None)
def format_file(file_path):
    try:
        data = xr.open_dataset(file_path)

        time_values = data['time'].values.astype('datetime64[D]').astype(str)
        cout_values = data['COUT'].sel(id=9503374).values.flatten().astype(float)

        today = datetime.datetime.now().date()
        end_date = today + datetime.timedelta(days=120)

        filtered_data = [
            [ts, float(cout)]
            for ts, cout in zip(time_values, cout_values)
            if (datetime.datetime.strptime(ts, '%Y-%m-%d').date() <= end_date)
        ]
        return filtered_data
    except Exception as e:
        logging.error(f'Error processing file {file_path}: {str(e)}')
        return []

def merge_epoches(base_path = './files'):
    files = os.listdir(base_path)
    epoches = [xr.open_dataset(os.path.join(base_path, f)).expand_dims(epoches=[i]) for i, f in enumerate(sorted(files)) if f.endswith('.nc')]
    data = xr.merge(epoches)
    return data

def lobith_selection(data, quantile=0.2):
    median = data.quantile(quantile, dim='epoches')
    lobith = median.sel(id = 9503374)
    weekly = lobith.resample(time='1W').min()
    time = weekly.time.values
    weeks = np.array([t.astype('datetime64[W]').item().isocalendar()[1] for t in time])
    months = np.array([t.astype('datetime64[M]').item().month for t in time])
    vals = weekly.COUT.values
    return weeks, months, vals

def categorize_value_lobith(val, month, tab_path='./warning_lvls_lobith.csv' ):
    tab_df = pd.read_csv(tab_path)
    month_row = tab_df[tab_df['month'] == month].iloc[0]
    if val > 2000:
        return "Blue"
    elif val < month_row['Red']:
        return "Red"
    elif val < month_row['Orange']:
        return "Orange"
    elif val < month_row['Yellow']:
        return "Yellow"
    elif val < month_row['Green']:
        return "Green"

def rijnland_precip_def(p_def_forecast_path, rijnland_mask_path):
    rj_mask = xr.open_dataset(rijnland_mask_path)
    ds = xr.open_zarr(p_def_forecast_path)
    weekly = ds['time'].resample(time='1W').max()
    time = weekly.time.values[:-1]
    weeks = np.array([t.astype('datetime64[W]').item().isocalendar()[1] for t in time])
    months = np.array([t.astype('datetime64[M]').item().month for t in time])
    mask_vals = rj_mask['mask'].where(rj_mask['mask'] == 666).values
    vals = [ds['p_def_q50'].sel(time=t).where(mask_vals).max().values for t in time]

    # vals = [ds['p_def_q50'].where(rj_mask['mask'].where(rj_mask['mask'] == 666).values).sel(time=t).max().values for t in time]
    return weeks, months, vals

def categorize_precip_def_rijnland(val):
    if val < 50:
        return "darkblue"
    if val >= 50 and val < 100:
        return "blue"
    if val >= 100 and val < 125:
        return "green"
    if val >= 125 and val < 150:
        return "yellow"
    if val >= 150 and val <  175:
        return 'orange'
    if val >= 175 and val < 200:
        return 'red'
    if val >= 200:
        return 'darkred'



def fetch_all_files(export_xr = False):
    try:
        file_paths = []
        baseName = './files/netherlands_ehype3_seasonal_COUT_'
        for i in range(415, 466):
            fp = baseName + str(i) + '.nc'
            file_paths.append(fp)

        all_data = [format_file(file) for file in file_paths]
        return json.dumps(all_data)
    except Exception as e:
        logging.error(f'Error fetching all files: {str(e)}')
        return json.dumps([])

def fetch_historic_data():
    current_datetime = datetime.datetime.now(datetime.timezone.utc)
    past_datetime = current_datetime - datetime.timedelta(60)
    # Get the timezone offset
    timezone_offset = current_datetime.astimezone().utcoffset()

    # Format the datetime
    formatted_datetime = current_datetime.strftime('%Y-%m-%dT%H:%M:%S.%f')
    formatted_past_datetime = past_datetime.strftime('%Y-%m-%dT%H:%M:%S.%f')

    # Adjust the timezone offset format
    offset_hours = int(timezone_offset.total_seconds() / 3600)
    offset_minutes = int((timezone_offset.total_seconds() % 3600) / 60)
    offset_str = f"{offset_hours:+03d}:{offset_minutes:02d}"

    # Combine the formatted datetime with timezone offset
    formatted_datetime_with_offset = f"{formatted_datetime}{offset_str}"
    formatted_past_datetime_with_offset = f"{formatted_past_datetime}{offset_str}"

    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'insomnia/8.3.0',
    }

    json_data = {
        'Locatie': {
            'Code': 'LOBI',
            'X': 713748.841038993,
            'Y': 5748948.95208459,
        },
        'AquoPlusWaarnemingMetadata': {
            'AquoMetadata': {
                'Compartiment': {
                    'Code': 'OW',
                },
                'Grootheid': {
                    'Code': 'Q',
                },
            },
            'WaarnemingMetadata': {
                'KwaliteitswaardecodeLijst': [
                    '00',
                    '10',
                    '20',
                    '25',
                    '30',
                    '40',
                ],
            },
        },
        'Periode': {
            'Begindatumtijd': formatted_past_datetime_with_offset,
            'Einddatumtijd': formatted_datetime_with_offset,
        },
    }

    response = requests.post(
        'https://waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGENSERVICES_DBO/OphalenWaarnemingen',
        headers=headers,
        json=json_data,
    ).json()
    historic_data = []
    for elem in response["WaarnemingenLijst"][0]["MetingenLijst"]:
        parsed_datetime = datetime.datetime.strptime(elem["Tijdstip"], '%Y-%m-%dT%H:%M:%S.%f%z')

        time = parsed_datetime.time()
        
        if str(time) == "00:00:00":
            historic_data.append([str(parsed_datetime.date()), elem["Meetwaarde"]["Waarde_Numeriek"]])
    historic_data = sorted(historic_data)
    return json.dumps(historic_data)

def fetch_json_coordinates_lat(path):
    try:
        data = xr.open_dataset(path)  
        return json.dumps(data['latitude'].values.tolist())
    except Exception as e:
        logging.error(f'Error processing file ./precip_data/precip_data.nc : {str(e)}')
        return []
    
def fetch_json_coordinates_lon(path):
    try:
        data = xr.open_dataset(path)  
        return json.dumps(data['longitude'].values.tolist())
    except Exception as e:
        logging.error(f'Error processing file ./precip_data/precip_data.nc : {str(e)}')
        return []


    
def fetch_json_data(path, data_name):
    data = xr.open_dataset(path)
    values = data[data_name].values
    values[np.isnan(values)] = -1
    values = values.tolist()
    timestamps = data["valid_time"].values.astype('datetime64[D]').astype(str)
    layers = [(ts, value) for ts, value in zip(timestamps, values[0])]
    return json.dumps(layers)

    # ds = xr.open_dataset("./data/subset_precip_small.nc")
    # data_values = []
    # for i in range(len(ds["rlat"].values)):
    #     row = []
    #     for j in range(len(ds["rlon"].values)):            
    #         lat = float(ds["lat"].values[i][j])
    #         lon = float(ds["lon"].values[i][j])
    #         data = float(ds["pr"].values[0][i][j])
    #         row.append([lat, lon, data])
            
    #     data_values.append(row)
    # return json.dumps(data_values)