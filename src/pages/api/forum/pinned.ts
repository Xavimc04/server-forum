import { NextApiRequest, NextApiResponse } from "next";
import { getCookie } from 'cookies-next'; 
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { postAction, postId, newState } = req.body || {};
        
    if(postAction && postId && postAction == 'TOGGLE_PIN') {
        const sessionToken = getCookie('session_token', { req, res }); 

        if(!sessionToken) {
            res.send({ done: false, message: 'Error al obtener el perfil de Steam' });
        }

        const playerAccount = await prisma.users.findFirst({
            where: {
                session_token: `${ sessionToken }`
            }
        })

        if(!playerAccount) {
            res.send({ done: false, message: 'Error al obtener el perfil de Steam' });
        }

        if(playerAccount && playerAccount?.rank == 0) {
            res.send({ done: false, message: 'No tienes permisos para realizar esta acción' });
        }

        await prisma.post.update({
            where: {
                id: parseInt(postId)
            }, 
            data: {
                pinned: newState
            }
        })

        const updatedPost = await prisma.post.findFirst({
            where: {
                id: parseInt(postId)
            }
        })

        return res.send({ done: true, message: 'Post has been updated', post: updatedPost }); 
    }

    return res.send({ done: false, message: 'All params required' }); 
}