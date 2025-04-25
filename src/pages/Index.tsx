
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, BarChart3, ListChecks, Settings, PieChart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <DollarSign className="h-6 w-6 text-finance-primary mr-2" />
            <h1 className="text-xl font-bold">FinClaro</h1>
          </div>
          <div>
            {user ? (
              <Link to="/dashboard">
                <Button>
                  Ir para Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="outline">Entrar</Button>
                </Link>
                <Link to="/register">
                  <Button>Registrar</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-finance-light py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Controle financeiro simples e eficiente
              </h1>
              <p className="text-lg mb-8">
                Gerencie suas finanças pessoais com facilidade, visualize seus gastos e receitas em um só lugar.
              </p>
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="mr-4">
                    Ir para Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link to="/register">
                    <Button size="lg">
                      Começar agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">
                      Já tenho uma conta
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="/placeholder.svg" 
                alt="Financial dashboard illustration" 
                className="max-w-full h-auto"
                width={500}
                height={400}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Recursos do FinClaro</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 bg-finance-light rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-finance-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visualização clara</h3>
              <p className="text-muted-foreground">
                Veja de maneira rápida e intuitiva quanto você gastou e recebeu no mês selecionado.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 bg-finance-light rounded-full flex items-center justify-center mb-4">
                <ListChecks className="h-6 w-6 text-finance-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Despesas fixas</h3>
              <p className="text-muted-foreground">
                Controle suas despesas recorrentes de forma simples e organizada.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="h-12 w-12 bg-finance-light rounded-full flex items-center justify-center mb-4">
                <PieChart className="h-6 w-6 text-finance-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Categorias personalizadas</h3>
              <p className="text-muted-foreground">
                Crie e personalize categorias para organizar seus gastos da maneira que faz mais sentido para você.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-finance-light">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Comece agora a controlar suas finanças</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Registre-se gratuitamente e comece a ter mais clareza e controle sobre seu dinheiro.
          </p>
          {user ? (
            <Link to="/dashboard">
              <Button size="lg">
                Ir para Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <Button size="lg">
                  Criar conta grátis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Já tenho uma conta
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <DollarSign className="h-5 w-5 text-finance-primary mr-2" />
              <span className="font-bold">FinClaro</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2025 FinClaro. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
