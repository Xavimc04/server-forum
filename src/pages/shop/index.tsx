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
  
const initialState = {
    player: null
};

function reducer(state: typeof initialState, action: { type: string, payload: any }) {
    const { type, payload } = action; 

    if(type === 'SET_PLAYER') {
        return {
            ...state, 
            player: payload
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
                                state.player && state.player.rank > 0 && <button className="px-5 border border-red-500 py-3 rounded-full flex items-center text-red-500 hover:bg-red-500 hover:shadow hover:shadow-red-500 hover:text-slate-950 transition-all">
                                    <span className="material-symbols-outlined mr-3">inbox</span>

                                    Nuevo elemento
                                </button>
                            }
                        </div>
                    </main> 
                </Layout>
            </AuthContext.Provider> : <Spinner />
        }
    </>
}

export async function getServerSideProps({ req, res }:{ req: NextSteamAuthApiRequest, res: NextApiResponse }) {
    await router.run(req, res);

    return { props: { user: req.user || null } };
}