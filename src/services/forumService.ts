import instance from "@/lib/instance";

export async function getCategories() {
    try {
        return await instance.get(`/api/forum/categories`).then(response => { 
            return response.data.categories
        })
    } catch (error: any) {
        return false;
    }
}