import { useEffect, useState } from "react";
import {
  Button,
  Col,
  Modal,
  Row,
  Typography,
  Image,
  Statistic,
  Divider,
} from "antd";
import { Icon } from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Polyline,
} from "react-leaflet";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  getCountFromServer,
} from "firebase/firestore";
import CountUp from "react-countup";

import { db } from "../firebase/fbconfig";
import "leaflet/dist/leaflet.css";
import "../styles/HomeStyles.css";

// Random lanmark global var
let landmark = null;
// Var for modal
let scoreModal = null;

// Vats for guess score and distance
let guessScore = null;
let guessText = null;

const MapComponent = ({ openModalFunc }) => {
  const [markerPosition, setMarkerPosition] = useState(null);
  const [enableMarkerPlacement, setEnableMarkerPlacement] = useState(true);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  useEffect(() => {
    // Wait for 1000 milliseconds (1 second) before running the next code. This is to make sure the landmark variable has been initialized
    const timeoutId = setTimeout(() => {
      setLat(parseFloat(landmark.latitude));
      setLon(parseFloat(landmark.longitude));
    }, 1000);

    //Cleaning up the timeout when the component unmounts or when you no longer need it
    return () => clearTimeout(timeoutId);
  }, []);

  const blueIcon = new Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const greenIcon = new Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Function to handle map click
  const handleMapClick = (e) => {
    if (enableMarkerPlacement) {
      setMarkerPosition(e.latlng); // Update marker position on click
    }
  };
  var actualLatLng;
  // Create a LatLng object
  if (lat && lon) {
    actualLatLng = [lat, lon];
  }

  return (
    <div>
      <MapContainer
        center={[35, 20]}
        zoom={2}
        maxBoundsViscosity={1.0}
        minZoom={3}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Conditionally render the marker */}
        {markerPosition && <Marker position={markerPosition} icon={blueIcon} />}

        {/* Conditionally render the actual marker and polyline. If marker placement is enabled, this is disabled */}
        {!enableMarkerPlacement && (
          <>
            <Marker position={actualLatLng} icon={greenIcon} />
            {markerPosition && (
              <Polyline
                positions={[markerPosition, actualLatLng]}
                color="green"
              />
            )}
          </>
        )}

        {/* Attach event handler to the map */}
        <MapClickHandler onClick={handleMapClick} />
      </MapContainer>
      {markerPosition && (
        <div style={{ textAlign: "center" }}>
          <Button
            type="primary"
            size="large"
            disabled={!enableMarkerPlacement}
            onClick={() => {
              calculateScore(markerPosition);
              setEnableMarkerPlacement(false);
              openModalFunc();
            }}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
};

// Custom component to handle map click event
function MapClickHandler({ onClick }) {
  const map = useMapEvents({
    click: onClick,
  });

  return null; // This component doesn't render anything, it's just for handling events
}

// Getting random landmark from firestore
async function getRandomLandmark() {
  try {
    const landmarksCollection = collection(db, "landmarks");

    // Getting number of documents in the collection so randomizing works
    const snapshot = await getCountFromServer(landmarksCollection);
    const numberOfDocuments = snapshot.data().count;

    // Generate a random number between 1 and length of the collection
    const randomValue = Math.floor(Math.random() * numberOfDocuments) + 1;

    // Query documents with 'random' field
    const q = query(
      landmarksCollection,
      where("random", "==", randomValue), // Query based on the 'random' field
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.size === 0) {
      console.log("No landmarks found with the specified 'random' value.");
      return null;
    }

    // Get the first document from the query results
    const randomLandmarkData = querySnapshot.docs[0].data();

    return randomLandmarkData;
  } catch (error) {
    console.error("Error fetching random landmark:", error);
    return null;
  }
}

// Calculating score
const calculateScore = (markerPosition) => {
  // Calculate the score based on markerPosition

  // Original values for true lat/lon and guess lat/lon
  const guessLatitude = markerPosition.lat;
  const guessLongitude = markerPosition.lng;
  const landmarkLatitude = landmark.latitude;
  const landmarkLongitude = landmark.longitude;

  const guess_lat_rad = guessLatitude * (Math.PI / 180);
  const guess_lon_rad = guessLongitude * (Math.PI / 180);
  const real_lat_rad = landmarkLatitude * (Math.PI / 180);
  const real_lon_rad = landmarkLongitude * (Math.PI / 180);

  // Haversine formula
  const dlon = real_lon_rad - guess_lon_rad;
  const dlat = real_lat_rad - guess_lat_rad;
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(guess_lat_rad) * Math.cos(real_lat_rad) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = 6371 * c; // Earth's radius in km

  // Calculate the score
  const max_distance = 3000; // Maximum possible distance between two points
  const score = Math.round(1000 * (1 - distance / max_distance));
  const formattedScore = Math.max(score, 0); // Ensure the score is not negative

  const meterDistance = Math.round(distance * 1000 * 100) / 100;
  const formattedDistance = Math.round(distance * 100) / 100;

  const returnText = `${
    meterDistance >= 1000
      ? `${(Math.round(distance * 100) / 100).toLocaleString("en-US")}KM (${(
          Math.round(distance * 0.621371 * 100) / 100
        ).toLocaleString("en-US")}Mi)`
      : `${meterDistance.toLocaleString("en-US")}M (${(
          Math.round(meterDistance * 3.2808 * 100) / 100
        ).toLocaleString("en-US")}ft)`
  }`;

  guessScore = score;
  guessText = returnText;
  return returnText;
};

function Home() {
  const [randomLandmark, setRandomLandmark] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDesc] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const formatter = (value) => <CountUp end={value} separator="," />;
  const { Title } = Typography;

  useEffect(() => {
    // Call getRandomLandmark once when the page loads
    getRandomLandmark().then((landmarkData) => {
      if (landmarkData) {
        landmark = landmarkData;
        setRandomLandmark(landmarkData);
      }
      // This code will run immediately when the component is mounted
      const timeoutId = setTimeout(() => {
        // This code will run after a 1-second delay
        setDesc(landmark.description);
        setImageUrl(landmark.imageUrl);
      }, 1000);
    });
  }, []);

  // Function to update isModalOpen state
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const guessScoreInside = guessScore;
  const guessTextInside = guessText;
  return (
    <div>
      {/* Display the random landmark data */}
      {randomLandmark && (
        <div>
          <Row>
            <Col span={12}>
              <Typography>Name: {randomLandmark.name}</Typography>
            </Col>
          </Row>
        </div>
      )}
      <Modal
        style={{ textAlign: "center" }}
        open={isModalOpen}
        onCancel={closeModal}
      >
        <Divider plain>
          <Title level={2}>Score</Title>
        </Divider>
        <Statistic value={guessScoreInside} formatter={formatter} />
        <Image src={imageUrl}></Image>
        <Title level={4}>{description}</Title>
        <Title level={5}>{guessTextInside}</Title>
      </Modal>
      <div className="map">
        <MapComponent openModalFunc={openModal} />
      </div>
      {/* <Button onClick={getRandomLandmark}>Test</Button> */}
    </div>
  );
}

export default Home;
