import React, { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { useI18n } from "../../../app/providers/I18nProvider";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Label } from "../../../shared/ui/label";

export function LoginForm() {
  const { translate } = useI18n();
  const { login, error, loading } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      // error is set in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{translate("auth.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{translate("auth.password")}</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full"
          />
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        <Button
          type="submit"
          disabled={loading || submitting}
          className="w-full"
        >
          {submitting || loading ? translate("auth.signingIn") : translate("auth.signIn")}
        </Button>
      </form>
    </div>
  );
}
