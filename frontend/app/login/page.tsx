"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Invalid email or password");
            }

            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            localStorage.setItem("user", JSON.stringify(data));

            router.push("/");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">

            {/* LEFT SIDE */}
            <section className="auth-image">

                <div className="image-overlay">

                    <div className="logo">
                        ✈ TripMate
                    </div>

                    <div className="image-content">
                        <span>YOUR JOURNEY STARTS HERE</span>

                        <h1>
                            Explore the world.
                            <br />
                            Create memories.
                        </h1>

                        <p>
                            Plan your trips, discover amazing destinations,
                            and manage your entire journey in one place.
                        </p>
                    </div>

                </div>

            </section>

            {/* RIGHT SIDE */}
            <section className="auth-container">

                <div className="auth-card">

                    <div className="mobile-logo">
                        ✈ TripMate
                    </div>

                    <h2>Welcome back</h2>

                    <p className="auth-description">
                        Sign in to continue planning your next adventure.
                    </p>

                    {error && (
                        <div className="error-box">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>

                        <div className="form-group">

                            <label htmlFor="email">
                                Email address
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                        </div>

                        <div className="form-group">

                            <div className="password-header">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <Link href="/forgot-password">
                                    Forgot password?
                                </Link>

                            </div>

                            <div className="password-wrapper">

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>

                            </div>

                        </div>

                        <label className="remember">

                            <input type="checkbox" />

                            <span>Remember me</span>

                        </label>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>

                    </form>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <p className="switch-page">
                        Don't have an account?

                        <Link href="/register">
                            Create an account
                        </Link>
                    </p>

                </div>

            </section>

        </main>
    );
}