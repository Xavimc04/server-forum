import { AuthContext } from "@/providers/Auth.context";
import { motion, AnimatePresence } from "framer-motion"; 
import { useContext, useEffect, useRef } from "react";

export interface ContextCoords {
    x: number, 
    y: number
}

export default function ContextMenu({ coords, display, setDisplay, categoryId } : { coords: ContextCoords, display: boolean, setDisplay: any, categoryId: number  }) {
    const contextMenuRef = useRef<HTMLDivElement>(null);
    const { setDeleting } : any = useContext(AuthContext); 

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                contextMenuRef.current &&
                !contextMenuRef.current.contains(event.target as Node)
            ) {
                setDisplay(false);
            }
        }

        if (display) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [display, setDisplay]);

    return <AnimatePresence>
        {
            display && <motion.div
                ref={ contextMenuRef }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bg-slate-900 p-3 rounded border border-slate-950"
                style={{
                    top: `${ coords.y }px`,
                    left: `${ coords.x }px`,
                    zIndex: 100
                }}
            >
                <button className="flex items-center bg-slate-950 px-7 py-2 w-full rounded hover:bg-violet-500 transition-all hover:text-slate-950">
                    <span className="material-symbols-outlined mr-3">edit</span>

                    Editar
                </button>

                <button onClick={() => {
                    if(categoryId) setDeleting(categoryId)
                    setDisplay(false); 
                }} className="flex items-center mt-2 bg-slate-950 px-7 py-2 rounded hover:bg-violet-500 transition-all hover:text-slate-950">
                    <span className="material-symbols-outlined mr-3">delete</span>

                    Eliminar
                </button>

                <button onClick={() => setDisplay(false)} className="flex items-center mt-2 bg-slate-950 px-7 py-2 w-full rounded hover:bg-violet-500 transition-all hover:text-slate-950">
                    <span className="material-symbols-outlined mr-3">close</span>

                    Cerrar
                </button>
            </motion.div>
        }
    </AnimatePresence>
}