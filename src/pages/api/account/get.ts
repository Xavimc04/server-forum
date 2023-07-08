import { NextApiRequest, NextApiResponse } from "next";  
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
}