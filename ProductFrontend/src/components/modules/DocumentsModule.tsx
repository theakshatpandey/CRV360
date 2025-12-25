import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { FileText, Upload, Download, Search, MoreHorizontal } from 'lucide-react';

export function DocumentsModule() {
  const documents = [
    { id: 1, name: 'Project Proposal.pdf', size: '2.5 MB', type: 'PDF', uploaded: '2 hours ago', status: 'Active' },
    { id: 2, name: 'User Manual.docx', size: '1.8 MB', type: 'DOCX', uploaded: '1 day ago', status: 'Active' },
    { id: 3, name: 'Financial Report.xlsx', size: '3.2 MB', type: 'XLSX', uploaded: '3 days ago', status: 'Archived' },
    { id: 4, name: 'Meeting Notes.txt', size: '45 KB', type: 'TXT', uploaded: '1 week ago', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Document Management</h2>
          <p className="text-muted-foreground">Store and manage your documents</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>Manage your uploaded documents</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {doc.size} • {doc.type} • Uploaded {doc.uploaded}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={doc.status === 'Active' ? 'default' : 'secondary'}>
                    {doc.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Used</span>
                <span className="font-medium">8.5 GB</span>
              </div>
              <div className="flex justify-between">
                <span>Available</span>
                <span className="font-medium">41.5 GB</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '17%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>File Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>PDF Documents</span>
              <span className="font-medium">124</span>
            </div>
            <div className="flex justify-between">
              <span>Word Documents</span>
              <span className="font-medium">87</span>
            </div>
            <div className="flex justify-between">
              <span>Spreadsheets</span>
              <span className="font-medium">56</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <div className="font-medium">Document uploaded</div>
              <div className="text-muted-foreground">2 hours ago</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">File shared</div>
              <div className="text-muted-foreground">1 day ago</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Document archived</div>
              <div className="text-muted-foreground">3 days ago</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}