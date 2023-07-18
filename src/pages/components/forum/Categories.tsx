import { ForumCategory } from "@prisma/client"; 
import { useContext, useState } from "react"; 
import { AuthContext } from "@/providers/Auth.context";
import ContextMenu, { ContextCoords } from "./ContextMenu";
import { AnimatePresence, motion } from "framer-motion";

export default function Categories() {  
    const { state, dispatch } : any = useContext(AuthContext);  
    const [contextCoords, handleCoords] = useState<ContextCoords>({ x: 0, y: 0 });
    const [contextDisplay, handleContextDisplay] = useState<boolean>(false);  
    const [selectedId, setSelectedId] = useState<number | any>();

    const handleContext = (e: any, id: number) => {
        e.preventDefault(); 

        const { pageX, pageY } = e; 

        handleCoords({
            x: pageX, 
            y: pageY
        });

        setSelectedId(id); 
        handleContextDisplay(true); 
    }

    return <AnimatePresence>
        <div className="mx-10 min-w-[300px] max-w-[500px] flex flex-col gap-5">
            <motion.div
                className="flex items-center mb-5 opacity-60 select-none cursor-pointer"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
            >
                <span onClick={() => dispatch({
                    type: "SET_CATEGORY_ROUTE", 
                    payload: []
                })}>Inicio /</span>

                {
                    state.categoryRoute &&
                    state.categoryRoute.map((route: any, index: number) => {
                        return (
                        <motion.span
                            className="pl-2"
                            key={index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            { route.name } /
                        </motion.span>
                        );
                    })
                }
            </motion.div> 

            {
                state.categories && state.categories.length > 0 ? ( 
                    state.categories.filter((category: ForumCategory) => {
                        if (state.categoryRoute.length === 0) {
                            return category.parentId === null;
                        } else {
                            const lastRouteItem =
                            state.categoryRoute[state.categoryRoute.length - 1];
                            return category.parentId === lastRouteItem.id;
                        }
                    }).map((category: ForumCategory) => {
                        return (
                            <motion.div 
                                key={category.id}
                                onClick={() =>
                                    dispatch({
                                    type: "SET_CATEGORY_ROUTE",
                                    payload: [...state.categoryRoute, category],
                                    })
                                }
                                className="select-none cursor-pointer hover:text-violet-500 transition-colors"
                                onContextMenu={(e) => handleContext(e, category.id)}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -10 }} 
                            >
                            {category.name}
                            </motion.div>
                        );
                    })
                ) : (
                <div>Sin categorías registradas</div>
            )}


            <ContextMenu display={ contextDisplay } coords={ contextCoords } setDisplay={ handleContextDisplay } categoryId={ selectedId } />
        </div>
    </AnimatePresence>
}