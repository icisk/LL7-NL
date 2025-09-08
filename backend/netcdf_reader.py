import io
import logging
import os
import subprocess
import zipfile
from ftplib import FTP

import requests
from dotenv import load_dotenv

logging.basicConfig(filename='/dev/stdout', level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
load_dotenv()

FTP_HOST = os.getenv("FTP_HOST")
FTP_USER = os.getenv("FTP_USER")
FTP_PASS = os.getenv("FTP_PASS")

def fetch_files_from_ftp():
    try:
        # Connect to FTP
        ftp = FTP(FTP_HOST)
        ftp.login(user=FTP_USER, passwd=FTP_PASS)

        date_folder = f"living_labs/netherlands/seasonal_forecast/"
        ftp.cwd(date_folder)

        # Gets latest available folder 
        numeric_directories = [d for d in ftp.nlst() if d.isdigit()]
        highest_directory = max(numeric_directories, key=int)
        upload_folder = f"./{highest_directory}/"
        ftp.cwd(upload_folder)

        # Check if exist and remove old
        storage_directory = './files'
        if not os.path.exists(storage_directory):
            os.makedirs(storage_directory)

        for f in os.listdir(storage_directory):
            if not f.endswith(".nc"):
                continue
            os.remove(os.path.join(storage_directory, f))

        # Add new files
        file_list = ftp.nlst()
        for file in file_list:
            if file.endswith('.nc') and 'COUT' in file:
                file_path = os.path.join(storage_directory, file)
                with open(file_path, 'wb') as f:
                    ftp.retrbinary('RETR ' + file, f.write)
                    
        ftp.quit()
        logging.info('Files fetched successfully from FTP')

    except Exception as e:
        logging.error(f'Error occurred while fetching files from FTP: {str(e)}')

# Function that finds latest directory
def find_highest_directory(path):

    directories = [d for d in os.listdir(path) if os.path.isdir(os.path.join(path, d))]

    if not directories:
        return None

    numeric_directories = [d for d in directories if d.isdigit()]

    if not numeric_directories:
        return None

    highest_directory = max(numeric_directories, key=int)

    return highest_directory

def download_and_unzip_data(url):
    data_path = '/app/data'
    if 'e_ts.nc' not in os.listdir(data_path):
        response = requests.get(url)
        with zipfile.ZipFile(io.BytesIO(response.content)) as zip_ref:
            zip_ref.extractall(data_path)
    else:
        print('nodownload')


def nc2contour():
    cint = 1
    data_path = '/app/data'
    blacklist = ['rijn_mask.nc']
    data_files = os.listdir(data_path)
    white_data_files = [file for file in data_files if file not in blacklist]
    if 'e_ts.nc' in white_data_files:
        for var in [file for file in white_data_files if file.endswith('.nc')]:
            logging.info(f"Processing {var} Dataset")
            os.makedirs(os.path.join(data_path, f"""{var.split('.')[0]}_contour"""), exist_ok=True)
            if var == 't2m_ts.nc':
                bands = 120
            else:
                bands = 30
            for b in range(bands):
                cmd = ["gdal_contour",
                       "-i", str(cint),
                       "-p",
                       "-b", str(b+1),
                       "-amax", "max",
                       os.path.join(data_path, var),
                       os.path.join(data_path, f"""{var.split('.')[0]}_contour""", f"{b:03}_contours.geojson")]
                res = subprocess.run(cmd, capture_output=True, text=True, check=True)
