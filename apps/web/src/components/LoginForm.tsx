import React, { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@gestao-compra/ui';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import logobranca from '@/assets/logobranca.png';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Preencha usuário e senha');
      return;
    }

    const result = await login(username, password);

    if (result.success) {
      toast.success('Login realizado com sucesso!');
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
              Use suas credenciais do Protheus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Digite seu usuário"
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
