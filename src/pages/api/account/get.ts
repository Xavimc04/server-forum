import { NextApiRequest, NextApiResponse } from "next";  
import prisma from "@/lib/prisma"; 
import { setCookie } from "cookies-next";
import generateRandomToken from "@/lib/tokenGen";
import { getCookie } from 'cookies-next'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method == 'GET') {
        const sessionToken = getCookie('session_token', { req, res }); 

        if(!sessionToken) {
            return res.send({ done: false, message: 'Error al obtener el perfil ingame' });
        }

        const userMain = await prisma.users.findFirst({
            where: {
                session_token: `${ sessionToken }`
            },
        }); 

        if(!userMain) {
            return res.send({ done: false, message: 'No se ha podido encontrar un usuario asignado a esta cuenta de steam.' });
        }

        const userWithLikes = await prisma.users.findFirst({
            where: {
                id: userMain.id
            },
            include: {
                forum_likes: {
                    where: {
                        user_id: { equals: userMain.id },
                    },
                    select: {
                        post_id: true,
                    },
                },
            },
        })
    
        return res.send({ done: true, user: userWithLikes });
    } else if(req.method == 'POST') {
        const { steam } = req.body as { steam: any };

        if(!steam) {
            return res.send({ done: false, message: 'Steam para required...' });
        }

        const userAccount = await prisma.users.findFirst({
            where: {
                steam: steam || ''
            }
        }); 

        if(!userAccount) {
            return res.send({ done: false, message: 'User not fount on database' });
        }

        const newToken = generateRandomToken(20); 

        await prisma.users.update({
            where: {
                id: userAccount.id
            }, 
            data: {
                session_token: newToken
            }
        }); 

        setCookie('session_token', newToken, { req, res, maxAge: 60 * 60 * 24 });

        return res.send({ done: true });
    }
}