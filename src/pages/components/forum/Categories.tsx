import { ForumCategory } from "@prisma/client"; 
import { useContext, useState } from "react"; 
import { AuthContext } from "@/providers/Auth.context";
import ContextMenu, { ContextCoords } from "./ContextMenu";

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

    return <div className="mx-10 min-w-[300px] max-w-[500px] flex flex-col gap-5">
        <div className="flex items-center mb-5 opacity-60 select-none cursor-pointer">
                <span onClick={() => dispatch({
                    type: "SET_CATEGORY_ROUTE", 
                    payload: []
                })}>Inicio /</span>

                {
                    state.categoryRoute && state.categoryRoute[0] && state.categoryRoute.map((route:any, index:number) => {
                        return <span className="pl-2" key={ index }>{ route.name } /</span>
                    })
                }
            </div> 

        {
            state.categories && state.categories.length > 0 ? state.categories.filter((category: ForumCategory) => {
                if (state.categoryRoute.length === 0) { 
                    return category.parentId === null;
                } else { 
                    const lastRouteItem = state.categoryRoute[state.categoryRoute.length - 1]; 

                    return category.parentId === lastRouteItem.id;
                }
            }).map((category:ForumCategory) => {
                return <div key={ category.id } onClick={() => 
                    dispatch({
                        type: "SET_CATEGORY_ROUTE", 
                        payload: [
                        ...state.categoryRoute, category
                    ]
                })} className="select-none cursor-pointer hover:text-violet-500 transition-colors"
                    onContextMenu={(e) => handleContext(e, category.id) }
                >
                    { category.name }
                </div>
            }) : 'Sin categorías registradas'
        }

        <ContextMenu display={ contextDisplay } coords={ contextCoords } setDisplay={ handleContextDisplay } categoryId={ selectedId } />
    </div>
}