import { useEffect, useState } from "react";
import { Button, Card, Col, Row, Typography } from "antd";
import { Icon } from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAt,
} from "firebase/firestore";

import { db } from "../firebase/fbconfig";
import "leaflet/dist/leaflet.css";
import "../styles/HomeStyles.css";

const MapComponent = () => {
  const [markerPosition, setMarkerPosition] = useState(null);

  const customIcon = new Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Function to handle map click
  const handleMapClick = (e) => {
    setMarkerPosition(e.latlng); // Update marker position on click
  };

  return (
    <MapContainer center={[35, 20]} zoom={2}>
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {/* Conditionally render the marker */}
      {markerPosition && <Marker position={markerPosition} icon={customIcon} />}

      {/* Attach event handler to the map */}
      <MapClickHandler onClick={handleMapClick} />
    </MapContainer>
  );
};

// Custom component to handle map click event
function MapClickHandler({ onClick }) {
  const map = useMapEvents({
    click: onClick,
  });

  return null; // This component doesn't render anything, it's just for handling events
}

async function getRandomLandmark() {
  try {
    // Generate a random number between 0 and 1
    const randomNumber = Math.random();

    // Create a query to get a random landmark document using the random number
    const q = query(
      collection(db, "landmarks"),
      orderBy("name"), // You can change the field to order by
      startAt(randomNumber),
      limit(1) // Limit the result to 1 random document
    );

    // Get the documents that match the query
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No landmarks found in the collection.");
      return null;
    }

    // Get the random landmark document
    const randomLandmarkDoc = querySnapshot.docs[0];
    const randomLandmarkData = randomLandmarkDoc.data();
    return randomLandmarkData; // Return the random landmark data
  } catch (error) {
    console.error("Error fetching random landmark:", error);
    return null;
  }
}

function Home() {
  const [randomLandmark, setRandomLandmark] = useState(null);

  useEffect(() => {
    // Call getRandomLandmark once when the page loads
    getRandomLandmark().then((landmarkData) => {
      if (landmarkData) {
        setRandomLandmark(landmarkData);
      }
    });
  }, []);
  console.log(randomLandmark);

  return (
    <div>
      {/* Display the random landmark data */}
      {randomLandmark && (
        <div>
          <Row>
            <Col span={12}>
              <Typography>Name: {randomLandmark.name}</Typography>
            </Col>
            <Col span={12}>
              <Button>Submit</Button>
            </Col>
          </Row>
        </div>
      )}
      <div className="map">
        <MapComponent />
      </div>
      {/* <Button onClick={getRandomLandmark}>Test</Button> */}
    </div>
  );
}

export default Home;
