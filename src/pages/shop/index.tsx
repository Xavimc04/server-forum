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
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
  
const initialState = {
    player: null, 
    creating: false, 
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

                        <div className="flex flex-wrap gap-5 w-full mt-10 justify-center">
                            {
                                state.elements.map((element: forum_store_items) => {
                                    return <div className="bg-slate-900 rounded flex-1 min-w-[400px] max-w-[400px] flex flex-col items-center justify-start select-none" key={ element.id }>
                                        <h2 className="poppins mt-5 w-full flex items-center px-5 text-indigo-500 uppercase text-xl">
                                            { element.name }

                                            <div className="bg-gray-500 mx-5 h-[2px] flex-1"></div>

                                            <span className="text-3xl text-white pr-2">{ element.price ? element.price.toLocaleString() : 0 }</span>€
                                        </h2>


                                        <p className="px-5 mt-5 text-gray-400 flex-1">
                                            { element.description }
                                        </p>

                                        {
                                            element.image && <img className="my-16 max-w-full max-h-[150px]" src={ `/images/${ element.image }` } />
                                        }

                                        <div className="w-full px-5">
                                            <button className="bg-indigo-500 w-full hover:bg-indigo-700 transition-all rounded p-2.5 mb-5 poppins">Comprar</button>
                                        </div>
                                    </div>
                                })
                            }
                        </div>

                        <PayPalScriptProvider
                            options={{
                                clientId: "ASY_slC7eqDcO725bpdZeoyGkY5XKNyIY0rX8mCeP57hPgx7YuyLGkZYgzaXe3STm9W-PysXEBS3zoK6"
                            }}
                        >
                            <PayPalButtons
                                createOrder={ async () => {
                                    try { 
                                        const response:any = await instance.post('/api/paypal/order', {
                                            price: 2, 
                                            storeItem: 2
                                        }); 

                                        if (response.data && response.data.id) {
                                            return response.data.id;
                                        } else {
                                            throw new Error("Order ID not found in response");
                                        } 
                                    } catch (error) { 
                                        throw new Error("Error creating PayPal order");
                                    } 
                                }} 

                                onApprove={async (data, actions:any) => {  
                                    return actions.order.capture().then(function(details:any) {
                                        console.log("Confirmar el pago")
                                        // instance.post(`${API_ROUTE}/payments/paypal/confirm`, {
                                        //     id: details.id, 
                                        //     steam: auth
                                        // }).then(response => {
                                        //     if(!response.data.done) return console.log(response.data.message); 

                                        //     getUserCoins(); 
                                        //     handleBuy(0); 
                                        // }).catch(error => console.log(error));  
                                    });
                                }}

                                style={{ 
                                    layout: "horizontal", 
                                    color: 'black', 
                                    tagline: false,
                                }} 
                            />
                        </PayPalScriptProvider>
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