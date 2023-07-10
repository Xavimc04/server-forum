import { AuthContext } from "@/providers/Auth.context";
import { ForumCategory } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion"; 
import { useContext, useState } from "react";
import instance from "@/lib/instance";
import { getCategories } from "@/services/forumService";

export default function DeletingModal() {
    const { deleting, setDeleting, categories, setCategories } : any = useContext(AuthContext); 
    const [isLoading, handleLoading] = useState<boolean>(false); 

    const onDelete = async () => {
        handleLoading(true); 

        instance.post('/api/forum/categories', {
            action: 'DELETE', 
            id: deleting
        }).then(async () => { 
            handleLoading(false);  
            const reqCategories = await getCategories(); 

            if(reqCategories) {
                setCategories(reqCategories);
            }

            setDeleting(null); 
        })
    }

    return <section className="flex justify-center">
        <AnimatePresence>
            {
                deleting != null && <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    className="absolute bottom-0 bg-slate-900 w-[90%] xl:w-[40%] p-5 rounded-t-lg pb-10" 
                >
                    <div className="flex items-center w-full justify-between flex-wrap">
                        Eliminar categoría

                        <span onClick={() => setDeleting(null)} title="Cerrar modal" className="material-symbols-outlined select-none cursor-pointer text-red-500" style={{
                            textShadow: '0px 0px 10px red'
                        }}>close</span>

                        <p className="w-full mt-4 text-gray-500">
                            ¿Estás seguro de que quieres eliminar la categoría { categories.filter((category: ForumCategory) => category.id == deleting)[0].name }? Una vez aceptes no podrás revertir los cambios.
                        </p>
                    </div>  

                    <div className="flex items-center mt-5 w-full justify-end">
                        <button disabled={ isLoading } onClick={() => onDelete()} className="bg-violet-500 py-2 px-10 rounded shadow shadow-violet-500 hover:bg-violet-700 hover:shadow-violet-700 transition-all">Confirmar</button>
                    </div>

                </motion.div>
            }
        </AnimatePresence>
    </section>
}