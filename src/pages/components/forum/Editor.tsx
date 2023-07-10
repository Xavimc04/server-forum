const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import { motion, AnimatePresence } from "framer-motion"; 
import 'react-quill/dist/quill.snow.css'; 
import dynamic from 'next/dynamic';

const Editor = ({ handleEditor, handleImage, textValue, imageValue } : any) => {
  
    const handleChange = (value:string) => {
        handleEditor(value);
    };

    return (
        <AnimatePresence>
            <div className="mt-5">
                <ReactQuill 
                    value={ textValue }
                    onChange={ handleChange }
                />

                {
                    imageValue && <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        className='flex items-center justify-between mt-5'
                    >
                        <img className='h-16 rounded' src={ URL.createObjectURL(imageValue) } alt='' />

                        <span className='flex-1 ml-5 flex flex-col'>
                            { imageValue.name }
                            <small className='text-gray-300'>{ Math.floor(imageValue.size / 1024) } KB</small>
                        </span>

                        <span onClick={() => handleImage(null) } className='material-symbols-outlined cursor-pointer select-none hover:text-blue-500 transition-all'>remove_selection</span>
                    </motion.div>
                }

                {
                    !imageValue && <motion.div 
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        className="flex items-center mt-5 justify-center w-full"
                    >
                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full border-2 border-gray-50 border-dashed rounded-lg cursor-pointer">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>

                                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Presiona para adjuntar imágenes al post</span></p>
                                <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                            </div>
                    
                            <input id="dropzone-file" value={ imageValue } onChange={(e) => handleImage(e.target.files ? e.target.files[0] : null)} type="file" className="hidden" accept="image/png, image/gif, image/jpeg" />
                        </label>
                    </motion.div>
                } 
            </div> 
        </AnimatePresence>
    );
  };
  
export default Editor;
  