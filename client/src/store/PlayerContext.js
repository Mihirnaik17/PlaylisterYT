import { createContext, useContext, useState } from 'react';

const PlayerContext = createContext(null);

export function PlayerContextProvider({ children }) {
    const [session, setSession] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <PlayerContext.Provider value={{ session, setSession, modalOpen, setModalOpen }}>
            {children}
        </PlayerContext.Provider>
    );
}

const noopCtx = { session: null, setSession: () => {}, modalOpen: false, setModalOpen: () => {} };

export function usePlayerContext() {
    return useContext(PlayerContext) ?? noopCtx;
}
