import { motion, AnimatePresence } from "framer-motion"; 
import Editor from "./Editor";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/providers/Auth.context";
import { ForumCategory } from "@prisma/client";
import instance from "@/lib/instance";

export default function PostModal() {
    const { user, state, dispatch } : any = useContext(AuthContext); 
    const [title, handleTitle] = useState<string>(''); 
    const [parent, setParent] = useState<string>(''); 
    const [editor, handleEditor] = useState<string>('');
    const [image, handleImage] = useState<File | any>('');
    const [error, handleError] = useState<string>('');

    useEffect(() => {
        defaultValues(); 
    }, [state.creatingPost])

    const defaultValues = () => {
        handleError(''); 
        setParent(''); 
        handleTitle(''); 
        handleImage(''); 
        handleEditor(''); 
    }

    const onCreate = async () => {
        if(title.length == 0) {
            return handleError("Por favor, rellena el título."); 
        } else if(parent.length == 0) {
            return handleError("Debes escoger una categoría para poder crear el post."); 
        } else if(editor.length == 0) {
            return handleError("Para poder seguir deberás introducir un argumento mínimo en el editor."); 
        }

        if(image) {
            if(Math.floor(image.size / 1024) > 2500) {
                return handleError("No puedes subir un archivo tan pesado, debe pesar como máximo 2.5MB"); 
            }

            if(!image.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
                return handleError("Solamente se aceptan formatos JPG, PNG, GIF"); 
            }
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('parent', parent);
        formData.append('editor', editor);
        formData.append('image', image);
        formData.append('action', 'CREATE');
        formData.append('steam', user._json.steamid); 

        try {
            const response = await instance.post('/api/forum/post', formData);

            if(!response.data.done) {
                return handleError("¡Vaya! Ha aparecido un error mientras se creaba el post...");
            }

            defaultValues(); 
            dispatch({
                type: "SET_CREATING_POST", 
                payload: false
            }); 
        } catch (error) {
            console.error(error);
        }
    }

    return <section className="flex justify-center">
        { state.creatingPost && !state.deleting && 
            <AnimatePresence> 
                <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    className="absolute bottom-0 bg-slate-900 w-[90%] xl:w-[40%] p-5 rounded-t-lg pb-10"
                    style={{
                        boxShadow: '0px 0px 40px #020617'
                    }}
                >
                    <div className="flex items-center w-full justify-between flex-wrap">
                        Nuevo post

                        <span onClick={() => dispatch({
                            type: "SET_CREATING_POST", 
                            payload: false
                        })} title="Cerrar modal" className="material-symbols-outlined select-none cursor-pointer text-red-500" style={{
                            textShadow: '0px 0px 10px red'
                        }}>close</span> 
                    </div>  

                    <div className="w-full mt-10 flex items-center flex-wrap">  
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

                        <input type="text" value={ title } onChange={(e) => handleTitle(e.target.value)} maxLength={ 35 } className="bg-slate-950 w-full rounded py-2 flex-1 px-4" placeholder="Título del Post (Max: 35 carácteres)" />

                        {
                            state.categories && state.categories[0] && <motion.select
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }} 
                                value={ parent }
                                onChange={(e) => setParent(e.target.value)}
                                className="bg-slate-950 ml-0 md:ml-5 py-2.5 rounded px-4 mt-5 md:mt-0 w-full md:w-auto" 
                            >
                                <option value=""></option>

                                {
                                    state.categories.map((category: ForumCategory) => {
                                        return <option key={ category.id } value={ category.id }>{ category.name }</option>
                                    })
                                }
                            </motion.select>
                        } 
                    </div>

                    <Editor textValue={ editor } imageValue={ image } handleEditor={ handleEditor } handleImage={ handleImage } />

                    <div className="flex items-center mt-5 w-full justify-end">
                        <button onClick={() => onCreate()} className="bg-violet-500 py-2 px-10 rounded shadow shadow-violet-500 hover:bg-violet-700 hover:shadow-violet-700 transition-all">Crear</button>
                    </div>
                </motion.div> 
            </AnimatePresence> 
        }
    </section>
}