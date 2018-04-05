import numpy as np
import pandas as pd

df = pd.read_csv("Coord-v3.1.csv")
df.loc[:, "station_id"] = np.nan
num = 1

for i in range(len(df)):
    if pd.isnull(df.station_id[i]):
        if (df.type[i] == "transfer"):
            name = df.loc[i, "name"]
            df.loc[df.name == name, "station_id"] = num
        else:
            df.loc[i, "station_id"] = num
        num += 1