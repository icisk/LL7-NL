import datetime
import json

def get_low_water(day):
    cases = {
        1: 1000,
        2: 1000,
        3: 1000,
        4: 1000,
        5: 1400,
        6: 1300,
        7: 1200,
        8: 1100,
        9: 1000,
        10: 1000,
        11: 1000,
        12: 1000
    }
    return cases.get(day.month)

def get_low_water_line(): 
    low_water_line = []
    current_date = datetime.datetime.now().date()
    first_date = current_date - datetime.timedelta(60)

    for i in range(0,240):
        low_water_line.append([str(first_date + datetime.timedelta(i)), get_low_water(first_date + datetime.timedelta(i))])

    return json.dumps(low_water_line)
