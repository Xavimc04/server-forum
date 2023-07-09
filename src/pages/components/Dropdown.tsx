import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; 

interface IElement {
    icon: string, 
    text: string, 
    callback: () => void
}

export default function Dropdown({ children, elements } : { children: React.ReactNode, elements: IElement[] }) {
    const [isOpen, setIsOpen] = useState(false);
  
    const toggleDropdown = () => {
      setIsOpen(!isOpen);
    };
  
    return (
        <div className="relative">
            <div onClick={ toggleDropdown }>
                { children }
            </div>

            <div className={`absolute ${ isOpen ? 'block' : 'hidden' } p-2 transition-all origin-top-right right-0 mt-5 rounded-lg border border-slate-950 bg-slate-900`} style={{
                zIndex: 105
            }}>
                {
                    elements && elements.map((element:IElement, key:number) => {
                        return <DropdownElement key={ key } icon={ element.icon } text={ element.text } callback={() => element.callback()} />
                    })
                }
            </div>
        </div>
    );
}

function DropdownElement({ icon, text, callback } : { icon: string, text: string, callback: () => void }) {
    return <div onClick={ callback } className="flex items-center p-3 hover:bg-violet-500 hover:text-white rounded-lg select-none cursor-pointer transition-all" style={{ whiteSpace: "nowrap" }}>
        <span className="material-symbols-outlined mr-3">{ icon }</span>

        { text }
    </div>
}