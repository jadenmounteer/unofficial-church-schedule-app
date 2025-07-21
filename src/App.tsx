import React, { useState, useEffect } from "react";
import "./App.css";
import ChurchScene from "./ChurchScene";

function App(): React.JSX.Element {
  const [sceneClicked, setSceneClicked] = useState<boolean>(false);

  // Set document title on load to prevent any loading text
  useEffect(() => {
    document.title = "The Unofficial Sunday Schedule App";
  }, []);

  const handleSceneClick = (): void => {
    setSceneClicked((prev) => !prev);
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="church-title">The Unofficial Sunday Schedule App</h1>
        </div>
      </header>

      {/* 3D Scene - Full Page */}
      <section className="hero-section">
        <div className="scene-container">
          <ChurchScene
            onSceneClick={handleSceneClick}
            isClicked={sceneClicked}
          />
        </div>
      </section>
    </div>
  );
}

export default App;
