import Layout from "../layout";
import router from "@/lib/router";
import { NextApiResponse } from "next";
import { SteamProfile } from "@/lib/passport";
import type { NextSteamAuthApiRequest } from "@/lib/router";
import { AuthContext } from '@/providers/Auth.context';  
import { useEffect, useState } from "react";
import { getUser } from "@/services/userService";
import Spinner from "../components/Spinner";
import { getCategories } from "@/services/forumService";
import { useReducer } from "react";
import Categories from "../components/forum/Categories";
import RenderPosts from "../components/forum/RenderPosts";
import CategoryModal from "../components/forum/CategoryModal";
import DeletingModal from "../components/forum/DeletingModal";
import PostModal from "../components/forum/PostModal";
  
const initialState = {
    player: null,
    categories: null,
    creatingCategory: false,
    deleting: false,
    creatingPost: false,
    categoryRoute: []
};

function reducer(state: typeof initialState, action: { type: string, payload: any }) {
    const { type, payload } = action; 

    if(type === 'SET_PLAYER') {
        return {
            ...state, 
            player: payload
        }
    }

    if(type === 'SET_CATEGORIES') {
        return {
            ...state, 
            categories: payload
        }
    }

    if(type === 'SET_CREATING_CATEGORY') {
        return {
            ...state, 
            creatingCategory: payload
        }
    }

    if(type === 'SET_DELETING') {
        return {
            ...state, 
            deleting: payload
        }
    }

    if(type === 'SET_CREATING_POST') {
        return {
            ...state, 
            creatingPost: payload
        }
    }

    if(type === 'SET_CATEGORY_ROUTE') {
        return {
            ...state, 
            categoryRoute: payload
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

            const categoriesRequest = await getCategories(); 

            if(categoriesRequest) {
                dispatch({
                    type: "SET_CATEGORIES", 
                    payload: categoriesRequest
                })
            }

            handlePlayerLoaded(true); 
        }

        fetchData();
    }, [])

    return <>
        {
            playerLoaded ? <AuthContext.Provider value={{ user, state, dispatch }}>
                <Layout>
                    <main className="flex flex-wrap mt-10 mb-10">
                        <div className="w-full mb-10 mx-5 flex items-center justify-end gap-7">
                            {
                                state.player && state.player.rank != 0 && <button disabled={ state.deleting != null || state.creatingPost ? true : false } onClick={() => dispatch({
                                    type: "SET_CREATING_CATEGORY", 
                                    payload: true
                                }) } className="px-5 border border-green-500 py-3 rounded-full flex items-center text-green-500 hover:bg-green-500 hover:shadow hover:shadow-green-500 hover:text-slate-950 transition-all">
                                    <span className="material-symbols-outlined mr-3">category</span>

                                    Nueva categoría
                                </button>
                            }

                            {
                                user && <button disabled={ state.deleting != null || state.creatingCategory ? true : false } onClick={() => dispatch({
                                    type: "SET_CREATING_POST", 
                                    payload: true
                                })} className="px-5 border border-violet-500 py-3 rounded-full flex items-center text-violet-500 hover:bg-violet-500 hover:shadow hover:shadow-violet-500 hover:text-slate-950 transition-all">
                                    <span className="material-symbols-outlined mr-3">add_task</span>

                                    Nuevo post
                                </button>
                            }
                        </div>

                        <Categories />

                        <div className="flex-1 rounded-lg mr-5">
                            <RenderPosts />
                        </div>
                    </main>
                            
                    <CategoryModal isVisible={ state.creatingCategory } />
                    <DeletingModal />
                    <PostModal />

                </Layout>
            </AuthContext.Provider> : <Spinner />
        }
    </>
}

export async function getServerSideProps({ req, res }:{ req: NextSteamAuthApiRequest, res: NextApiResponse }) {
    await router.run(req, res);

    return { props: { user: req.user || null } };
}