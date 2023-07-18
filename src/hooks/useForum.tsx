import { createContext, useContext, useReducer } from 'react';

export const ForumStateContext = createContext<any>(null);
export const ForumDispatchContext = createContext<any>(null);

const initialState = {
    player: null,
    categories: null,
    creatingCategory: false,
    deleting: null,
    creatingPost: false,
};

function reducer(state: typeof initialState, action: { type: string; payload: any }) {
    const { type, payload } = action;

    switch (type) {
        case 'SET_PLAYER':
        return {
            ...state,
            player: payload,
        };
        case 'SET_CATEGORIES':
        return {
            ...state,
            categories: payload,
        };
        case 'SET_CREATING_CATEGORY':
        return {
            ...state,
            creatingCategory: payload,
        };
        case 'SET_DELETING':
        return {
            ...state,
            deleting: payload,
        };
        case 'SET_CREATING_POST':
        return {
            ...state,
            creatingPost: payload,
        };
        default:
        return state;
    }
}

export function ForumProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);
  
    return (
        <ForumStateContext.Provider value={state}>
            <ForumDispatchContext.Provider value={dispatch}>
                { children }
            </ForumDispatchContext.Provider>
        </ForumStateContext.Provider>
    );
}

export function useForumState() {
    const context = useContext(ForumStateContext);
  
    if (context === undefined) {
        throw new Error('useForumState must be used within a ForumProvider');
    }

    return context;
}

export function useForumDispatch() {
    const context = useContext(ForumDispatchContext);

    if (context === undefined) {
        throw new Error('useForumDispatch must be used within a ForumProvider');
    }

    return context;
}
