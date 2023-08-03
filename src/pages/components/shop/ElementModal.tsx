import instance from "@/lib/instance";
import { AuthContext } from "@/providers/Auth.context";
import { AnimatePresence, motion } from "framer-motion"; 
import { useContext, useEffect, useState } from "react";

export default function ElementModal() {
    const { state, dispatch } : any = useContext(AuthContext);  
    const [error, handleError] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>(''); 
    const [image, setImage] = useState<any>("");
    const [price, setPrice] = useState<number>(0);

    useEffect(() => {
        setName(""); 
        setDescription(""); 
        setImage(""); 
        setPrice(0); 
    }, [state.creating]); 

    const handleCreate = async () => {
        if(name.length == 0 || description.length == 0) return handleError("Por favor, rellena todos los campos");

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('image', image);
        formData.append('price', `${ price }`);

        instance.post('/api/shop/manage', formData).then(response => { 
            if(!response.data.done) return handleError(response.data.message); 

            dispatch({
                type: "SET_CREATING", 
                payload: false
            }); 
        })
    }

    return <section className="flex justify-center">
        <AnimatePresence>
            {
                state.creating && <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    className="fixed bottom-0 bg-slate-900 w-[90%] xl:w-[40%] p-5 rounded-t-lg pb-10" 
                    style={{
                        boxShadow: '0px 0px 40px #020617'
                    }}
                >
                    <div className="flex items-center w-full justify-between flex-wrap">
                        Crear elemento

                        <span onClick={() => dispatch({
                            type: "SET_CREATING", 
                            payload: false
                        })} title="Cerrar modal" className="material-symbols-outlined select-none cursor-pointer text-red-500" style={{
                            textShadow: '0px 0px 10px red'
                        }}>close</span> 
                    </div>  

                    <div className="w-full mt-5 flex items-center flex-wrap">  
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

                        <input type="text" value={ name } onChange={(e) => setName(e.target.value)} maxLength={ 35 } className="bg-slate-950 w-full rounded py-2 flex-1 px-4" placeholder="Título del Post (Max: 35 carácteres)" />
                    
                        <input
                            type="number"
                            placeholder="0€"
                            value={ price }
                            onKeyUp={(e:any) => { 
                                const numericValue = e.target.value.replace(/[^0-9]/g, '');
                                setPrice(parseInt(numericValue));
                            }}
                            onChange={(e) => setPrice(parseInt(e.target.value))}
                            className="bg-slate-950 ml-0 md:ml-5 py-2 rounded px-4 mt-5 md:mt-0 w-full md:w-auto" 
                        />

                        <textarea placeholder="Descripción del producto" value={ description } onChange={(e) => setDescription(e.target.value)} className="w-full mt-5 bg-slate-950 rounded py-4 px-4 min-h-[150px]" />
                    </div>

                    {
                        image && <motion.div
                            initial={{ opacity: 0, y: "100%" }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: "100%" }}
                            className='flex items-center justify-between mt-5'
                        >
                            <img className='h-16 rounded' src={ URL.createObjectURL(image) } alt='' />

                            <span className='flex-1 ml-5 flex flex-col'>
                                { image.name }
                                <small className='text-gray-300'>{ Math.floor(image.size / 1024) } KB</small>
                            </span>

                            <span onClick={() => setImage(null) } className='material-symbols-outlined cursor-pointer select-none hover:text-blue-500 transition-all'>remove_selection</span>
                        </motion.div>
                    }

                    {
                        !image && <motion.div 
                            initial={{ opacity: 0, y: "100%" }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: "100%" }}
                            className="flex items-center mt-5 justify-center w-full"
                        >
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full border-2 border-gray-50 border-dashed rounded-lg cursor-pointer">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>

                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Presiona para adjuntar imágenes al post</span></p>
                                    <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                                </div>
                        
                                <input id="dropzone-file" value={ image } onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} type="file" className="hidden" accept="image/png, image/gif, image/jpeg" />
                            </label>
                        </motion.div>
                    } 


                    <div className="flex items-center mt-5 w-full justify-end">
                        <button onClick={() => handleCreate()} className="bg-violet-500 py-2 px-10 rounded shadow shadow-violet-500 hover:bg-violet-700 hover:shadow-violet-700 transition-all">Confirmar</button>
                    </div>

                </motion.div>
            }
        </AnimatePresence>
    </section>
}