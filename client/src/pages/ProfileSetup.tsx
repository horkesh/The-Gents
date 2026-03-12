import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProfileSetupForm } from '@/components/profile/ProfileSetupForm';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { Button } from '@/components/ui/Button';
import { fadeIn, scaleReveal } from '@/lib/animations';
import type { ParticipantProfile } from '@the-toast/shared';

export function ProfileSetup() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ParticipantProfile | null>(null);

  const handleSubmit = async (name: string, photo: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('role', 'guest');
      formData.append('photo', photo);

      const res = await fetch('/api/profiles/generate', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to generate profile');

      const data = await res.json();

      const generatedProfile: ParticipantProfile = {
        id: crypto.randomUUID(),
        name,
        alias: data.alias,
        role: 'guest',
        photoUrl: URL.createObjectURL(photo),
        portraitUrl: data.portraitBase64
          ? `data:image/png;base64,${data.portraitBase64}`
          : URL.createObjectURL(photo),
        traits: data.traits,
        dossier: data.dossier,
        connected: true,
      };

      setProfile(generatedProfile);

      // Store in sessionStorage for lobby/party use
      sessionStorage.setItem('theToast_profile', JSON.stringify({
        id: generatedProfile.id,
        name: generatedProfile.name,
        role: generatedProfile.role,
        photoUrl: generatedProfile.photoUrl,
        alias: generatedProfile.alias,
        portraitUrl: generatedProfile.portraitUrl,
        traits: generatedProfile.traits,
        dossier: generatedProfile.dossier,
      }));
    } catch (err) {
      console.error('Profile generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate(`/lobby/${code}`);
  };

  return (
    <motion.div {...fadeIn} className="min-h-dvh flex flex-col items-center justify-center px-6 py-8">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <img src="/logo/01_Gold_logo.png" alt="The Gents" className="w-16 h-16 mx-auto mb-4" />
          <p className="label text-gold/50 mb-2">Room {code}</p>
          <h1 className="heading-display text-2xl text-cream">
            {profile ? 'Your Identity' : 'Create Your Identity'}
          </h1>
        </div>

        {profile ? (
          <motion.div {...scaleReveal} className="flex flex-col items-center gap-6">
            <ProfileCard profile={profile} />
            <Button variant="primary" size="lg" onClick={handleContinue} className="w-full">
              ENTER THE PARTY
            </Button>
          </motion.div>
        ) : (
          <ProfileSetupForm onSubmit={handleSubmit} loading={loading} />
        )}
      </div>
    </motion.div>
  );
}
