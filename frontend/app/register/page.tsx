"use client";

import { FormEvent, ChangeEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();

        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Registration failed"
                );
            }

            alert("Registration successful!");

            router.push("/login");

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
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

                        <span>START YOUR ADVENTURE</span>

                        <h1>
                            Your next adventure
                            <br />
                            is waiting.
                        </h1>

                        <p>
                            Create your account and start discovering
                            destinations, planning trips, and creating
                            unforgettable memories.
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

                    <h2>Create your account</h2>

                    <p className="auth-description">
                        Join TripMate and start planning your next journey.
                    </p>


                    {error && (
                        <div className="error-box">
                            {error}
                        </div>
                    )}


                    <form onSubmit={handleRegister}>

                        {/* NAME */}

                        <div className="form-group">

                            <label htmlFor="name">
                                Full name
                            </label>

                            <input
                                id="name"
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                        </div>


                        {/* EMAIL */}

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


                        {/* PASSWORD */}

                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="password-wrapper">

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
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


                        {/* CONFIRM PASSWORD */}

                        <div className="form-group">

                            <label htmlFor="confirmPassword">
                                Confirm password
                            </label>

                            <input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />

                        </div>


                        {/* BUTTON */}

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : "Create account"}
                        </button>

                    </form>


                    <div className="divider">
                        <span>OR</span>
                    </div>


                    <p className="switch-page">

                        Already have an account?

                        <Link href="/login">
                            Sign in
                        </Link>

                    </p>

                </div>

            </section>

        </main>
    );
}
