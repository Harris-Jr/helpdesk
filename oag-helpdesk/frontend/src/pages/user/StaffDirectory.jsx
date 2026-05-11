import React, { useEffect, useState } from 'react';
import { ITExtension } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Phone, Building2, Briefcase } from 'lucide-react';
import MagnifyingLoader from '@/components/ui/MagnifyingLoader';

export default function StaffDirectory() {
  const [extensions, setExtensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const list = await ITExtension.list('priority_level', 200);
        setExtensions(list || []);
      } catch {
        setExtensions([]);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <MagnifyingLoader fullScreen message="Loading staff directory..." />;

  const filtered = extensions.filter((e) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      e.staff_name?.toLowerCase().includes(q) ||
      e.department?.toLowerCase().includes(q)
    );
  });

  const availabilityColor = {
    Available: 'bg-green-100 text-green-800',
    Busy: 'bg-yellow-100 text-yellow-800',
    Away: 'bg-orange-100 text-orange-800',
    Offline: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Staff Directory</h1>
        <p className="text-gray-600 mt-1">Find IT staff contact information and extensions</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="Search by name or department..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {extensions.length === 0
            ? 'No staff entries available yet.'
            : 'No staff match your search.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ext) => {
            const initials = ext.staff_name
              ?.split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() || '?';
            return (
              <Card key={ext.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-green-700 text-white font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {ext.staff_name}
                      </h3>
                      {ext.availability && (
                        <Badge
                          className={`mt-1 text-xs ${availabilityColor[ext.availability] || ''}`}
                          variant="secondary"
                        >
                          {ext.availability}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="w-4 h-4 text-green-700 flex-shrink-0" />
                      <span className="font-mono font-semibold">
                        {ext.extension_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{ext.department}</span>
                    </div>
                    {ext.specialization && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{ext.specialization}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
