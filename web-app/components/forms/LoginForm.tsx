"use client"
import { useState } from "react"
import { signIn, type SignInResponse } from "next-auth/react"
import { useRouter } from "next/navigation"
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Button, TextField } from "@mui/material";

export default function LoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>(".")
    const router = useRouter()

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(".")

        const res = (await signIn("credentials", {
            redirect: false,
            email,
            password,
        })) as SignInResponse | undefined

        setLoading(false)

        if (res?.error) {
            setError(res.error)
            return
        }

        // success — navigate to home
        router.push("/")
    }

    return (
        <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-6 rounded shadow-xl">
            <div className="flex justify-center mb-10">
                <div className="text-center">
                    <div className="p-2 w-min bg-blue-200 mx-auto rounded-full">
                        <AccountCircleIcon className="text-blue-700" fontSize="large"></AccountCircleIcon>
                    </div>
                    <h2 className="text-3xl mb-4 font-bold">Iniciar sesión</h2>
                    <p>¡Que bueno tenerte de vuelta!</p>
                </div>
            </div>

            <div className="mb-5">
                <TextField label="Correo Electronico" variant="outlined" required type="email"
                    className="block mt-1 block w-full border rounded px-3 py-2"
                    value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>


            <div className="mb-5">
                <TextField label="Contraseña" variant="outlined" required type="password"
                    className="block mt-1 block w-full border rounded px-3 py-2"
                    value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className={`mb-2 text-center ${error !== '.' ? 'text-red-600' : 'text-white'}`}>
                {error}
            </div>
            <Button
                fullWidth
                loading={loading}
                loadingPosition="end"
                variant="contained"
                type="submit">
                Iniciar Sesión
            </Button>
        </form>
    )
}
