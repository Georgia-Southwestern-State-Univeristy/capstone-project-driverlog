#BACKEND Info

<details open>

<summary>How to Connect to Backend</summary>

## How to connect to Azure function endpoints to start, add points, and end a GPS route.
Header must include ----> Key = Content-Type ; Value = application/json


Starting route----
URL : https://driverlogbackend-cwe7gpeuamfhffgt.eastus-01.azurewebsites.net/api/routes/start
BODY of JSON is empty : {}


Adding Points----
https://driverlogbackend-cwe7gpeuamfhffgt.eastus-01.azurewebsites.net/api/routes/r-50f935f3-a637-4562-af78-56fd5323fc57/points
---Notes r-xxxx is the routeId retrieved from the response of starting the route.---
---Time (ts) is epoch time created on client mobile device----
BODY of JSON (example below) NOTE: USE EPOCH TIME (https://www.epoch101.com/) :
{
  "points": [
    { "ts": 1769913660, "lat": 47.6401, "lon": -122.1301, "speed": 4.1 },
    { "ts": 1769913665, "lat": 47.6408, "lon": -122.1290, "speed": 4.3 },
    { "ts": 1769913670, "lat": 47.6414, "lon": -122.1279, "speed": 4.6 }
  ]
}


Ending route----
URL: https://driverlogbackend-cwe7gpeuamfhffgt.eastus-01.azurewebsites.net/api/routes/r-50f935f3-a637-4562-af78-56fd5323fc57/end
BODY : {}

</details>