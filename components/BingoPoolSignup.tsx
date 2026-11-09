"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";

export function BingoPoolSignup() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bingo-pool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      setIsSuccess(true);
      setName("");
      setPhoneNumber("");

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign up. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary">Join the bingo pool</h2>
      <p className="mt-3 text-lg">
        Add your name and number and we&apos;ll text you about the prizes for
        getting bingo and for filling the whole board. We only use your number
        for that
      </p>
      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(555) 123-4567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <p className="font-semibold text-destructive" role="alert">
            {error}
          </p>
        )}

        {isSuccess && (
          <p className="flex items-center gap-2 font-semibold" role="status">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            You&apos;re in the pool
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !name.trim() || !phoneNumber.trim()}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Joining
            </>
          ) : (
            "Join the pool"
          )}
        </Button>
      </form>
    </div>
  );
}
