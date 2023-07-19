import { useRouter } from 'next/router'; 
import router, { NextSteamAuthApiRequest } from "@/lib/router";
import { NextApiResponse } from 'next';
import { SteamProfile } from '@/lib/passport';
import Spinner from '@/pages/components/Spinner';
import { AuthContext } from '@/providers/Auth.context';
import { useEffect, useReducer, useState } from 'react';
import Layout from '@/pages/layout';
import { getUser } from '@/services/userService';
import { getSinglePost } from '@/services/forumService';
import { Post } from '@prisma/client';

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
    const router = useRouter(); 
    const [state, dispatch] = useReducer(reducer, initialState); 
    const [playerLoaded, handlePlayerLoaded] = useState<boolean>(false);
    const [postContent, setPostContent] = useState<Post>(); 
    const [error, handleError] = useState<string>(); 

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

                if(!router.query.id) {
                    return; 
                }

                const post = await getSinglePost(`${ router.query.id }`); 

                if(post.done) {
                    setPostContent(post.post); 
                } else handleError(post.message); 
            }

            handlePlayerLoaded(true); 
        }

        fetchData();
    }, [])

    return <>
        {
            playerLoaded ? <AuthContext.Provider value={{ user }}>
                <Layout>
                    <main className="flex flex-wrap mt-10 mb-10">  
                        {
                            error ? <>
                                <div className='w-full mx-10 mt-10 bg-slate-900 rounded text-center py-4' style={{
                                    zIndex: '2'
                                }}>
                                    { error }
                                </div>

                                <img className='absolute' style={{
                                    left: '50%', 
                                    bottom: '0', 
                                    transform: 'translate(-50%)', 
                                    zIndex: '0'
                                }} src='https://www.pngkey.com/png/full/189-1899415_bauer-gta-v-character-png.png' />
                            </> : <p>Post: { router.query.id }</p>
                        }
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