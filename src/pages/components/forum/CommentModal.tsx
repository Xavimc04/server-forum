import { AuthContext } from "@/providers/Auth.context";
import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";

export default function CommentModal({ postComment } : { postComment: () => void }) {
    const { state, dispatch } : any = useContext(AuthContext); 

    return <section className="flex justify-center">
        <AnimatePresence>
            {
                state.commenting && <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    className="fixed bottom-0 bg-slate-900 text-white w-[90%] xl:w-[40%] p-5 rounded-t-lg pb-10" 
                    style={{
                        boxShadow: '0px 0px 70px #020617'
                    }}
                >
                    <div className="flex items-center w-full justify-between flex-wrap">
                        Nuevo comentario

                        <span onClick={() => {
                            dispatch({
                                type: "SET_COMMENTING", 
                                payload: false
                            })
                        }} title="Cerrar modal" className="material-symbols-outlined select-none cursor-pointer text-red-500" style={{
                            textShadow: '0px 0px 10px red'
                        }}>close</span>

                        <p className="w-full mt-4 text-gray-500">
                            Escribe un comentario que quieras añadir a este post. Debes tener en cuenta que deberás seguir unas normas básicas de respeto para que los administradores no puedan borrar este comentario o banearte del foro.
                        </p>
                        
                        <input type="text" value={ state.comment } onChange={(e) => dispatch({
                            type: "SET_COMMENT", 
                            payload: e.target.value
                        })} className="bg-slate-950 w-full mt-5 rounded py-2 flex-1 px-4" placeholder="Contenido del comentario..." />
                    </div>  

                    <div className="flex items-center mt-5 w-full justify-end">
                        <button onClick={() => postComment() } className="bg-violet-500 py-2 px-10 rounded shadow shadow-violet-500 hover:bg-violet-700 hover:shadow-violet-700 transition-all">Crear</button>
                    </div>
                </motion.div>
            }
        </AnimatePresence>
    </section>
}