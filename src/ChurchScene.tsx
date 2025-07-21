import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import { Group } from "three";
import {
  getSundaySchedule,
  getSundayType,
  getCommonStartTimes,
  SundaySchedule,
  StartTime,
} from "./scheduleService";

interface ChurchLandscapeProps {
  isClicked: boolean;
}

interface InlineTimeSelectorProps {
  selectedTime: StartTime;
  onTimeChange: (time: StartTime) => void;
}

interface ChurchSceneProps {
  onSceneClick: () => void;
  isClicked: boolean;
}

// Component to load and display the church landscape
function ChurchLandscape({
  isClicked,
}: ChurchLandscapeProps): React.JSX.Element {
  const { scene } = useGLTF("/assets/landscape.glb");
  const meshRef = useRef<Group>(null);

  // Gentle rotation animation - continues even when overlay is expanded
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <primitive ref={meshRef} object={scene} scale={1.2} position={[0, -1, 0]} />
  );
}

// Inline Time Selector Component
function InlineTimeSelector({
  selectedTime,
  onTimeChange,
}: InlineTimeSelectorProps): React.JSX.Element {
  const startTimes = getCommonStartTimes();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onTimeChange(event.target.value as StartTime);
  };

  const handleClick = (event: React.MouseEvent<HTMLSelectElement>) => {
    event.stopPropagation(); // Prevent triggering the overlay click
  };

  return (
    <div className="inline-time-selector">
      <span className="time-label-inline">Starting at </span>
      <select
        value={selectedTime}
        onChange={handleChange}
        className="inline-time-dropdown"
        onClick={handleClick}
      >
        {startTimes.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </select>
    </div>
  );
}

// Main 3D Scene Component
function ChurchScene({
  onSceneClick,
  isClicked,
}: ChurchSceneProps): React.JSX.Element {
  const [scheduleData, setScheduleData] = useState<SundaySchedule | null>(null);
  const [selectedStartTime, setSelectedStartTime] =
    useState<StartTime>("9:00 AM");

  // Load saved start time from localStorage on mount
  useEffect(() => {
    const savedStartTime = localStorage.getItem("churchStartTime");
    if (
      savedStartTime &&
      getCommonStartTimes().includes(savedStartTime as StartTime)
    ) {
      setSelectedStartTime(savedStartTime as StartTime);
    }
  }, []);

  // Update schedule when start time changes
  useEffect(() => {
    const schedule = getSundaySchedule(null, selectedStartTime);
    setScheduleData(schedule);
  }, [selectedStartTime]);

  // Save start time to localStorage when it changes
  const handleTimeChange = (newTime: StartTime): void => {
    setSelectedStartTime(newTime);
    localStorage.setItem("churchStartTime", newTime);
  };

  const handleOverlayClick = (): void => {
    if (!isClicked) {
      onSceneClick();
    }
  };

  const handleCloseClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.stopPropagation();
    onSceneClick();
  };

  if (!scheduleData) {
    return <div>Loading schedule...</div>;
  }

  return (
    <div className="church-scene-container">
      <Canvas
        camera={{ position: [0, 3, 12], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        className="church-canvas"
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Environment for realistic reflections */}
        <Environment preset="sunset" />

        {/* Camera Controls - continues auto-rotating even when overlay is expanded */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={6}
          maxDistance={25}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2.2}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />

        {/* The 3D Scene */}
        <Suspense fallback={null}>
          <ChurchLandscape isClicked={isClicked} />
        </Suspense>
      </Canvas>

      {/* Scene Overlay */}
      <div
        className={`scene-overlay-3d ${isClicked ? "expanded" : ""}`}
        onClick={handleOverlayClick}
        style={{ cursor: !isClicked ? "pointer" : "default" }}
      >
        {!isClicked ? (
          // Default state - invitation to click
          <>
            <h2 className="welcome-text">This Week's Schedule</h2>
            <p className="welcome-subtitle">
              Click here to view the full schedule
            </p>
            <div className="schedule-preview">
              <p className="sunday-type">{getSundayType()}</p>
              <p className="sunday-date">{scheduleData.date}</p>
              <InlineTimeSelector
                selectedTime={selectedStartTime}
                onTimeChange={handleTimeChange}
              />
            </div>
          </>
        ) : (
          // Clicked state - show full schedule
          <>
            <h2 className="welcome-text">This Week's Schedule</h2>
            <div className="schedule-details">
              <div className="schedule-header">
                <p className="sunday-date">{scheduleData.date}</p>
                <p className="sunday-type">{getSundayType()}</p>
                <div className="schedule-duration-container">
                  <span>Total Duration: {scheduleData.totalDuration} | </span>
                  <InlineTimeSelector
                    selectedTime={selectedStartTime}
                    onTimeChange={handleTimeChange}
                  />
                </div>
              </div>

              <div className="schedule-list">
                {scheduleData.schedule.map((item, index) => (
                  <div key={index} className="schedule-item">
                    <div className="schedule-time">{item.time}</div>
                    <div className="schedule-content">
                      <h4 className="schedule-activity">{item.activity}</h4>
                      <p className="schedule-description">{item.description}</p>
                      {item.ageGroup && (
                        <span className="age-group">{item.ageGroup}</span>
                      )}
                      {item.note && (
                        <p className="schedule-note">{item.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button className="close-schedule" onClick={handleCloseClick}>
                ← Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Preload the GLB file for better performance
useGLTF.preload("/assets/landscape.glb");

export default ChurchScene;
