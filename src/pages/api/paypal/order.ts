import prisma from "@/lib/prisma";
import paypal from "@paypal/checkout-server-sdk";
import { NextApiRequest, NextApiResponse } from "next";
import { getCookie } from 'cookies-next';  

let clientId = process.env.PAYPAL_CLIENT_ID || "";
let clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
let environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
let client = new paypal.core.PayPalHttpClient(environment);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    if (req.method === "POST") {
        const { price, storeItem } = req.body; 

        if(!price || !storeItem) return res.send({
            done: false,
            message: "No se ha encontrado un precio sobre la orden solicitada"
        })

        const request = new paypal.orders.OrdersCreateRequest();
        
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: price.toString(),
                    }
                },
            ],
        });
        
        const response = await client.execute(request);
        
        await prisma.forum_payments.create({
            data: {
                orderId: `${  response.result.id }`, 
                userId: playerAccount.id, 
                storeItem, 
                status: 0
            }
        }) 

        return res.json({ id: response.result.id });
    } else if(req.method === 'PUT') {
        const { paymentId, status } = req.body;

        if(!paymentId || !status) return res.send({
            done: false,
            message: "No se ha encontrado un precio sobre la orden solicitada"
        }); 
        
        const doesPaymentExist = await prisma.forum_payments.findFirst({
            where: {
                orderId: {
                    equals: paymentId
                }
            }
        });

        if(doesPaymentExist && doesPaymentExist.orderId) {
            const updated = await prisma.forum_payments.update({
                where: {
                    id: doesPaymentExist.id
                },
                data: {
                    status: status
                }
            });

            if(updated) {
                return res.send({
                    done: true, 
                    message: "Pago actualizado correctamente"
                })
            }
        }

        return res.send({
            done: false, 
            message: "¡Vaya! ha ocurrido un problema cuando se procesaba el pago."
        })
    }
}