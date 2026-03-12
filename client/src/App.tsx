import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { RoomProvider } from './contexts/RoomContext';
import { PartyProvider } from './contexts/PartyContext';
import { Landing } from './pages/Landing';
import { ProfileSetup } from './pages/ProfileSetup';
import { Lobby } from './pages/Lobby';
import { Party } from './pages/Party';
import { Wrapped } from './pages/Wrapped';

export function App() {
  return (
    <SocketProvider>
      <RoomProvider>
        <PartyProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/setup/:code" element={<ProfileSetup />} />
              <Route path="/lobby/:code" element={<Lobby />} />
              <Route path="/party/:code" element={<Party />} />
              <Route path="/wrapped/:code" element={<Wrapped />} />
            </Routes>
          </BrowserRouter>
        </PartyProvider>
      </RoomProvider>
    </SocketProvider>
  );
}
