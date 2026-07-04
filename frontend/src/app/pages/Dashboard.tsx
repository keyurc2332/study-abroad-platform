import React from 'react';
import { Container } from '../components/Layout/Container';
import { Card, CardHeader, CardTitle, CardDescription, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { CheckCircle, Calendar, BookOpen, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  return (
      <Container size="lg" className="py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back! 👋</h1>
          <p className="text-slate-600 mt-2">Let's continue your study abroad journey</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: <CheckCircle className="text-emerald-500" />, label: 'Applications', value: '3' },
            { icon: <Calendar className="text-blue-500" />, label: 'Upcoming Deadlines', value: '2' },
            { icon: <BookOpen className="text-purple-500" />, label: 'Documents Done', value: '8/12' },
            { icon: <AlertCircle className="text-amber-500" />, label: 'To Do', value: '5' },
          ].map((stat, i) => (
            <Card key={i}>
              <div className="flex items-center gap-4">
                <div className="text-2xl">{stat.icon}</div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Button fullWidth size="lg">New Application</Button>
          <Button variant="secondary" fullWidth size="lg">Explore Universities</Button>
          <Button variant="secondary" fullWidth size="lg">Practice Interview</Button>
          <Button variant="secondary" fullWidth size="lg">View Checklist</Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Deadlines */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Don't miss these important dates</CardDescription>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {[
                    { uni: 'MIT', date: 'Jan 15, 2025', days: 12 },
                    { uni: 'Stanford', date: 'Jan 20, 2025', days: 17 },
                    { uni: 'Harvard', date: 'Feb 1, 2025', days: 29 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="font-medium text-slate-900">{item.uni}</p>
                        <p className="text-sm text-slate-500">{item.date}</p>
                      </div>
                      <Badge variant={item.days < 15 ? 'error' : 'warning'}>
                        {item.days} days
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  {[
                    '✅ Uploaded transcript',
                    '📝 Completed essay',
                    '🎓 Took GMAT practice test',
                    '📱 Updated profile',
                  ].map((activity, i) => (
                    <p key={i} className="text-sm text-slate-600">{activity}</p>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </Container>
  );
}