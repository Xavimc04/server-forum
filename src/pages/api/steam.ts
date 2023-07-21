import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next'; 
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const apiKey = 'D0A50CD896E06BAC8646691127F91AA5';

    const sessionToken = getCookie('session_token', { req, res }); 

    if(!sessionToken) {
        res.send({ error: 'Error al obtener el perfil de Steam' });
    }

    const playerAccount = await prisma.users.findFirst({
        where: {
            session_token: `${ sessionToken }`
        }
    })

    if(!playerAccount) {
        res.send({ error: 'Error al obtener el perfil de Steam' });
    }

    try {
        const response = await axios.get(
            `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${ apiKey }&steamids=${ playerAccount?.steam }`
        );

        res.send(response.data);
    } catch (error) {
        res.send({ error: 'Error al obtener el perfil de Steam' });
    }
}