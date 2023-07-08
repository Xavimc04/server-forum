import { SteamProfile } from "@/lib/passport";
import { AuthContext } from "@/providers/Auth.context"
import { useContext, useState } from "react"

export default function Navigator() {
    const { user }: SteamProfile | any = useContext(AuthContext); 
    const [display, handleDisplay] = useState<boolean>(false)

    console.log(user); 

    return <div className="sticky top-0 w-full z-40">
        <div className="flex items-center justify-between p-5 bg-gradient-to-b from-black to-transparent z-30">
            <div onClick={() => handleDisplay(!display)} className="material-symbols-outlined text-4xl flex md:hidden transition-all hover:text-violet-500 cursor-pointer select-none">{ display ? 'close' : 'menu' }</div>

            <div className="hidden md:flex items-center transition-all">
                <img className="h-10" src="https://media.discordapp.net/attachments/1126239023866843237/1126240535921840138/1.2.PNG?width=959&height=670" alt="Luck-Community-Logo" />

                <ul className="flex poppins items-center gap-6 ml-10 select-none">
                    <li className="cursor-pointer transition-all hover:text-violet-500">Inicio</li>
                    <li className="cursor-pointer transition-all hover:text-violet-500">Tienda</li>
                    <li className="cursor-pointer transition-all hover:text-violet-500">Contacto</li>
                    <li className="cursor-pointer transition-all hover:text-violet-500">Whitelist</li>
                </ul>
            </div>

            {
                user && user.displayName ? <div className="flex items-center select-none">
                    { user.displayName }

                    <img className="h-11 cursor-pointer rounded-full ml-5" src={ user.photos[1].value } alt="Profile" />
                </div> : <button className="transition-all border border-violet-500 py-3 px-8 text-violet-500 rounded poppins hover:shadow hover:shadow-violet-500 hover:bg-violet-500 hover:text-slate-900" style={{
                    whiteSpace: "nowrap"
                }}>Iniciar sesión</button>
            }
        </div>

        {
            display && <ul className="flex md:hidden bg-slate-950 flex-col poppins px-5 mt-10 items-center gap-6 select-none pb-10">
                <li className="cursor-pointer bg-slate-900 w-full text-center py-2.5 rounded transition-all hover:bg-violet-500">Inicio</li>
                <li className="cursor-pointer bg-slate-900 w-full text-center py-2.5 rounded transition-all hover:bg-violet-500">Tienda</li>
                <li className="cursor-pointer bg-slate-900 w-full text-center py-2.5 rounded transition-all hover:bg-violet-500">Contacto</li>
                <li className="cursor-pointer bg-slate-900 w-full text-center py-2.5 rounded transition-all hover:bg-violet-500">Whitelist</li>
            </ul>
        }
    </div>
}