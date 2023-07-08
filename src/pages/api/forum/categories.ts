import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method == 'GET') {
        const categories = await prisma.forumCategory.findMany(); 
        return res.status(200).send({ categories }); 
    }
}