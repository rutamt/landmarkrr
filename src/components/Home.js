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
  Form,
  InputNumber,
  Space,
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
let guessDistance = null;

const MapComponent = ({ openModalFunc, onReset, nextRound }) => {
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

  // Function to reset the MapComponent
  const resetMapComponent = () => {
    // Clear the marker position and re-enable marker placement
    setMarkerPosition(null);
    setEnableMarkerPlacement(true);

    // Call onReset function provided as a prop (if it exists)
    if (onReset) {
      onReset();
    }
  };

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
          <Space direction="horizontal">
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
            {!enableMarkerPlacement && (
              <Button onClick={nextRound}>Next round</Button>
            )}
          </Space>
        </div>
      )}
    </div>
  );
};

const RoundForm = ({ onFinish }) => {
  const [open, setOpen] = useState(true);
  const [form] = Form.useForm();
  const { Title } = Typography;
  const onOk = () => {
    form.submit();
    setOpen(false);
  };
  return (
    <>
      <Modal open={open} onOk={onOk}>
        <Title level={1}>Round select</Title>
        <Title level={3}>How many rounds do you wish to play?</Title>
        <Form form={form} onFinish={onFinish}>
          <Form.Item
            name={"roundSelection"}
            rules={[
              { required: true, message: "Please select a number of rounds" },
            ]}
          >
            <InputNumber min={1} defaultValue={1}></InputNumber>
          </Form.Item>
        </Form>
      </Modal>
    </>
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
  const score = Math.max(Math.round(1000 * (1 - distance / max_distance)), 0);

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
  guessDistance = formattedDistance;
};

function Home() {
  const [randomLandmark, setRandomLandmark] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDesc] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [resetCounter, setResetCounter] = useState(0); // Used for resetting the MapComponent

  // Initialize state with values from localStorage or defaults
  const [currentRound, setCurrentRound] = useState(
    localStorage.getItem("currentRound")
      ? parseInt(localStorage.getItem("currentRound"))
      : 1
  );

  const [numRounds, setNumRounds] = useState(
    localStorage.getItem("numRounds")
      ? parseInt(localStorage.getItem("numRounds"))
      : 1
  );

  const [distance, setDistance] = useState(
    localStorage.getItem("distance")
      ? parseInt(localStorage.getItem("distance"))
      : 0
  );

  const [score, setScore] = useState(
    localStorage.getItem("score") ? parseInt(localStorage.getItem("score")) : 0
  );

  const formatter = (value) => <CountUp end={value} separator="," />;
  const { Title } = Typography;

  // Update localStorage when the state changes
  useEffect(() => {
    localStorage.setItem("currentRound", currentRound.toString());
    localStorage.setItem("numRounds", numRounds.toString());
    localStorage.setItem("distance", distance.toString());
    localStorage.setItem("score", score.toString());
  }, [currentRound, numRounds, distance, score]);

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

  // Function to start a new round
  const startNewRound = () => {
    // Check if all rounds are completed

    if (currentRound < numRounds) {
      // Start a new round by resetting the game state

      setScore(score + guessScore);
      setDistance(distance + guessDistance);

      // Call getRandomLandmark to get a new landmark for the next round
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

      // Reset the map
      handleResetMapComponent();
      // Increment the current round
      setCurrentRound(currentRound + 1);
    } else {
      // All rounds are completed, you can display a game over message or take other actions
      alert("Game Over! All rounds completed.");
    }
  };
  // Function to reset the game
  const resetGame = () => {
    // Reset the state and update localStorage
    setCurrentRound(1);
    setNumRounds(1);
    setDistance(1);
    setScore(0);
  };

  // Function used in the RoundForm to get the response
  const onRoundFormFinish = (values) => {
    handleNumRoundsChange(values.roundSelection);
  };
  // Function to update the number of rounds when the user selects a value
  const handleNumRoundsChange = (value) => {
    setNumRounds(value);
  };

  // Function to reset the MapComponent
  const handleResetMapComponent = () => {
    // Update the reset counter to trigger a reset in MapComponent
    setResetCounter(resetCounter + 1);
  };

  // Function to update isModalOpen state. This is for the score modal
  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    startNewRound(); // Start a new round after submitting the score modal
  };
  const modalCanceled = () => {
    setIsModalOpen(false);
  };
  const guessScoreInside = guessScore;
  const guessTextInside = guessText;
  console.log(`Score: ${score}, distance: ${distance}`);

  return (
    <>
      {numRounds === 1 && <RoundForm onFinish={onRoundFormFinish} />}

      {/* Display the random landmark data */}
      {randomLandmark && (
        <div>
          <Row>
            <Col span={4}>
              <Typography>Name: {randomLandmark.name}</Typography>
            </Col>
            <Col span={4}>Round: {currentRound}</Col>
            <Col span={4}>Score: {score}</Col>
            <Col span={4}>
              Avg distance: {Math.round(distance / currentRound)}KM
            </Col>
            <Col span={4}>
              <Button onClick={resetGame}>Reset</Button>
            </Col>
          </Row>
        </div>
      )}
      <Modal
        style={{ textAlign: "center" }}
        open={isModalOpen}
        onCancel={modalCanceled}
        onOk={closeModal}
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
        <MapComponent
          openModalFunc={openModal}
          nextRound={startNewRound}
          onReset={handleResetMapComponent}
          key={resetCounter}
        />
      </div>
      {/* <Button onClick={getRandomLandmark}>Test</Button> */}
    </>
  );
}

export default Home;
