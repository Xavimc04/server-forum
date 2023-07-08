import Navigator from './components/Navigator'
import Layout from './layout'  
import { useRouter } from 'next/router'
import router from "../lib/router";
import { NextApiResponse } from "next";

import { SteamProfile } from "@/lib/passport";
import type { NextSteamAuthApiRequest } from "../lib/router";
import { AuthContext } from '@/providers/Auth.context';
import Footer from './components/Footer';

export default function Home({ user }:{ user: SteamProfile }) { 
    const NextRouter = useRouter(); 

    return <AuthContext.Provider value={{ user }}>
        <Layout>
            <Navigator  /> 
            
            <section className="h-auto lg:h-screen w-screen relative flex flex-col justify-center items-center lg:items-start"> 
                <div className='w-[60%] lg:w-1/4 mt-20 lg:mt-0 lg:ml-20 z-20' style={{
                    textShadow: '0px 0px 10px black'
                }}>
                    <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">Luck <span className="underline underline-offset-3 decoration-8 decoration-blue-400 dark:decoration-violet-600">community</span></h1>
                    <p className="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">Un servidor de FiveM donde podrás crear y vivir tu propia historia junto a miles de personas con scripts únicos, desarrollo constante y una ambientación americana.</p>
                
                    <button onClick={() => NextRouter.push('/api/auth/login')} className='bg-violet-500 hover:bg-violet-700 transition-all poppins rounded mt-10 uppercase py-5 px-10 flex items-center justify-center' style={{
                        boxShadow: '0px 0px 10px #8b5cf6', 
                        whiteSpace: "nowrap"
                    }}>
                        <span className='material-symbols-outlined mr-5'>stadia_controller</span>

                        Jugar ahora
                    </button>
                </div>

                <div className="absolute hidden lg:flex inset-0 items-center justify-center">
                    <div className="w-1/2 h-1/2 transform skew-y-12 z-0 bg-slate-900 rounded-lg"></div>
                </div>

                <img draggable={ false } className="z-0 static lg:absolute h-auto xl:h-screen mt-20 lg:mt-0 right-0" src='https://media-rockstargames-com.akamaized.net/tina-uploads/tina-modules/a19a/c4aaed728a0ede830dca12d8d17ae95262b9c4fa.png' />
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-slate-950 to-transparent h-[200px]"></div>
            </section> 


            <Footer />
        </Layout>
    </AuthContext.Provider>
}

export async function getServerSideProps({ req, res }:{ req: NextSteamAuthApiRequest, res: NextApiResponse }) {
    await router.run(req, res);

    return { props: { user: req.user || null } };
}