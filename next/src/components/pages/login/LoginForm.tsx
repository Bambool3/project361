"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { SyntheticEvent } from "react";
import { Building, Lock, Mail } from "lucide-react";

export default function LoginForm() {
    const r = useRouter();

    async function submitForm(e: SyntheticEvent) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const result = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
        });

        if (result?.error) {
            alert("No Email or incorrect password");
        } else {
            r.push("/dashboard");
        }
    }
    return (
        <>
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
                {/* Header with Logo and Title */}
                <div className="text-center">
                    <div className="flex items-center justify-center mx-auto mb-4 h-16 w-16 bg-violet-100 rounded-2xl">
                        {/* Placeholder for your CMUPA logo */}
                        <Building className="w-9 h-9 text-violet-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">CMUPA</h1>
                    <p className="mt-2 text-md text-gray-600">
                        Sign in to access
                    </p>
                </div>

                {/* Login Form */}
                <form className="mt-8 space-y-6" onSubmit={submitForm}>
                    <div className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-gray-700 sr-only"
                            >
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full px-3 py-3 pl-10 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                                    placeholder="Email address"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-gray-700 sr-only"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full px-3 py-3 pl-10 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 sm:text-sm"
                                    placeholder="Password"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                            />
                            <label
                                htmlFor="remember-me"
                                className="block ml-2 text-sm text-gray-900"
                            >
                                Remember me
                            </label>
                        </div>

                        {/* <div className="text-sm">
                        <a
                            href="#"
                            className="font-medium text-violet-600 hover:text-violet-500"
                        >
                            Forgot your password?
                        </a>
                    </div> */}
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="group relative flex justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-violet-600 border border-transparent rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-200"
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
