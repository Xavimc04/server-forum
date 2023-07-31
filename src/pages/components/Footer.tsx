export default function Footer() {  
    return <div className="w-full bg-transparent opacity-80 mt-20 flex items-center justify-center p-5">
        © Luck community, todos los derechos reservados.

        <div className="flex items-center gap-3 ml-10">
            <img draggable={ false } className="h-5 cursor-pointer" onClick={() => window.open("https://instagram.com/") } src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png" alt="instagram" />
            <img draggable={ false } className="h-5 cursor-pointer" onClick={() => window.open("https://discord.gg/") } src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" alt="discord" />
        </div>
    </div>
}