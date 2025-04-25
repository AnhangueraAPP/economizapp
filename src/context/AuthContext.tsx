
import { createContext, useContext, useState, ReactNode } from 'react';
import { Usuario } from '@/types/finance';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  user: Usuario | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultCategories = [
  { id: '1', name: 'Alimentação', color: '#ef4444', isDefault: true },
  { id: '2', name: 'Transporte', color: '#f97316', isDefault: true },
  { id: '3', name: 'Moradia', color: '#8b5cf6', isDefault: true },
  { id: '4', name: 'Lazer', color: '#ec4899', isDefault: true },
  { id: '5', name: 'Saúde', color: '#06b6d4', isDefault: true },
  { id: '6', name: 'Educação', color: '#0ea5e9', isDefault: true },
  { id: '7', name: 'Outros', color: '#6b7280', isDefault: true },
  { id: '8', name: 'Salário', color: '#10b981', isDefault: true },
  { id: '9', name: 'Investimentos', color: '#6366f1', isDefault: true },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(() => {
    const savedUser = localStorage.getItem('financeUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulando uma API de login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar usuário do localStorage (em produção, seria do backend)
      const users = JSON.parse(localStorage.getItem('financeUsers') || '[]');
      const foundUser = users.find((u: any) => u.email === email);
      
      if (!foundUser || foundUser.password !== password) {
        throw new Error('Email ou senha incorretos');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('financeUser', JSON.stringify(userWithoutPassword));
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo(a) de volta, ${foundUser.name || email}!`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante o login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Simulando uma API de registro
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se o usuário já existe
      const users = JSON.parse(localStorage.getItem('financeUsers') || '[]');
      if (users.some((u: any) => u.email === email)) {
        throw new Error('Este email já está registrado');
      }
      
      // Criar novo usuário
      const newUser = {
        id: Date.now().toString(),
        email,
        password, // Em produção, seria criptografado
        name,
        categories: defaultCategories
      };
      
      // Salvar no localStorage (em produção, seria no backend)
      users.push(newUser);
      localStorage.setItem('financeUsers', JSON.stringify(users));
      
      // Fazer login automaticamente
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('financeUser', JSON.stringify(userWithoutPassword));
      
      toast({
        title: "Registro realizado com sucesso",
        description: "Sua conta foi criada e você já está logado!",
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Erro no registro",
        description: error instanceof Error ? error.message : "Ocorreu um erro durante o registro",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('financeUser');
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
