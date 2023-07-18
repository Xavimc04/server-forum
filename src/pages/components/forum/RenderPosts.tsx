import instance from "@/lib/instance";
import { AuthContext } from "@/providers/Auth.context";
import { getPosts } from "@/services/forumService"; 
import { Post } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useContext } from "react";

const STAKE = 10; 

export default function RenderPosts() {
    const { state } : any = useContext(AuthContext); 
    const [totalCounter, setTotal] = useState<number>(0); 
    const [posts, setPosts] = useState<Post[]>([]);
    const [SKIP_VALUE, setSkipValue] = useState<number>(0); 

    useEffect(() => {
        fetchPosts(state.categoryRoute.length > 0 ? state.categoryRoute[state.categoryRoute.length - 1].id : null, false); 
    }, [SKIP_VALUE]); 

    useEffect(() => {
        if(state.categoryRoute.length > 0) {
            fetchPosts(state.categoryRoute.length > 0 ? state.categoryRoute[state.categoryRoute.length - 1].id : null, true); 
        } else {
            fetchPosts(null, true); 
        }
    }, [state.categoryRoute])

    const fetchPosts = async (CATEGORY?: number | null, renew?: boolean) => {
        const response = await getPosts(STAKE, SKIP_VALUE, `${ CATEGORY }`);  
        
        if(response.done) {
            if(renew) {
                return setPosts(response.posts);
            }

            setPosts([
                ...posts, ...response.posts
            ]); 

            setTotal(response.counter)
        }
    }

    const formatNumber = (number: number) => {
        if (number >= 1e9) {
          return (number / 1e9).toFixed(1) + 'B';
        }

        if (number >= 1e6) {
          return (number / 1e6).toFixed(1) + 'M';
        }

        if (number >= 1e3) {
          return (number / 1e3).toFixed(1) + 'K';
        }

        return number.toString();
    };

    return <AnimatePresence>
        <div className="w-full flex flex-col gap-3">
            <div className="w-full text-end text-gray-400">
                Mostrando { posts.length } de { totalCounter } resultados...
            </div>

            {
                posts && posts[0] && posts.map((post: Post) => {
                    return <motion.div
                        key={Math.floor(Math.random() * 100000)}
                        className="w-full bg-slate-900 rounded flex items-center py-5"
                        initial={{ opacity: 0, y: 50 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -50 }} 
                    >
                        <span className="text-gray-600 px-7 text-lg">
                            # { post.id }
                        </span>

                        <LoadProfile steamId={ post.steam } />

                        <div className="flex flex-col flex-1 ">
                            <h2 className="text-xl">{ post.title && (
                                post.title.slice(0, 30) + (
                                    post.title.length > 30 ? '...' : ''
                                )  
                            ) }</h2>

                            { 
                                state.categories.filter((category: any) => category.id == post.category).map((category:any) => {
                                    return <small key={ Math.floor(Math.random() * 100000) } className="text-gray-600">{ category.name }</small>
                                }) 
                            }
                        </div>

                        <div className="flex items-center gap-5 mr-10">  
                            {
                                post.pinned && <span className="material-symbols-outlined text-4xl text-green-500">stat_2</span>
                            }

                            <span className="text-gray-600">
                                { formatNumber(post.views || 0) } 
                            </span>
                        </div>
                    </motion.div>
                }) 
            }

            {
                (SKIP_VALUE + STAKE) < totalCounter && <button onClick={() => setSkipValue(SKIP_VALUE + STAKE)}>Cargar más...</button>
            }
        </div>
    </AnimatePresence>
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
                <img src={ profile ? profile.avatarfull : 'https://i.pinimg.com/564x/fb/67/54/fb67540ea400b2b9da96a7038af092e4.jpg' } className="h-11 w-11 rounded-full mr-7" />
            ) : <svg aria-hidden="true" className="w-8 h-8 mr-8 text-gray-200 animate-spin dark:text-gray-600 fill-violet-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
        }
    </div>
}