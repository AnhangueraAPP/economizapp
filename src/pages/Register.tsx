
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "@/components/RegisterForm";
import { useAuth } from "@/context/AuthContext";
import { DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const Register = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-muted flex flex-col justify-center">
      <div className="text-center mb-6">
        <Link to="/" className="inline-flex items-center">
          <DollarSign className="h-8 w-8 text-finance-primary" />
          <h1 className="text-2xl font-bold">FinClaro</h1>
        </Link>
      </div>
      
      <RegisterForm />
      
      <div className="text-center mt-4">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
};

export default Register;
