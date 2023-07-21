import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import path from "path";
import fs from "fs/promises";
import prisma from "@/lib/prisma";
import DiscordLog from "@/lib/discord";

export const config = {
    api: {
        bodyParser: false
    }
}

const readFile = (
    req: NextApiRequest,
    saveLocally?: boolean
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
    const options: formidable.Options = {};

    if (saveLocally) {
        options.uploadDir = path.join(process.cwd(), "/public/images");
        options.filename = (name, ext, path, form) => {
            return Date.now().toString() + "_" + path.originalFilename;
        };
    }

    options.maxFileSize = 4000 * 1024 * 1024;

    const form = formidable(options);

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            resolve({ fields, files });
        });
    });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === 'GET') {
        const { SKIP_VALUE, CATEGORY, STAKE, POST_ID } : any = req.query; 

        if(POST_ID) {
            try {
                const singlePost = await prisma.post.findFirst({
                    where: {
                        id: parseInt(String(POST_ID))
                    }
                }); 

                if(!singlePost) return res.send({ done: false, message: "¡Vaya! Parece que el post que estás buscando no existe..." }); 

                await prisma.post.update({
                    where: {
                        id: parseInt(String(POST_ID))
                    }, 
                    data: {
                        views: singlePost.views ? singlePost.views + 1 : 1
                    }
                })
    
                return res.send({ done: true, post: singlePost }); 
            } catch (error) {
                return res.send({ done: false, message: "¡Vaya! Parece que el post que estás buscando no existe..." }); 
            }
        } else {  
            const skipValue = parseInt(String(SKIP_VALUE), 10) || 0;
            const stakeValue = parseInt(String(STAKE), 10) || 0;
            const categoryValue = parseInt(String(CATEGORY), 10);
    
            const posts = await prisma.post.findMany({
                take: stakeValue,
                skip: skipValue,
                orderBy: [
                    { pinned: 'desc' },
                    { likes: 'desc' }, 
                    { views: 'desc' }
                ],
                ...(categoryValue && { where: { category: categoryValue } })
            });
    
            const counter = await prisma.post.count();
    
            return res.send({ done: true, posts, counter }); 
        }
    } else if(req.method == 'POST') {
        try {
            await fs.readdir(path.join(process.cwd() + "/public", "/images"));
        } catch (error) {
            await fs.mkdir(path.join(process.cwd() + "/public", "/images"));
        }
        
        const fileRes = await readFile(req, true);
        const { fields, files } = fileRes;

        if (!fields || Object.keys(fields).length === 0) {
            return res.send({ error: "All params required, form data has no value" });
        }

        const { editor, title, parent, action, steam } : any = fields; 

        if(!editor || !title || !parent || !action || !steam) {
            return res.send({ error: "All params required, form data has no value" });
        } 

        const prismaData = {
            pinned: false, 
            title: title[0], 
            category: parseInt(parent[0]), 
            steam: steam[0], 
            content: editor[0], 
            banner: ''
        }

        const imageFile: any = files.image; 
        
        if (imageFile && imageFile[0] && imageFile[0].newFilename) {
            prismaData.banner = imageFile[0].newFilename
        }

        switch (action[0]) {
            case 'CREATE':
                await prisma.post.create({
                    data: prismaData
                })    

                DiscordLog({
                    title: 'Nuevo post', 
                    message: title[0]
                });

                return res.send({ done: true, message: "POST has been created" });  
            default:
                return res.send({ done: false, message: "ACTION param required." }); 
        }
    }
}
