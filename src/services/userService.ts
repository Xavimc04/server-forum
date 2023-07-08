import instance from "@/lib/instance";

export async function getUser(steam: string) {
    try {
        return await instance.get(`/api/account/get?steam=${ steam }`).then(response => { 
            return response.data
        })
    } catch (error: any) {
        return false;
    }
}