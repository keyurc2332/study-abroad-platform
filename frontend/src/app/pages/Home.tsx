import React from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Container } from '../components/Layout/Container';
import { Globe, Briefcase, FileText, CheckCircle, Users, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 sticky top-0 z-40 bg-white">
        <Container>
          <div className="h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg" />
              <span className="font-bold text-primary-500">StudyAbroad</span>
            </Link>
            <Link to="/dashboard">
              <Button variant="ghost">Login</Button>
            </Link>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-purple-50">
        <Container>
          <div className="max-w-2xl slide-up">
            <Badge variant="primary">🎓 AI-Powered Platform</Badge>
            <h1 className="text-5xl font-bold text-slate-900 mt-4 leading-tight">
              Your Path to Study Abroad
            </h1>
            <p className="text-xl text-slate-600 mt-6">
              Find the perfect university, ace your visa interview, and track your applications all in one place.
            </p>
            <div className="flex gap-4 mt-8">
              <Link to="/dashboard">
                <Button size="lg">Get Started</Button>
              </Link>
              <Button variant="secondary" size="lg">Learn More</Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <Container>
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Globe size={32} />, title: 'Smart Recommendations', desc: 'AI-powered university matching based on your profile' },
              { icon: <Briefcase size={32} />, title: 'Visa Interview Prep', desc: 'Practice with AI interviewer and get instant feedback' },
              { icon: <FileText size={32} />, title: 'Resume Builder', desc: 'Create professional resumes with AI enhancement' },
              { icon: <CheckCircle size={32} />, title: 'Application Tracker', desc: 'Track all your applications in one place' },
              { icon: <Users size={32} />, title: '100+ Scholarships', desc: 'Find scholarships you qualify for' },
              { icon: <Zap size={32} />, title: 'Complete Tools', desc: 'Cost calculator, visa guide, document checklist' },
            ].map((feature, i) => (
              <Card key={i} hoverable>
                <div className="text-primary-500 mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 mt-2">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary text-white">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Journey?</h2>
            <p className="text-blue-100 mb-8 text-lg">Join thousands of students finding their perfect university</p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-white text-primary-500 hover:bg-slate-100">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-slate-50">
        <Container>
          <div className="text-center text-slate-600">
            <p>&copy; 2024 StudyAbroad. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}