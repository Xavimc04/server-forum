import { motion, AnimatePresence } from "framer-motion"; 
import { useState, useEffect } from "react";
import { ForumCategory } from "@prisma/client";
import { getCategories } from "@/services/forumService";
import instance from "@/lib/instance"; 

export default function CategoryModal({ isVisible, closeModal } : { isVisible: boolean, closeModal: any }) {
    const [categories, setCategories] = useState<ForumCategory[]>();  
    const [name, handleName] = useState<string>(); 
    const [parent, setParent] = useState<string>(); 
    const [error, handleError] = useState<string>();
    const [isLoading, handleLoading] = useState<boolean>(false); 

    useEffect(() => {
        handleError('');
        handleName(''); 

        const fetchData = async () => {
            const response = await getCategories(); 

            if(response) {
                setCategories(response); 
            }  
        }

        fetchData();
    }, [isVisible]);

    const onCreate = async () => { 
        if(!name || name.length <= 0) {
            return handleError("Por favor, introduce un nombre para poder crear una categoría."); 
        }

        handleLoading(true); 

        instance.post('/api/forum/categories', {
            action: 'CREATE', 
            name, 
            parent
        }).then(() => { 
            handleLoading(false); 
            closeModal(false); 
        })
    } 

    return <section className="flex justify-center">
        <AnimatePresence>
            {
                isVisible && <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    className="absolute bottom-0 bg-slate-900 w-[90%] xl:w-[40%] p-5 rounded-t-lg pb-10" 
                >
                    <div className="flex items-center w-full justify-between flex-wrap">
                        Nueva categoría

                        <span onClick={() => closeModal(false)} title="Cerrar modal" className="material-symbols-outlined select-none cursor-pointer text-red-500" style={{
                            textShadow: '0px 0px 10px red'
                        }}>close</span>

                        <p className="w-full mt-4 text-gray-500">
                            En esta sección podrás crear categorías de manera indefinida, solamente deberás introducir 2 parámetros como son el nombre de la categoría y el identificador del padre, es decir, si quieres que aparezca en una subcategoría o que aparezca en la sección principal.
                        </p>
                    </div> 

                    <div className="flex flex-wrap flex-col md:flex-row items-center mt-10 w-full justify-between">
                        {
                            error && error.length > 0 && <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-red-500 mb-2 w-full"
                            >
                                * { error }
                            </motion.p>
                        }

                        <input disabled={ isLoading } type="text" value={ name } onChange={(e) => handleName(e.target.value)} maxLength={ 35 } className="bg-slate-950 w-full rounded py-2 flex-1 px-4" placeholder="Nombre de la categoría (Max: 35 carácteres)" />

                        {
                            categories && categories[0] && <motion.select
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }} 
                                value={ parent }
                                onChange={(e) => setParent(e.target.value)}
                                className="bg-slate-950 ml-0 md:ml-5 py-2.5 rounded px-4 mt-5 md:mt-0 w-full md:w-auto"
                                disabled={ isLoading }
                            >
                                <option value="">Inicio</option>

                                {
                                    categories.map((category: ForumCategory) => {
                                        return <option key={ category.id } value={ category.id }>{ category.name }</option>
                                    })
                                }
                            </motion.select>
                        }
                    </div>

                    <div className="flex items-center mt-5 w-full justify-end">
                        <button disabled={ isLoading } onClick={() => onCreate()} className="bg-violet-500 py-2 px-10 rounded shadow shadow-violet-500 hover:bg-violet-700 hover:shadow-violet-700 transition-all">Crear</button>
                    </div>

                </motion.div>
            }
        </AnimatePresence>
    </section>
}