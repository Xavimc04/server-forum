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
        <div className="w-full flex flex-col gap-5">
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
                        <span className="text-gray-600 px-10 text-lg">
                            # { post.id }
                        </span>

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