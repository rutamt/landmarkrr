import { Typography, Statistic, Button } from "antd";
import { useState, useEffect } from "react";
import CountUp from "react-countup";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { Icon } from "leaflet";

import "../styles/EndStyles.css";
function End({ restartFunc }) {
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
  const [guessLatLons, setGuessLatLons] = useState(
    localStorage.getItem("guessLatLons")
      ? JSON.parse(localStorage.getItem("guessLatLons"))
      : []
  );
  const [actualLatLons, setActualLatLons] = useState(
    localStorage.getItem("actualLatLons")
      ? JSON.parse(localStorage.getItem("actualLatLons"))
      : []
  );

  useEffect(() => {
    // This code will run when the component is mounted

    // Initialize currentRound
    const currentRoundFromStorage = localStorage.getItem("currentRound");
    setCurrentRound(
      currentRoundFromStorage ? parseInt(currentRoundFromStorage) : 1
    );

    // Initialize numRounds
    const numRoundsFromStorage = localStorage.getItem("numRounds");
    setNumRounds(numRoundsFromStorage ? parseInt(numRoundsFromStorage) : 1);

    // Initialize distance
    const distanceFromStorage = localStorage.getItem("distance");
    setDistance(distanceFromStorage ? parseInt(distanceFromStorage) : 0);

    // Initialize score
    const scoreFromStorage = localStorage.getItem("score");
    setScore(scoreFromStorage ? parseInt(scoreFromStorage) : 0);

    // Initialize guessLatLons
    const guessLatLonsFromStorage = localStorage.getItem("guessLatLons");
    setGuessLatLons(
      guessLatLonsFromStorage ? JSON.parse(guessLatLonsFromStorage) : []
    );

    // Initialize actualLatLons
    const actualLatLonsFromStorage = localStorage.getItem("actualLatLons");
    setActualLatLons(
      actualLatLonsFromStorage ? JSON.parse(actualLatLonsFromStorage) : []
    );
  }, []); // The empty dependency array ensures this code runs only once when the component is mounted

  //   Antd
  const formatter = (value) => <CountUp end={value} separator="," />;
  const { Title } = Typography;

  // Leaflet icons
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

  // Function to create markers and polylines
  const renderMarkersAndPolylines = () => {
    const markersAndPolylines = [];

    // Loop through guessLatLons and actualLatLons
    for (let i = 0; i < guessLatLons.length; i++) {
      const guessCoordinates = guessLatLons[i];
      const actualCoordinates = actualLatLons[i];

      // Create markers
      const guessMarker = (
        <Marker
          position={guessCoordinates}
          icon={blueIcon}
          key={`guess-${i}`}
        />
      );
      const actualMarker = (
        <Marker
          position={actualCoordinates}
          icon={greenIcon}
          key={`actual-${i}`}
        />
      );

      // Create polylines
      const polyline = (
        <Polyline
          positions={[guessCoordinates, actualCoordinates]}
          color="green"
          key={`polyline-${i}`}
        />
      );

      markersAndPolylines.push(guessMarker, actualMarker, polyline);
    }

    return markersAndPolylines;
  };

  // Styles
  const mapDivStyles = {
    width: "60vw", // Set the width to 60% of the viewport width
    height: "60vh", // Set the height to 60% of the viewport height
    margin: "0 auto", // Center horizontally by setting left and right margins to auto
    display: "flex", // Center vertically using flexbox
    justifyContent: "center", // Center content horizontally
    borderRadius: "5px",
    overflow: "hidden",
  };
  const leafletStyles = {
    height: "100%",
    width: "100%",
  };

  const averageDistance = distance / currentRound;

  //   Quip to say to players depending on how they do
  let quip = "";

  // Determine which quip to display based on the averageDistance
  if (averageDistance === 0) {
    quip =
      "Are you cheating? I don't know because I've never actually gotten that accurate!";
  } else if (averageDistance < 5) {
    quip = "Perfect job! Have you done this before?";
  } else if (averageDistance < 20) {
    quip = "So tantalizingly close to perfection. Keep going, you can make it!";
  } else if (averageDistance < 50) {
    quip = "You're really nailing it! Keep up the fantastic work!";
  } else if (averageDistance < 100) {
    quip = "Impressive accuracy! You're on the right track.";
  } else if (averageDistance < 150) {
    quip = "Getting closer with each guess, you're improving!";
  } else if (averageDistance < 200) {
    quip = "Not bad, but there's room for improvement. Keep practicing!";
  } else if (averageDistance < 250) {
    quip = "You're making progress, but there's more to learn.";
  } else if (averageDistance < 300) {
    quip = "You're getting there! Keep exploring and guessing.";
  } else if (averageDistance < 350) {
    quip = "Not bad, but you can aim for greater precision.";
  } else if (averageDistance < 400) {
    quip = "Keep refining your skills, you're making good progress!";
  } else if (averageDistance < 500) {
    quip = "You're on the right path, keep it up!";
  } else if (averageDistance < 750) {
    quip = "Your guesswork is improving steadily.";
  } else if (averageDistance < 1000) {
    quip = "You're getting closer with each round. Keep exploring!";
  } else if (averageDistance < 1200) {
    quip = "You're making progress, but there's room for improvement.";
  } else {
    quip = "You need to study your landmarks!";
  }
  return (
    <div style={{ textAlign: "center" }}>
      <Title level={1}>Score:</Title>
      <Title level={2}>
        <Statistic value={score} formatter={formatter} />
      </Title>
      <div className="map-div" style={mapDivStyles}>
        <MapContainer
          center={[35, 20]}
          zoom={2}
          maxBoundsViscosity={1.0}
          minZoom={3}
          style={leafletStyles}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {renderMarkersAndPolylines()}
        </MapContainer>
      </div>
      <Title level={2}>
        {" "}
        Avg distance: {Math.round(averageDistance)}KM (
        {Math.round(averageDistance / 1.609)}MI)
      </Title>
      <Title level={3}>{quip}</Title>
      <Title level={4}>
        In a {numRounds} round game, you scored {Math.round(score / numRounds)}{" "}
        points per round.
      </Title>
      <Button onClick={restartFunc}>Play again?</Button>
    </div>
  );
}

export default End;
