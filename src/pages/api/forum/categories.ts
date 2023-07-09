import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import DiscordLog from "@/lib/discord";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method == 'GET') {
        const categories = await prisma.forumCategory.findMany(); 
        return res.status(200).send({ categories }); 
    } else if(req.method == 'POST') {
        const { action, name, parent, id } = req.body; 

        switch (action) {
            case "CREATE":
                try {
                    await prisma.forumCategory.create({
                        data: {
                            name, 
                            parentId: parseInt(parent)
                        }
                    })

                    DiscordLog(`Se ha registrado una nueva categoría: ${ name }`);

                    return res.send({ done: true, message: 'New category created.' }); 
                } catch (error) {
                    return res.send({ done: false, message: 'An error has been appeared while creating categories.' }); 
                } 
            case "UPDATE":
                if(!id) {
                    return res.send({ done: false, message: 'Id param is required to do this action.' });
                }

                try {
                    await prisma.forumCategory.update({
                        where: { id }, 
                        data: {
                            name, 
                            parentId: parseInt(parent)
                        }
                    })

                    DiscordLog(`Se ha actualizado una categoría a ${ name }`);

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

                    DiscordLog(`Se ha borrado la categoría con ID: ${ id }`);

                    return res.send({ done: true, message: 'Category has been deleted.' }); 
                } catch (error) {
                    return res.send({ done: false, message: error }); 
                }  
            default:
                return res.send({ done: false, message: "ACTION param required." }); 
        }
    }
} 