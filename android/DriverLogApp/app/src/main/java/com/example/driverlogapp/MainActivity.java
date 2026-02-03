package com.example.driverlogapp;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;

import android.widget.*;
import com.google.android.gms.location.*;
import com.google.android.gms.tasks.OnSuccessListener;

public class MainActivity extends AppCompatActivity {

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