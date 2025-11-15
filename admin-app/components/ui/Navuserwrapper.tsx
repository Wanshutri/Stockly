import { signOut } from "next-auth/react";
import Link from "next/link";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

type NavuserwrapperProps = {
    name: string;
    email: string;
    logoutButton?: React.ReactNode;
};

export default function Navuserwrapper({ name, email, logoutButton }: NavuserwrapperProps) {
    return (
        <div className="flex items-center gap-x-4">
            <Link href="/profile" className="flex">
                <div className="text-sm truncate max-w-xs text-black">
                    <p className="text-sm">{name}</p>
                    <p className="text-xs">{email}</p>
                </div>
                <AccountCircleIcon className="text-black mx-1" fontSize="large"></AccountCircleIcon>
            </Link>
            {logoutButton ?? (
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="bg-blue-500 px-3 py-2 text-white  rounded cursor-pointer hover:bg-blue-600 transition-colors duration-150 text-sm">
                    Cerrar sesión
                </button>
            )}
        </div>
    );
}