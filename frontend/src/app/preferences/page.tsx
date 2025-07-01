'use client'

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';
import GlobalLayout from '@/components/GlobalLayout'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { useSavedItems } from '@/hooks/useSavedItems'
import RemoveButton from '@/components/ui/RemoveButton'

interface UserPreferences {
  exportAsPdf: boolean;
  notifications: boolean;
  emailUpdates: boolean;
  darkMode: boolean;
}

export default function PreferencesPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { savedItems, loading: savedItemsLoading, error: savedItemsError, removeSubject, removeCareer } = useSavedItems();
  
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    exportAsPdf: false,
    notifications: true,
    emailUpdates: true,
    darkMode: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [bExportAsPdf, setBExportAsPdf] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const token = await getToken();
        const response = await fetch('/api/preferences', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch preferences');
        }

        const data = await response.json();
        setUserPreferences(data.userPreferences);
        setBExportAsPdf(data.userPreferences.exportAsPdf);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user, getToken]);

  const handleToggle = async (key: keyof UserPreferences) => {
    try {
      setSaving(true);
      const token = await getToken();
      
      const updatedPreferences = {
        ...userPreferences,
        [key]: !userPreferences[key],
      };

      const response = await fetch('/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedPreferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      setUserPreferences(updatedPreferences);
      
      // If enabling PDF export, trigger a download
      if (key === 'exportAsPdf' && !userPreferences[key]) {
        await handlePdfExport();
      }

      toast({
        title: "Preferences Updated",
        description: "Your preferences have been saved successfully.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePdfExport = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/reports/career/pdf', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `career_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "PDF Downloaded",
        description: "Your career report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportAsPdfToggle = () => {
    setBExportAsPdf(!bExportAsPdf);
    handleToggle('exportAsPdf');
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (loading || savedItemsLoading) {
    return <LoadingSpinner />;
  }

  if (error || savedItemsError) {
    return <ErrorMessage message={error || savedItemsError || 'An error occurred'} />;
  }

  return (
    <GlobalLayout>
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          {/* Page Header */}
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <p className="text-[#101518] tracking-light text-[32px] font-bold leading-tight min-w-72">Saved Preferences</p>
          </div>

          {/* Saved Subjects Section */}
          <h3 className="text-[#101518] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Saved Subjects</h3>
          {savedItems.subjects.length > 0 ? (
            savedItems.subjects.map((subject, index) => (
              <div key={index} className="flex items-center gap-4 bg-gray-50 px-4 min-h-14 justify-between">
                <p className="text-[#101518] text-base font-normal leading-normal flex-1 truncate">{subject}</p>
                <div className="shrink-0">
                  <RemoveButton
                    onRemove={() => removeSubject(subject)}
                    itemName={subject}
                    itemType="subject"
                    variant="icon"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 px-4 py-8 text-center">
              <p className="text-gray-500">No saved subjects yet. Complete the career quiz to save your preferred subjects.</p>
            </div>
          )}

          {/* Saved Careers Section */}
          <h3 className="text-[#101518] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Saved Careers</h3>
          {savedItems.careers.length > 0 ? (
            <div className="flex gap-3 p-3 flex-wrap pr-4">
              {savedItems.careers.map((career, index) => (
                <div key={index} className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#eaedf1] pl-4 pr-2">
                  <p className="text-[#101518] text-sm font-medium leading-normal">{career}</p>
                  <RemoveButton
                    onRemove={() => removeCareer(career)}
                    itemName={career}
                    itemType="career"
                    variant="icon"
                    size="sm"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 px-4 py-8 text-center">
              <p className="text-gray-500">No saved careers yet. Complete the career quiz to save your preferred careers.</p>
            </div>
          )}
        </div>
      </div>
    </GlobalLayout>
  )
} 