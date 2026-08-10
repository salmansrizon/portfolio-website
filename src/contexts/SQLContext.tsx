import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { PGlite } from '@electric-sql/pglite';

type BootStatus = 'idle' | 'booting' | 'seeding' | 'ready' | 'error';

interface SQLContextType {
  db: PGlite | null;
  status: BootStatus;
  error: Error | null;
  /** Boot a fresh, isolated PGLite instance and seed it with the given SQL. */
  bootForChallenge: (initialSql: string) => Promise<void>;
  /** Tear down the current instance (cleanup). */
  teardown: () => void;
}

const SQLContext = createContext<SQLContextType | undefined>(undefined);

export const SQLProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<PGlite | null>(null);
  const [status, setStatus] = useState<BootStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const instanceRef = useRef<PGlite | null>(null);

  const teardown = useCallback(() => {
    if (instanceRef.current) {
      try {
        instanceRef.current.close();
      } catch {
        // Already closed – ignore
      }
      instanceRef.current = null;
    }
    setDb(null);
    setStatus('idle');
    setError(null);
  }, []);

  const bootForChallenge = useCallback(async (initialSql: string) => {
    // Always tear down previous instance first for clean isolation
    teardown();

    setStatus('booting');
    setError(null);

    try {
      const instance = new PGlite();
      await instance.waitReady;
      instanceRef.current = instance;

      setStatus('seeding');
      // Execute multi-statement seed SQL
      await instance.exec(initialSql);

      setDb(instance);
      setStatus('ready');
    } catch (err) {
      console.error('PGLite boot/seed failed:', err);
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      setStatus('error');
    }
  }, [teardown]);

  return (
    <SQLContext.Provider value={{ db, status, error, bootForChallenge, teardown }}>
      {children}
    </SQLContext.Provider>
  );
};

export const useSQL = () => {
  const context = useContext(SQLContext);
  if (context === undefined) {
    throw new Error('useSQL must be used within a SQLProvider');
  }
  return context;
};
