import { NextApiRequest, NextApiResponse } from "next";
import { getCookie } from 'cookies-next'; 
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { postAction, postId, newState } = req.body || {};
        
    const sessionToken = getCookie('session_token', { req, res }); 

    if(!sessionToken) {
        return res.send({ done: false, message: 'Error al obtener el perfil de Steam' });
    }

    const playerAccount = await prisma.users.findFirst({
        where: {
            session_token: `${ sessionToken }`
        }
    })

    if(!playerAccount) {
        return res.send({ done: false, message: 'Error al obtener el perfil de Steam' });
    }

    if(postAction && postId && postAction == 'TOGGLE_PIN') {
        if(playerAccount && playerAccount?.rank == 0) {
            return res.send({ done: false, message: 'No tienes permisos para realizar esta acción' });
        }

        await prisma.post.update({
            where: {
                id: parseInt(postId)
            }, 
            data: {
                pinned: newState
            }
        })

        return res.send({ done: true, message: 'Post has been updated' }); 
    } else if(postAction && postId && postAction == 'LIKE') {
        const hasLiked = await prisma.forum_likes.findFirst({
            where: {
                user_id: playerAccount.id, 
                post_id: parseInt(postId)
            }
        }); 

        if(hasLiked) {
            await prisma.forum_likes.delete({
                where: {
                    id: hasLiked.id
                }
            });
        } else {
            await prisma.forum_likes.create({
                data: {
                    user_id: playerAccount.id, 
                    post_id: parseInt(postId)
                }
            })
        }

        return res.send({ done: true, message: 'Post has been liked/unliked' }); 
    } else if(postAction && postId && postAction == 'COMMENT') {
        await prisma.forum_comments.create({
            data: {
                id: postId, 
                user_id: playerAccount.id,
                post_id: parseInt(postId), 
                content: newState
            }
        })

        return res.send({ done: true, message: 'New comment has been posted' }); 
    }

    return res.send({ done: false, message: 'All params required' }); 
}