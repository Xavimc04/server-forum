import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import DiscordLog from "@/lib/discord";
import { getCookie } from 'cookies-next'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method == 'GET') {
        const categories = await prisma.forumCategory.findMany(); 
        return res.status(200).send({ categories }); 
    } else if(req.method == 'POST') {
        const { action, name, parent, id } = req.body; 

        if(action === 'CREATE' || action === 'UPDATE') {
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
            } else if(playerAccount.rank == 0) {
                return res.send({ done: false, message: 'No tienes permisos suficientes como para realizar esta acción' });
            }
        }

        switch (action) {
            case "CREATE":
                try {
                    if (parent) {
                        await prisma.forumCategory.create({
                            data: {
                                name, 
                                parentId: parseInt(parent)
                            }
                        })
                    } else {
                        await prisma.forumCategory.create({
                            data: {
                                name
                            }
                        })
                    }

                    DiscordLog({
                        title: 'Categorías', 
                        message: `Se ha registrado una nueva categoría: ${ name }`
                    });

                    return res.send({ done: true, message: 'New category created.' }); 
                } catch (error) {
                    return res.send({ done: false, message: 'An error has been appeared while creating: ' + error }); 
                } 
            case "UPDATE":
                if(!id) {
                    return res.send({ done: false, message: 'Id param is required to do this action.' });
                }

                try {
                    if (parent) {
                        await prisma.forumCategory.update({
                            where: { id }, 
                            data: {
                                name, 
                                parentId: parseInt(parent)
                            }
                        })
                    } else {
                        await prisma.forumCategory.update({
                            where: { id }, 
                            data: {
                                name
                            }
                        })
                    } 

                    DiscordLog({
                        title: 'Categorías', 
                        message: `Se ha actualizado una categoría a ${ name }`
                    });

                    return res.send({ done: true, message: 'Category has been updated.' }); 
                } catch (error) {
                    return res.send({ done: false, message: error }); 
                }  
            case "DELETE":
                if(!id) {
                    return res.send({ done: false, message: 'Id param is required to do this action.' });
                }

                try {
                    await prisma.forumCategory.delete({
                        where: { id }
                    })

                    DiscordLog({
                        title: 'Categorías', 
                        message: `Se ha borrado la categoría con ID: ${ id }`
                    });

                    return res.send({ done: true, message: 'Category has been deleted.' }); 
                } catch (error) {
                    return res.send({ done: false, message: error }); 
                }  
            default:
                return res.send({ done: false, message: "ACTION param required." }); 
        }
    }
} 