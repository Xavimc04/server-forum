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

export default function Index({ user }:{ user: SteamProfile }) { 
    const [player, handlePlayer] = useState<users>();
    const [playerLoaded, handlePlayerLoaded] = useState<boolean>(false);

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
                    <main className="flex justify-center mt-20">  
                        <Categories />

                        <div className="bg-slate-900 w-[900px] rounded-lg"></div>
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