import Layout from "../layout";
import router from "@/lib/router";
import { NextApiResponse } from "next";
import { SteamProfile } from "@/lib/passport";
import type { NextSteamAuthApiRequest } from "@/lib/router";
import { AuthContext } from '@/providers/Auth.context';  
import { useEffect, useState } from "react";
import { getUser } from "@/services/userService";
import Spinner from "../components/Spinner"; 
import { useReducer } from "react"; 
import ElementModal from "../components/shop/ElementModal";
import instance from "@/lib/instance";
import { forum_store_items } from "@prisma/client";
  
const initialState = {
    player: null, 
    creating: true, 
    elements: []
};

function reducer(state: typeof initialState, action: { type: string, payload: any }) {
    const { type, payload } = action; 

    if(type === 'SET_PLAYER') {
        return {
            ...state, 
            player: payload
        }
    } 

    if(type === 'SET_CREATING') {
        return {
            ...state, 
            creating: payload
        }
    } 

    if(type === 'SET_STORE_ELEMENTS') {
        return {
            ...state, 
            elements: payload
        }
    } 
    
    return state; 
} 

export default function Index({ user }:{ user: SteamProfile }) {    
    const [state, dispatch] = useReducer(reducer, initialState); 
    const [playerLoaded, handlePlayerLoaded] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            if(user) {
                const response = await getUser(user._json.steamid); 

                if(response.user) {
                    dispatch({
                        type: "SET_PLAYER", 
                        payload: response.user
                    })
                }

                const storeResponse = await instance.get('/api/shop/manage'); 

                if(storeResponse.data.done) {
                    dispatch({
                        type: "SET_STORE_ELEMENTS", 
                        payload: storeResponse.data.storeElements
                    })
                }
            } 

            handlePlayerLoaded(true); 
        }

        fetchData();
    }, [])

    return <>
        {
            playerLoaded ? <AuthContext.Provider value={{ user, state, dispatch }}>
                <Layout>
                    <main className="flex flex-wrap my-10 px-5">
                        <div className="flex items-center gap-5 justify-end w-full">
                            {
                                state.player && state.player.rank > 0 && <button onClick={() => {
                                    dispatch({
                                        type: "SET_CREATING", 
                                        payload: true
                                    }); 
                                }} className="px-5 border border-red-500 py-3 rounded-full flex items-center text-red-500 hover:bg-red-500 hover:shadow hover:shadow-red-500 hover:text-slate-950 transition-all">
                                    <span className="material-symbols-outlined mr-3">inbox</span>

                                    Nuevo elemento
                                </button>
                            }
                        </div>

                        <div className="flex flex-wrap gap-5">
                            {
                                state.elements.map((element: forum_store_items) => {
                                    return <div key={ element.id }>
                                        { element.name }
                                    </div>
                                })
                            }
                        </div>
                    </main> 

                    <ElementModal />
                </Layout>
            </AuthContext.Provider> : <Spinner />
        }
    </>
}

export async function getServerSideProps({ req, res }:{ req: NextSteamAuthApiRequest, res: NextApiResponse }) {
    await router.run(req, res);

    return { props: { user: req.user || null } };
}