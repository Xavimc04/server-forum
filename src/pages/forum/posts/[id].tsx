import { useRouter } from 'next/router'; 
import router, { NextSteamAuthApiRequest } from "@/lib/router";
import { NextApiResponse } from 'next';
import { SteamProfile } from '@/lib/passport';
import Spinner from '@/pages/components/Spinner';
import { AuthContext } from '@/providers/Auth.context';
import { useEffect, useReducer, useState } from 'react';
import { motion } from 'framer-motion'
import Layout from '@/pages/layout';
import { getUser } from '@/services/userService';
import { getSinglePost } from '@/services/forumService'; 
import { AnimatePresence } from 'framer-motion';
import instance from '@/lib/instance';
import CommentModal from '@/pages/components/forum/CommentModal';
import moment from 'moment';
import 'moment/locale/es';

const initialState = {
    player: null, 
    comment: '', 
    commenting: false
};

function reducer(state: typeof initialState, action: { type: string, payload: any }) {
    const { type, payload } = action; 

    if(type === 'SET_PLAYER') {
        return {
            ...state, 
            player: payload
        }
    }

    if(type === 'SET_COMMENT') {
        return {
            ...state, 
            comment: payload
        }
    }

    if(type === 'SET_COMMENTING') {
        return {
            ...state, 
            commenting: payload
        }
    }
    
    return state; 
} 

export default function Index({ user }:{ user: SteamProfile }) {
    const router = useRouter(); 
    const [state, dispatch] = useReducer(reducer, initialState); 
    const [playerLoaded, handlePlayerLoaded] = useState<boolean>(false);
    const [postContent, setPostContent] = useState<any>();  
    const [error, handleError] = useState<string>(); 
    const [displayImage, handleDisplayImage] = useState<boolean>(false); 

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
            
            if(!router.query.id) {
                return; 
            }

            fetchPost();
            handlePlayerLoaded(true); 
        }

        fetchData();
    }, [])

    const fetchPost = async () => {
        const post = await getSinglePost(`${ router.query.id }`); 

        if(post.done) {
            setPostContent(post.post); 
        } else handleError(post.message); 
    }
 
    const togglePin = () => {
        instance.post('/api/forum/postActions', {
            postAction: 'TOGGLE_PIN', 
            postId: postContent?.id, 
            newState: !postContent?.pinned
        }).then(response => {
            if(response.data.done) {
                fetchPost();
            }
        }).catch(error => {
            console.log("Ha aparecido un error: " + error); 
        })
    }

    const toggleLike = () => {
        instance.post('/api/forum/postActions', {
            postAction: 'LIKE', 
            postId: postContent?.id
        }).then(response => {
            if(response.data.done) {
                fetchPost();
            }
        }).catch(error => {
            console.log("Ha aparecido un error: " + error); 
        })
    }

    const postComment = () => {
        if(state.comment.length == 0) return; 

        instance.post('/api/forum/postActions', {
            postAction: 'COMMENT', 
            postId: postContent?.id, 
            newState: state.comment
        }).then(response => {
            if(response.data.done) {
                fetchPost();

                dispatch({
                    type: "SET_COMMENTING", 
                    payload: false
                })

                dispatch({
                    type: "SET_COMMENT", 
                    payload: ""
                })
            }
        }).catch(error => {
            console.log("Ha aparecido un error: " + error); 
        })
    }

    return <>
        {
            playerLoaded ? <AuthContext.Provider value={{ user, state, dispatch }}>
                <Layout>
                    <main className="flex flex-wrap mt-10 mb-10 bg-slate-950 h-auto">  
                        {
                            error || !postContent ? <>
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
                            </> : <div className='flex items-center justify-center w-full'>
                                <div className='w-[90%] xl:w-1/2 mt-10'>
                                    <div className='flex items-center justify-end flex-wrap gap-5'>
                                        <div className='flex-1'>
                                            <span className='material-symbols-outlined cursor-pointer select-none' title='Volver' onClick={() => router.push('/forum')}>arrow_back</span>
                                        </div>   

                                        {
                                            state.player && state.player.rank > 0 && <button onClick={() => togglePin() } className="px-5 border border-red-500 py-3 rounded-full flex items-center text-red-500 hover:bg-red-500 hover:shadow hover:shadow-red-500 hover:text-slate-950 transition-all">
                                                <span className="material-symbols-outlined mr-3">star</span>

                                                { postContent.pinned ? 'Desfijar' : 'Fijar' }
                                            </button>
                                        }

                                        {
                                            state.player && <button onClick={() => toggleLike() } className="border border-yellow-500 p-3 rounded-full flex items-center text-yellow-500 hover:bg-yellow-500 hover:shadow hover:shadow-yellow-500 hover:text-slate-950 transition-all">
                                                <span className="material-symbols-outlined">thumb_up</span>

                                                {
                                                    state.player && state.player.forum_likes.map((like: any) => {
                                                        if(like.post_id == postContent.id) {
                                                            return <span key={ like.postId } className='ml-3'>Te gusta</span>
                                                        }
                                                    })
                                                } 
                                            </button>
                                        } 

                                        {
                                            state.player && <button onClick={() => {
                                                dispatch({
                                                    type: "SET_COMMENTING", 
                                                    payload: true
                                                })
                                            }} className="px-5 border border-green-500 py-3 rounded-full flex items-center text-green-500 hover:bg-green-500 hover:shadow hover:shadow-green-500 hover:text-slate-950 transition-all">
                                                <span className="material-symbols-outlined mr-3">forum</span>
    
                                                Comentar
                                            </button>
                                        } 
                                    </div>
                                    
                                    <h2 className='font-extrabold text-4xl poppins mt-10 flex items-center'>
                                        <LoadProfile steamId={ postContent.steam } />

                                        { postContent.title }
                                    </h2>

                                    <p 
                                        className='mt-10 max-w-full text-gray-400'
                                        dangerouslySetInnerHTML={{__html: postContent.content }} 
                                    />

                                    {
                                        postContent.banner && <div className='mt-7 mb-10'>
                                            <button 
                                                onClick={() => handleDisplayImage(true)}
                                                className='bg-violet-500 text-slate-950 px-10 py-3 rounded flex items-center'
                                            >
                                                <span className='material-symbols-outlined mr-3'>attach_file</span>

                                                Imagen adjunta
                                            </button>
                                        </div>
                                    }

                                    {
                                        postContent.forum_comments.map((singleComment:any) => {
                                            return <div key={ singleComment.id } className='mt-5 w-full border-t border-slate-900 pt-5'>
                                                <div className='flex items-start'>
                                                    <LoadProfile steamId={ singleComment.users.steamId } />

                                                    <span className='flex-1 text-violet-500'>
                                                        { singleComment.users.firstname + ' ' + singleComment.users.lastname }, <span className=' text-gray-400'>{ moment(singleComment.createdAt).format('LLLL') }</span>

                                                        <p className='mt-3 text-white'>
                                                            { singleComment.content }
                                                        </p> 
                                                    </span>
                                                </div> 
                                            </div>
                                        })
                                    }
                                </div>
                            </div>
                        }
                    </main>  
                    
                    <CommentModal postComment={ postComment } />
                </Layout>

                <AnimatePresence>
                    {
                        postContent && postContent.banner && displayImage && <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}    
                            className='fixed flex items-center justify-center' 
                            style={{
                                zIndex: 5, 
                                backgroundColor: 'rgba(0,0,0,.5)', 
                                backdropFilter: 'blur(3px)', 
                                height: '100vh',
                                width: '100%',
                                top: 0
                            }}
                            onClick={() => handleDisplayImage(false)}
                        >
                            <img className='max-w-[70%] max-h-[70%]' src={ `/images/${ postContent.banner }` } alt='Imagen adjunta' />
                        </motion.div>
                    }
                </AnimatePresence> 
            </AuthContext.Provider> : <Spinner />
        }
    </>   
}

function LoadProfile({ steamId } : { steamId: string }) {
    const [profile, handleProfile] = useState<any>(null); 
    const [loadingProfile, handleLoading] = useState<boolean>(false); 

    useEffect(() => {
        const getWriterSteam = async () => {
            handleLoading(true);
        
            try {
                const response = await instance.get(`/api/steam?steamId=${steamId}`);
        
                if (response.data.response.players) {
                    if (response.data.response.players[0]) {
                        handleProfile(response.data.response.players[0]);
                    }
                }
            } catch (error) {
                return;
            }
        
            handleLoading(false);
        };
    
        getWriterSteam();
    }, [steamId]);

    return <div className="flex">
        {
            !loadingProfile ? (
                <img title={ profile && profile.personaname ? profile.personaname : 'Sin nombre' } src={ profile ? profile.avatarfull : 'https://i.pinimg.com/564x/fb/67/54/fb67540ea400b2b9da96a7038af092e4.jpg' } className="h-11 w-11 rounded-full mr-7" />
            ) : <svg aria-hidden="true" className="w-8 h-8 mr-8 text-gray-200 animate-spin dark:text-gray-600 fill-violet-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
        }
    </div>
}

export async function getServerSideProps({ req, res }:{ req: NextSteamAuthApiRequest, res: NextApiResponse }) {
    await router.run(req, res);

    return { props: { user: req.user || null } };
}