import { AuthContext } from "@/providers/Auth.context";
import { AnimatePresence, motion } from "framer-motion"
import { useContext, useCallback, useEffect } from 'react'; 
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import instance from "@/lib/instance";

export default function ConfirmationModal() {
    const { state, dispatch } : any = useContext(AuthContext);  

    const escFunction = useCallback((event:any) => {
        if (event.key === "Escape") {
            dispatch({
                type: "SET_SELECTED_ITEM", 
                payload: null
            })
        }
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", escFunction, false);

        return () => {
            document.removeEventListener("keydown", escFunction, false);
        };
    }, [escFunction]);

    return <AnimatePresence>
        {
            state.selected != null && <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed top-0 h-screen w-screen flex items-center justify-center bg-slate-950 bg-opacity-95"
            >
                <div className="max-w-[500px]">
                    <h2 className="poppins text-indigo-500 text-2xl">¿Confirmar compra de { state.selected.name } por { state.selected.price ? state.selected.price : 0 }€?</h2>

                    <p className="mt-5 ">
                        { state.selected.description }
                    </p>

                    <PayPalScriptProvider
                        options={{
                            clientId: "ASY_slC7eqDcO725bpdZeoyGkY5XKNyIY0rX8mCeP57hPgx7YuyLGkZYgzaXe3STm9W-PysXEBS3zoK6"
                        }}
                    >
                        <PayPalButtons
                            createOrder={ async () => {
                                try { 
                                    const response:any = await instance.post('/api/paypal/order', {
                                        price: state.selected.price ? state.selected.price : 0, 
                                        storeItem: state.selected.id
                                    }); 

                                    if (response.data && response.data.id) {
                                        return response.data.id;
                                    } else {
                                        throw new Error("Order ID not found in response");
                                    } 
                                } catch (error) { 
                                    return; 
                                } 
                            }} 

                            onApprove={ async (data, actions:any) => {  
                                return actions.order.capture().then(async function(details:any) { 
                                    await instance.put('/api/paypal/order', {
                                        paymentId: details.id,
                                        status: 1
                                    }).then(response => {
                                        if(!response.data.done) return console.log(response.data.message); 

                                        dispatch({
                                            type: "SET_SELECTED_ITEM", 
                                            payload: null
                                        })
                                    }).catch(error => console.log(error));   
                                });
                            }}

                            style={{ 
                                layout: "horizontal", 
                                color: 'black', 
                                tagline: false,
                            }} 

                            className="mt-7"
                        />
                    </PayPalScriptProvider>
                </div>
            </motion.div>
        }
    </AnimatePresence>
}