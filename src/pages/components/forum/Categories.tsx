import { ForumCategory } from "@prisma/client"; 
import { useContext, useState } from "react"; 
import { AuthContext } from "@/providers/Auth.context";

export default function Categories() {  
    const { categories } : any = useContext(AuthContext);  
    const [categoryRoute, handleCategoryRoute] = useState<any>([]); 

    return <div className="mx-20 min-w-[300px] max-w-[500px] flex flex-col gap-5">
        <div className="flex items-center mb-5 opacity-60 select-none cursor-pointer">
                <span onClick={() => handleCategoryRoute([])}>Inicio /</span>

                {
                    categoryRoute && categoryRoute[0] && categoryRoute.map((route:any, index:number) => {
                        return <span className="pl-2" key={ index }>{ route.name } /</span>
                    })
                }
            </div> 

        {
            categories && categories.length > 0 ? categories.filter((category: ForumCategory) => {
                if (categoryRoute.length === 0) { 
                    return category.parentId === null;
                } else { 
                    const lastRouteItem = categoryRoute[categoryRoute.length - 1]; 

                    return category.parentId === lastRouteItem.id;
                }
            }).map((category:ForumCategory) => {
                return <div key={ category.id } onClick={() => handleCategoryRoute([
                    ...categoryRoute, category
                ])} className="select-none cursor-pointer hover:text-violet-500 transition-colors"
                    onContextMenu={(e) => {
                        e.preventDefault(); 

                        console.log("Click derecho"); 
                    }}
                >
                    { category.name }
                </div>
            }) : 'Sin categorías registradas'
        }
    </div>
}