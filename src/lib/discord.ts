import instance from "./instance";

export interface DiscordProps {
    title: string,
    message: string,
    footer?: string 
}

export default async function DiscordLog({
    title, message, footer
} : DiscordProps) {
    try {
        const embed = {
            title,
            description: message,
            footer: footer ? {
                text: footer
            } : null, 
            author: {
                name: 'ElPatron',
                icon_url: 'https://www.biografiasyvidas.com/biografia/e/fotos/escobar_pablo_7.jpg'
            }
        };

        await instance.post('https://discord.com/api/webhooks/1127611390773964871/SPEOSQX_0pe_pZX4-VvkoS1EhiELUcd8JNcY9n_KhU5OvVm2CvzuW4-9XYfslAR34Anh', {
            embeds: [embed],
            username: 'ElPatron'
        });
    } catch (error) {
        return false;
    }
}
