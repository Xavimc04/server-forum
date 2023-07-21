import { NextApiRequest, NextApiResponse } from "next";  
import prisma from "@/lib/prisma"; 
import { setCookie } from "cookies-next";
import generateRandomToken from "@/lib/tokenGen";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method == 'GET') {
        const { steam } = req.query as { steam: string };

        if(!steam) {
            return res.send({ done: false, message: 'Steam para required...' });
        }

        const userAccount = await prisma.users.findFirst({
            where: {
                steam: steam || ''
            }
        })
    
        return res.status(200).send({ done: true, user: userAccount });
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
                identifier: userAccount.identifier
            }, 
            data: {
                session_token: newToken
            }
        }); 

        setCookie('session_token', newToken, { req, res, maxAge: 60 * 60 * 24 });

        return res.send({ done: true });
    }
}