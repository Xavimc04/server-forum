import { AuthContext } from "@/providers/Auth.context"
import { getCategories } from "@/services/forumService";
import { ForumCategory, users } from "@prisma/client";
import { useContext } from "react"
import { useEffect, useState } from "react";

export default function Categories() {
    const { player }: users | any = useContext(AuthContext);
    const [categories, setCategories] = useState<ForumCategory[]>(); 
    const [categoryRoute, handleCategoryRoute] = useState<any>([]); 

    useEffect(() => {
        const fetchData = async () => {
            const response = await getCategories(); 

            if(response) {
                setCategories(response); 
            } 
        }

        fetchData();
    }, [])

    return <div className="mr-20 min-w-[300px] max-w-[500px] flex flex-col gap-5">
        {
            player && player.rank != 0 && <button className="w-auto border border-violet-500 py-3 rounded-lg text-violet-500 hover:bg-violet-500 hover:shadow hover:shadow-violet-500 hover:text-slate-950 transition-all">Nueva categoría</button>
        }

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
                ])} className="select-none cursor-pointer hover:text-violet-500 transition-colors">
                    { category.name }
                </div>
            }) : 'Sin categorías registradas'
        }
    </div>
}