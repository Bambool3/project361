"use client";
import { Building } from "lucide-react";
import LoginForm from "./_componenets/loginForm";

const LoginPage = () => {
    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                    {/* Header with Logo and Title */}
                    <div className="text-center">
                        <div className="flex items-center justify-center mx-auto mb-4 h-16 w-16 bg-violet-100 rounded-2xl">
                            {/* Placeholder for your CMUPA logo */}
                            <Building className="w-9 h-9 text-violet-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            CMUPA
                        </h1>
                        <p className="mt-2 text-md text-gray-600">
                            Sign in to access
                        </p>
                    </div>

                    {/* Login Form */}
                    <LoginForm />

                    {/* Sign Up Link */}
                    {/* <p className="mt-6 text-sm text-center text-gray-500">
                    Not a member?{" "}
                    <a
                        href="#"
                        className="font-medium text-violet-600 hover:text-violet-500"
                    >
                        Request access
                    </a>
                </p> */}
                </div>
            </div>
        </>
    );
};

export default LoginPage;
