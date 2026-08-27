import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROTHEUS_AMBIENTE_OPTIONS, looksLikeEmail, PROTHEUS_EMAIL_LOGIN_BLOCKED_MESSAGE } from '@gestao-compra/shared';

import { useAuth } from '@/contexts/AuthContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  RadioGroup,
  RadioGroupItem,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@gestao-compra/ui';
import { ChevronDown, Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import logobranca from '@/assets/logobranca.png';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ambienteOpen, setAmbienteOpen] = useState(false);
  const { login, isLoading } = useAuth();
  const { ambiente, label: ambienteLabel, setAmbiente } = useEnvironment();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Preencha usuário e senha');
      return;
    }

    if (looksLikeEmail(username)) {
      toast.error(PROTHEUS_EMAIL_LOGIN_BLOCKED_MESSAGE);
      return;
    }

    const result = await login(username, password, ambiente);

    if (result.success) {
      toast.success('Login realizado com sucesso!');
      navigate('/home', { replace: true });
    } else {
      toast.error(result.error || `Não foi possível realizar o login para o usuário ${username}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9F9] p-4">
      <div className="w-full max-w-md animate-fade-in px-2 sm:px-0">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <img
            src={logobranca}
            alt="Oilema - Sementes para o novo campo"
            className="h-16 sm:h-20 w-auto max-w-[280px] object-contain"
          />
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Use o usuário do Protheus, não o e-mail
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Collapsible open={ambienteOpen} onOpenChange={setAmbienteOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="flex flex-col items-start gap-0.5">
                      <span className="text-xs text-muted-foreground">Ambiente</span>
                      <span className="font-medium">{ambienteLabel}</span>
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                        ambienteOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <RadioGroup
                    value={ambiente}
                    onValueChange={(value) => setAmbiente(value as typeof ambiente)}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                    disabled={isLoading}
                  >
                    {PROTHEUS_AMBIENTE_OPTIONS.map((option) => {
                      const selected = option.value === ambiente;
                      return (
                        <Label
                          key={option.value}
                          htmlFor={`ambiente-${option.value}`}
                          className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-normal ${
                            selected
                              ? "border-primary bg-primary/5 font-medium"
                              : "border-input bg-background hover:bg-accent/40"
                          }`}
                        >
                          <RadioGroupItem
                            id={`ambiente-${option.value}`}
                            value={option.value}
                            disabled={isLoading}
                          />
                          <span>{option.label}</span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </CollapsibleContent>
              </Collapsible>
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ex.: daniel.silveira"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default LoginForm;
