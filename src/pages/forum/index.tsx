import Layout from "../layout";
import router from "@/lib/router";
import { NextApiResponse } from "next";
import { SteamProfile } from "@/lib/passport";
import type { NextSteamAuthApiRequest } from "@/lib/router";
import { AuthContext } from '@/providers/Auth.context';  
import { useEffect, useState } from "react";
import { users } from "@prisma/client";
import { getUser } from "@/services/userService";
import Spinner from "../components/Spinner";
import Categories from "../components/forum/Categories";
import CategoryModal from "../components/forum/CategoryModal";

export default function Index({ user }:{ user: SteamProfile }) { 
    const [player, handlePlayer] = useState<users>();
    const [playerLoaded, handlePlayerLoaded] = useState<boolean>(false);
    const [creatingCategory, setCreatingCategory] = useState<boolean>(false); 

    useEffect(() => {
        const fetchData = async () => {
            const response = await getUser(user._json.steamid); 

            if(response.user) {
                handlePlayer(response.user); 
            }

            handlePlayerLoaded(true); 
        }

        fetchData();
    }, [])

    return <>
        {
            playerLoaded ? <AuthContext.Provider value={{ user, player }}>
                <Layout>
                    <main className="flex flex-wrap mt-20">
                        <div className="w-full mb-10 mx-20 flex items-center justify-end gap-7">
                            {
                                player && player.rank != 0 && <button onClick={() => setCreatingCategory(true)} className="px-5 border border-green-500 py-3 rounded-full flex items-center text-green-500 hover:bg-green-500 hover:shadow hover:shadow-green-500 hover:text-slate-950 transition-all">
                                    <span className="material-symbols-outlined mr-3">category</span>

                                    Nueva categoría
                                </button>
                            }

                            <button className="px-5 border border-violet-500 py-3 rounded-full flex items-center text-violet-500 hover:bg-violet-500 hover:shadow hover:shadow-violet-500 hover:text-slate-950 transition-all">
                                <span className="material-symbols-outlined mr-3">add_task</span>

                                Nuevo post
                            </button>
                        </div>

                        <Categories />

                        <div className="flex-1 rounded-lg mr-20"></div>
                    </main>

                    <CategoryModal isVisible={ creatingCategory } closeModal={ setCreatingCategory } />
                </Layout>
            </AuthContext.Provider> : <Spinner />
        }
    </>
}

export async function getServerSideProps({ req, res }:{ req: NextSteamAuthApiRequest, res: NextApiResponse }) {
    await router.run(req, res);

    return { props: { user: req.user || null } };
}