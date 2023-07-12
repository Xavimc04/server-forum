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
        return res.send({ message: 'Posts' }); 
    } else {
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

        const { editor, title, parent, action } : any = fields; 

        if(!editor || !title || !parent || !action) {
            return res.send({ error: "All params required, form data has no value" });
        } 

        const prismaData = {
            pinned: false, 
            title: title[0], 
            category: parseInt(parent[0]), 
            steam: '123455', 
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

                return res.send({ done: true, message: "POST has been created" });  
            default:
                return res.send({ done: false, message: "ACTION param required." }); 
        }
    }
}
