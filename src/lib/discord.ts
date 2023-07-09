import instance from "./instance";

export default async function DiscordLog(message: string) {
    try {
        await instance.post('https://discord.com/api/webhooks/1127611390773964871/SPEOSQX_0pe_pZX4-VvkoS1EhiELUcd8JNcY9n_KhU5OvVm2CvzuW4-9XYfslAR34Anh', {
            content: message
        }); 
    } catch (error) {
        return false; 
    }
}