import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import path from "path";
import { getCookie } from 'cookies-next'; 
import fs from "fs/promises";
import prisma from "@/lib/prisma";

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
        const storeElements = await prisma.forum_store_items.findMany(); 

        return res.send({
            done: true, 
            storeElements
        }); 
    } else if(req.method === 'POST') {
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

        try {
            await fs.readdir(path.join(process.cwd() + "/public", "/images"));
        } catch (error) {
            await fs.mkdir(path.join(process.cwd() + "/public", "/images"));
        }
        
        const fileRes = await readFile(req, true);
        const { fields, files } = fileRes;

        if (!fields || Object.keys(fields).length === 0) {
            return res.send({ 
                done: false, 
                message: "¡Vaya! No se han recibido todos los parámetros esperados." 
            });
        }

        const { name, description, price, articles } = fields;
        const image: any = files.image; 
        
        if(!name || !description || !price) return res.send({
            done: false, 
            message: "¡Vaya! No se han recibido todos los parámetros esperados."
        }); 

        const prismaData = {
            name: name[0], 
            description: description[0],
            price: parseInt(price[0]),
            image: '', 
            articles: articles && articles[0] ? articles[0] : ""
        } 
        
        if (image && image[0] && image[0].newFilename) {
            prismaData.image = image[0].newFilename
        }

        const created = await prisma.forum_store_items.create({
            data: prismaData
        })  

        if(created) {
            return res.send({
                done: true, 
                message: 'Post has been created'
            });
        } 

        return res.send({
            done: false, 
            message: '¡Vaya! Ha aparecido un error mientras se creaba un producto'
        }); 
    }
}