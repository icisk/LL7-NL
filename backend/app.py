import json
import os

from flask import Flask, request, jsonify
from flask_cors import CORS

from low_water_line import get_low_water_line
from netcdf_formatter import fetch_all_files, fetch_historic_data, fetch_json_coordinates_lat, \
    fetch_json_coordinates_lon, fetch_json_data, merge_epoches, lobith_selection, \
    categorize_value_lobith, rijnland_precip_def, categorize_precip_def_rijnland
from netcdf_reader import fetch_files_from_ftp, download_and_unzip_data, nc2contour

app = Flask(__name__)
CORS(app)

print('getting ftp data')
fetch_files_from_ftp()
print('getting example data')
#download_and_unzip_data('https://52n-i-cisk.obs.eu-de.otc.t-systems.com/llrijnland/rijnland_example_data_10_24.zip')
#nc2contour()

@app.route('/api/')
def api_base():
    return(
        {
            'msg': 'moin'
        }
    )


@app.route('/api/lobith')
def get_lobith_data():
    data = fetch_all_files(),
    historic = fetch_historic_data()
    low_water = get_low_water_line()
    return {'data': data,
            'historic': historic,
            'low_water': low_water}




@app.route('/api/danger_levels')
def get_danger_levels():
    data = merge_epoches()
    weeks, months, vals = lobith_selection(data)
    categories = [categorize_value_lobith(val, month) for val, month in zip(vals, months)]
    lobith_dict = {int(item[0]): item[1] for item in [x for x in zip(weeks, categories)]}

    # precip_def_forecast_path = 'https://52n-i-cisk.obs.eu-de.otc.t-systems.com/data-ingestor/netherlands/knmi_obs_forecast.zarr'
    # rj_weeks, rj_month, rj_vals = rijnland_precip_def(precip_def_forecast_path,  './data/rijn_mask.nc')
    # rj_cat = [categorize_precip_def_rijnland(val) for val in rj_vals]
    # rijn_dict = {int(item[0]): item[1] for item in [x for x in zip(rj_weeks, rj_cat)]}


    return({'lobith_lvls': lobith_dict,
            'precipd_def': None})

@app.route('/api/rijnland')
def get_rijnland_data():
    with open("./data/Rijnland_area.json") as file:
        gj = json.load(file)
    return gj

@app.route('/api/week_danger')
def get_week_danger():
    return json.dumps(["no-danger", "no-danger", "no-danger", "no-danger", "no-danger", "no-danger", "no-danger"])
    


@app.route('/api/daily_danger_levels')
def get_daily_danger_levels():
    return {
        "data": [["2024-10-10", ["high", "medium", "low"]],["2024-10-11", ["low", "low", "medium"]]]
    }

@app.route('/api/temp')
def get_temp_data():
    path = "./data/t2m_ts.nc"
    data = fetch_json_data(path, "t2m")
    lats = fetch_json_coordinates_lat(path)
    lons = fetch_json_coordinates_lon(path)
    return {
        'data': data,
        'lats': lats,
        'lons': lons
    }

@app.route('/api/precip')
def get_precip_data():
    path = "./data/tp_ts.nc"
    data = fetch_json_data(path, "tp")
    lats = fetch_json_coordinates_lat(path)
    lons = fetch_json_coordinates_lon(path)
    return {
        'data': data,
        'lats': lats,
        'lons': lons
    }

@app.route('/api/evapo')
def get_evapo_data():
    path = "./data/e_ts.nc"
    data = fetch_json_data(path, "e")
    lats = fetch_json_coordinates_lat(path)
    lons = fetch_json_coordinates_lon(path)
    return {
        'data': data,
        'lats': lats,
        'lons': lons
    }

def read_contour(path, band):
    with open(os.path.join(path, f"{band:03}_contours.geojson")) as f:
        geojson_data = json.load(f)
    return jsonify(geojson_data)

@app.route('/api/temp_contour', methods=['POST'])
def get_temp_contour():
    req = request.get_json()
    band = req.get('band')
    path = "./data/t2m_ts_contour"
    return read_contour(path, band)

@app.route('/api/precip_contour', methods=['POST'])
def get_precip_contour():
    path = "./data/tp_ts_contour"
    req = request.get_json()
    band = req.get('band')
    return read_contour(path, band)

@app.route('/api/evapo_contour', methods=['POST'])
def get_evapo_contour():
    path = "./data/e_ts_contour"
    req = request.get_json()
    band = req.get('band')
    return read_contour(path, band)


if __name__ == "__main__":
    app.run()
