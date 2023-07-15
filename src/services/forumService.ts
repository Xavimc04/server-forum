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

export async function getPosts(STAKE: number, SKIP_VALUE: number, CATEGORY?: string) {
    try {
        return await instance.get(`/api/forum/post?STAKE=${ STAKE }&SKIP_VALUE=${ SKIP_VALUE }&CATEGORY=${ CATEGORY }`).then(response => { 
            return response.data
        })
    } catch (error: any) {
        return error;
    }
}