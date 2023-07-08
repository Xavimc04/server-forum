import { Inter } from 'next/font/google'
import Head from 'next/head' 

const inter = Inter({ subsets: ['latin'] })

export default function Layout({ children } : { children: React.ReactNode }) {
    return <main
        className={ `${ inter.className } h-full w-full bg-slate-950 text-white`}
    >
        <Head>
            <title>Luck Community</title>
        </Head>

        { children }
    </main> 
} 