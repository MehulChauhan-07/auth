import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  Lock,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: Shield,
      title: "Secure Authentication",
      description:
        "Advanced security with JWT tokens, CSRF protection, and session management.",
    },
    {
      icon: Lock,
      title: "Password Security",
      description:
        "Bcrypt hashing, strong password validation, and reset functionality.",
    },
    {
      icon: Users,
      title: "User Management",
      description:
        "Complete user profiles, verification system, and account management.",
    },
    {
      icon: Zap,
      title: "Modern Stack",
      description:
        "Built with React, Node.js, MongoDB, and modern UI components.",
    },
  ];

  const benefits = [
    "🔐 Secure JWT-based authentication",
    "🛡️ CSRF protection and security headers",
    "📱 Responsive design with dark mode",
    "⚡ Fast and optimized performance",
    "🎨 Modern UI with Shadcn components",
    "📊 Session management and analytics",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 bg-gradient-to-br from-background to-muted/50">
        <div className="container max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  Secure MERN
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {" "}
                    Authentication
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px]">
                  A complete authentication system built with modern
                  technologies. Secure, scalable, and ready for production with
                  beautiful UI components.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Button
                    size="lg"
                    onClick={() => navigate("/dashboard")}
                    className="group"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate("/register")}
                      className="group"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate("/login")}
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </div>

              {/* Benefits List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Element */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                <Card className="relative bg-background/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Authentication Demo
                    </CardTitle>
                    <CardDescription>
                      Experience our secure login system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 bg-muted rounded animate-pulse"></div>
                      <div className="h-8 bg-muted rounded animate-pulse"></div>
                    </div>
                    <div className="h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Why Choose Our Authentication System?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with security, performance, and developer experience in
              mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of developers who trust our authentication system.
            </p>
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="group"
                >
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
