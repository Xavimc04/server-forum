import { Inter } from 'next/font/google'
import Head from 'next/head' 
import Navigator from './components/Navigator'

const inter = Inter({ subsets: ['latin'] })

export default function Layout({ children } : { children: React.ReactNode }) {
    return <main
        className={ `${ inter.className } min-h-screen min-w-screen bg-slate-950 text-white`}
    >
        <Head>
            <title>Luck Community</title>
        </Head>

        <Navigator />

        { children }
    </main> 
} 