import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { UserRound, ExternalLink } from 'lucide-react';
import { useOwnProfile } from '@/hooks/useProfile';

/**
 * Claiming a public profile.
 *
 * Certificates are issued in the name on the profile, so without this a
 * credential reads "Career Prep learner". Public by default, because the profile
 * is an acquisition surface — but the toggle is right there, not buried.
 */
const USERNAME_RE = /^[a-z0-9][a-z0-9-]{2,23}$/;

const ClaimProfileCard = () => {
  const { profile, save } = useOwnProfile();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (profile?.username) {
    return (
      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted">
            <UserRound className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{profile.display_name || profile.username}</p>
            <p className="truncate text-xs text-muted-foreground">/u/{profile.username}</p>
          </div>

          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Public
            <Switch
              checked={profile.is_public}
              onCheckedChange={(v) => save.mutate({ is_public: v })}
            />
          </label>

          <Button asChild size="sm" variant="outline" className="gap-1.5 rounded-full">
            <Link to={`/u/${profile.username}`}>
              View <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const claim = () => {
    const u = username.trim().toLowerCase();
    if (!USERNAME_RE.test(u)) {
      setError('3–24 characters: lowercase letters, numbers and hyphens.');
      return;
    }
    save.mutate(
      { username: u, display_name: displayName.trim() || u, is_public: true },
      {
        onError: (e: any) =>
          setError(
            e?.code === '23505' ? 'That username is taken.' : e?.message ?? 'Could not save that.',
          ),
      },
    );
  };

  return (
    <Card className="mb-6 border-dashed">
      <CardContent className="p-4">
        <p className="mb-1 text-sm font-bold">Claim your public profile</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Your solves and certificates get a shareable page. Certificates are issued in this name.
        </p>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input
            placeholder="username"
            className="h-9"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(null); }}
          />
          <Input
            placeholder="Display name (optional)"
            className="h-9"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Button size="sm" className="h-9 rounded-full" disabled={save.isPending} onClick={claim}>
            Claim
          </Button>
        </div>
        {error && <p className="mt-2 text-[11px] text-danger">{error}</p>}
      </CardContent>
    </Card>
  );
};

export default ClaimProfileCard;
