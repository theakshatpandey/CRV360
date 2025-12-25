import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Plus, Clock, MapPin } from 'lucide-react';

export function CalendarModule() {
  const events = [
    { id: 1, title: 'Team Meeting', time: '9:00 AM - 10:00 AM', date: 'Today', type: 'meeting', location: 'Conference Room A' },
    { id: 2, title: 'Project Review', time: '2:00 PM - 3:00 PM', date: 'Today', type: 'review', location: 'Online' },
    { id: 3, title: 'Client Call', time: '11:00 AM - 12:00 PM', date: 'Tomorrow', type: 'call', location: 'Online' },
    { id: 4, title: 'Training Session', time: '3:00 PM - 5:00 PM', date: 'Dec 15', type: 'training', location: 'Training Room' },
  ];

  const upcomingDeadlines = [
    { id: 1, task: 'Project Proposal', deadline: 'Dec 10', priority: 'high' },
    { id: 2, task: 'Code Review', deadline: 'Dec 12', priority: 'medium' },
    { id: 3, task: 'Database Migration', deadline: 'Dec 20', priority: 'low' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Calendar & Events</h2>
          <p className="text-muted-foreground">Manage your schedule and deadlines</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your scheduled events for this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{event.title}</div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{event.time}</span>
                    <span>•</span>
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {event.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deadlines</CardTitle>
            <CardDescription>Important deadlines coming up</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{deadline.task}</div>
                  <div className="text-sm text-muted-foreground">Due: {deadline.deadline}</div>
                </div>
                <Badge 
                  variant={
                    deadline.priority === 'high' ? 'destructive' : 
                    deadline.priority === 'medium' ? 'default' : 'secondary'
                  }
                >
                  {deadline.priority} priority
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendar View</CardTitle>
          <CardDescription>Monthly calendar overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-border rounded-lg">
            <div className="text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Calendar View Placeholder</p>
              <p className="text-sm text-muted-foreground">Interactive calendar would appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total Events</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between">
              <span>Meetings</span>
              <span className="font-medium">5</span>
            </div>
            <div className="flex justify-between">
              <span>Deadlines</span>
              <span className="font-medium">3</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Meetings</span>
              <span className="font-medium">45%</span>
            </div>
            <div className="flex justify-between">
              <span>Reviews</span>
              <span className="font-medium">25%</span>
            </div>
            <div className="flex justify-between">
              <span>Training</span>
              <span className="font-medium">30%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Free Time Today</span>
              <span className="font-medium">4 hours</span>
            </div>
            <div className="flex justify-between">
              <span>Next Available</span>
              <span className="font-medium">Tomorrow 10 AM</span>
            </div>
            <div className="flex justify-between">
              <span>Busy Until</span>
              <span className="font-medium">5:00 PM</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}