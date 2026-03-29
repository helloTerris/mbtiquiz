'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { getShareUrl } from '@/engine/consensus/session-manager';

interface ShareLinkGeneratorProps {
  sessionId: string;
}

export function ShareLinkGenerator({ sessionId }: ShareLinkGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = getShareUrl(sessionId);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="text-sm font-mono text-muted uppercase tracking-[0.1em] mb-3">
        Share This Link
      </h3>
      <p className="text-sm text-muted mb-4">
        Send this link to friends or colleagues. They will answer questions about you,
        and you can compare their perception with your self-assessment.
      </p>

      <div className="flex gap-2">
        <div className="flex-1 bg-surface rounded-xl px-4 py-3 font-mono text-sm text-foreground overflow-x-auto whitespace-nowrap">
          {shareUrl}
        </div>
        <Button
          variant={copied ? 'ghost' : 'primary'}
          size="sm"
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
    </div>
  );
}
