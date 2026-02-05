package com.example.driverlogapp;

import android.Manifest;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.location.Location;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import android.widget.*;
import com.google.android.gms.location.*;
import com.google.android.gms.tasks.OnSuccessListener;

import java.io.IOException;

import okhttp3.*;

public class MainActivity extends AppCompatActivity {

    // Declare variables
    private int routeID;
    private boolean loopFinished;

    private Button getLocationBtn;
    private FusedLocationProviderClient locationClient;
    private TextView editText;
    private static final int LOCATION_PERMISSION_REQUEST = 1001;
    private boolean isRunning = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize TextView and Button from layout
        getLocationBtn = findViewById(R.id.routeControl);

        // Initialize the location provider client
        locationClient = LocationServices.getFusedLocationProviderClient(this);

        // Set a click listener for the button
        getLocationBtn.setOnClickListener(v -> routeManagement());
    }

    // Function to get the current location
    private void routeManagement() {
        // Check if location permission is granted
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            // Request permission if not granted
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, LOCATION_PERMISSION_REQUEST);
            return;
        }

        // initialize variables
        routeID = 0;

        //If block controlling start stopping route and button display
        if (!isRunning) {
            isRunning = true;
            getLocationBtn.setText("Stop");
            getLocationBtn.setBackgroundColor(Color.RED);
            Toast.makeText(this, "Route Started", Toast.LENGTH_SHORT).show();
            //Send blank JSON file with expected headers to backend to start recording route on that end
            routeID = startRoute()[0];
            Toast.makeText(this, "Route ID: " + routeID, Toast.LENGTH_SHORT).show();
        }
        else {
            isRunning = false;
            getLocationBtn.setText("Start");
            getLocationBtn.setBackgroundColor(Color.parseColor("#246B19"));
            Toast.makeText(this, "Route Stopped", Toast.LENGTH_SHORT).show();
        }

        //While/For loop controlling the polling and logging of location data
        while (isRunning) {
            //early escape check
            loopFinished = false;

            for (int i = 0; i < 30; i++) {
                // Fetch the last known location
                locationClient.getLastLocation().addOnSuccessListener(new OnSuccessListener<Location>() {
                    @Override
                    public void onSuccess(Location location) {
                        if (location != null) {
                            //Add location information to JSON file

                        }
                    }
                });

                //timer so the loop doesn't run too fast
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }

            }

            //Send populated JSON file to backend and repeat
            loopFinished = true;
        }

        //if block to check is JSON file exists and to send it to backend
        if (!loopFinished) {

        }

        //Send blank JSON file with expected headers to backend to stop recording route on that end
        stopRoute();





        // Fetch the last known location
        locationClient.getLastLocation().addOnSuccessListener(new OnSuccessListener<Location>() {
            @Override
            public void onSuccess(Location location) {
                //crashed with this line of code, presumably because location is null
                //Toast.makeText(MainActivity.this, "location " + location.getLatitude(), Toast.LENGTH_SHORT).show();
                if (location != null) {
                    // Get latitude and longitude
                    double lat = location.getLatitude();
                    double lon = location.getLongitude();

                    // Display location in TextView
                }
            }
        });
    }

    public int[] startRoute() {
        final int[] routeID = {0};
        new Thread(() -> {
            try {
                OkHttpClient client = new OkHttpClient();

                RequestBody body = RequestBody.create("{}", MediaType.parse("application/json"));
                Request request = new Request.Builder()
                        .url("https://driverlogbackend-cwe7gpeuamfhffgt.eastus-01.azurewebsites.net/api/routes/start")
                        .post(body)
                        .build();
                Response response = client.newCall(request).execute();
                if (response.isSuccessful()) {
                    routeID[0] = response.code();
                }
                } catch (IOException e) {
                e.printStackTrace();
            }
        }).start();
        return routeID;
    }

    public void stopRoute() {
        new Thread(() -> {
            try {
                OkHttpClient client = new OkHttpClient();

                RequestBody body = RequestBody.create("{}", MediaType.parse("application/json"));
                Request request = new Request.Builder()
                        .url("https://driverlogbackend-cwe7gpeuamfhffgt.eastus-01.azurewebsites.net/api/routes/r-50f935f3-a637-4562-af78-56fd5323fc57/end")
                        .post(body)
                        .build();
                Response response = client.newCall(request).execute();
            } catch (IOException e) {
                e.printStackTrace();
                }
        });

    }


    // Handle the result of the permission request
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == LOCATION_PERMISSION_REQUEST && grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            // If permission is granted, fetch location
            routeManagement();
        } else {
            // If permission is denied, show message
            Toast.makeText(this, "Location permission denied", Toast.LENGTH_SHORT).show();
        }
    }
}


/*public class MainActivity extends AppCompatActivity {

    // Declare variables
    private FusedLocationProviderClient locationClient;
    private TextView locationText;
    private static final int LOCATION_PERMISSION_REQUEST = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize TextView and Button from layout
        locationText = findViewById(R.id.editTextText);
        Button getLocationBtn = findViewById(R.id.routeControl);

        // Initialize the location provider client
        locationClient = LocationServices.getFusedLocationProviderClient(this);

        // Set a click listener for the button
        getLocationBtn.setOnClickListener(v -> getCurrentLocation());
    }

    // Function to get the current location
    private void getCurrentLocation() {
        // Check if location permission is granted
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            // Request permission if not granted
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, LOCATION_PERMISSION_REQUEST);
            return;
        }


        // Fetch the last known location
        locationClient.getLastLocation().addOnSuccessListener(new OnSuccessListener<Location>() {
            @Override
            public void onSuccess(Location location) {
                //crashed with this line of code, presumably because location is null
                //Toast.makeText(MainActivity.this, "location " + location.getLatitude(), Toast.LENGTH_SHORT).show();
                if (location != null) {
                    // Get latitude and longitude
                    double lat = location.getLatitude();
                    double lon = location.getLongitude();
                    Toast.makeText(MainActivity.this, "location success", Toast.LENGTH_SHORT).show();

                    // Display location in TextView
                    locationText.setText("Latitude: " + lat + "\nLongitude: " + lon);
                }
                else if (location == null) {
                    // Display error message if location is null
                    locationText.setText("Unable to get location");
                }
                else {
                    locationText.setText("Something is wrong");
                }
            }
        });
    }

    // Handle the result of the permission request
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == LOCATION_PERMISSION_REQUEST && grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            // If permission is granted, fetch location
            getCurrentLocation();
        } else {
            // If permission is denied, show message
            locationText.setText("Location permission denied");
        }
    }
}
*/