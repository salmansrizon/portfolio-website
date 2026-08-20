import { Link, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, XCircle, Loader2, Link2 } from 'lucide-react';
import { useCertificate } from '@/hooks/useAssessment';

/**
 * Public certificate verification.
 *
 * A stranger lands here with no other context, so the page states what was
 * assessed *and* what was not. A credential that overclaims gets discounted
 * entirely; naming the scope is what makes it worth checking.
 *
 * Readable without signing in, by design — `certificates` has a public SELECT
 * policy for exactly this.
 */
const VerifyCertificatePage = () => {
  const { id } = useParams<{ id: string }>();
  const { certificate, loading } = useCertificate(id);

  const summary = (certificate?.assessed_summary ?? {}) as Record<string, unknown>;
  const valid = certificate?.status === 'valid';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-xl px-4 pb-20 pt-28">
        {loading ? (
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary opacity-40" />
        ) : !certificate ? (
          <Card>
            <CardContent className="p-8 text-center">
              <XCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <h1 className="text-xl font-bold">No such credential</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                This verification link does not match any certificate we have issued.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className={valid ? 'border-success/40' : 'border-danger/40'}>
              <CardContent className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  {valid ? (
                    <>
                      <ShieldCheck className="h-8 w-8 text-success" />
                      <div>
                        <p className="text-lg font-bold text-success">Valid credential</p>
                        <p className="text-xs text-muted-foreground">Verified just now</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-8 w-8 text-danger" />
                      <div>
                        <p className="text-lg font-bold text-danger">Revoked</p>
                        <p className="text-xs text-muted-foreground">
                          {certificate.revoked_at
                            ? `Revoked ${new Date(certificate.revoked_at).toLocaleDateString()}`
                            : 'This credential is no longer valid'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <dl className="space-y-3 text-sm">
                  {[
                    ['Issued to', certificate.holder_name],
                    ['Credential', certificate.credential_title],
                    ['Issued', new Date(certificate.issued_at).toLocaleDateString(undefined, {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })],
                    ['Credential ID', certificate.id],
                    ['Questions assessed', String(summary.questions ?? '—')],
                    ['Score', summary.score !== undefined ? `${summary.score} of ${summary.questions}` : '—'],
                    ['Conditions', summary.timed_minutes ? `Timed, ${summary.timed_minutes} minutes` : '—'],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between gap-4 border-b pb-2 last:border-0">
                      <dt className="shrink-0 text-muted-foreground">{k}</dt>
                      <dd className="break-all text-right font-medium">{v as string}</dd>
                    </div>
                  ))}
                </dl>

                {/* The scope statement is the point of the page. */}
                <p className="mt-6 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                  {(summary.scope as string) ??
                    'Covers only the portion of this Journey the platform assesses.'}
                </p>
              </CardContent>
            </Card>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="gap-1.5 rounded-full"
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
              >
                <Link2 className="h-4 w-4" /> Copy verification link
              </Button>
              <Button asChild variant="ghost" className="rounded-full">
                <Link to="/career-prep">About Career Prep</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificatePage;
