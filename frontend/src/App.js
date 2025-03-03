import React, { useEffect, useState } from 'react';
import Game from './containers/game';
// import { observer } from 'mobx-react-lite';
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import Memorial from './containers/memorial';

function App() {
  return (
    <>
    <BrowserRouter>
      {/* <Header /> */}
      <Routes>
        <Route path="/">
          <Route index element={<Game type='index'/>} />
          <Route path="/memorial" element={<Memorial key={window.location.pathname} />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App;