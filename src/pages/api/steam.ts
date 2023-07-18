import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { steamId } = req.query;
    const apiKey = 'D0A50CD896E06BAC8646691127F91AA5';

    try {
        const response = await axios.get(
            `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${ apiKey }&steamids=${ steamId }`
        );

        res.send(response.data);
    } catch (error) {
        res.send({ error: 'Error al obtener el perfil de Steam' });
    }
}